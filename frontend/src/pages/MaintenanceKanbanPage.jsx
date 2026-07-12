import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  getMaintenanceRequests,
  addMaintenanceRequest,
  updateMaintenanceStatus,
} from '@/services/maintenance.service';
import { getAssets } from '@/services/asset.service';
import { getEmployees } from '@/services/organization.service';
import { toast } from 'sonner';
import {
  Plus,
  X,
  User,
  AlertTriangle,
} from 'lucide-react';

const COLUMNS = [
  { id: 'pending', label: 'Pending Approval' },
  { id: 'approved', label: 'Approved' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
];

export default function MaintenanceKanbanPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'admin';
  const isAssetManager = user?.role === 'manager' || user?.role === 'asset_manager';
  const canManage = isAdmin || isAssetManager; // manager/admin can approve and drag cards

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [pendingDragData, setPendingDragData] = useState(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    assetId: '',
    issue: '',
    priority: 'medium',
  });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getMaintenanceRequests();
      
      const normalizedData = data.map(item => ({
        ...item,
        id: item._id || item.id,
        assetTag: item.assetId?.assetTag || 'N/A',
        name: item.assetId?.name || 'Unknown Asset',
        reportedByName: item.requestedBy?.name || 'Unknown',
        technician: item.technicianId?.name || 'Unassigned',
      }));

      // Deduplicate by ID to heal any corrupt localStorage entries from previous duplication bugs
      const uniqueMap = new Map();
      normalizedData.forEach(item => {
        uniqueMap.set(item.id, item);
      });
      
      setRequests(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error(err);
      toast.error('Failed to retrieve maintenance requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchRequests();

    getAssets()
      .then((list) => setAssets(list.map((a) => ({ ...a, id: a._id || a.id }))))
      .catch((err) => console.error('Error fetching assets:', err));

    getEmployees()
      .then((list) => {
        const filteredTechs = list
          .filter((emp) => emp.role === 'technician')
          .map((emp) => ({ ...emp, id: emp._id || emp.id }));
        setTechnicians(filteredTechs);
      })
      .catch((err) => console.error('Error fetching employees:', err));
  }, []);

  const handleDragEnd = async (result) => {
    if (!canManage) return;
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const targetStatus = destination.droppableId;

    if (targetStatus === 'in-progress') {
      setSelectedTechId('');
      setPendingDragData({
        requestId: draggableId,
        targetStatus,
      });
      return;
    }

    try {
      await updateMaintenanceStatus(draggableId, targetStatus);
      toast.success(`Request status updated to ${targetStatus}`);
      fetchRequests();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      toast.error(msg);
      fetchRequests(); // Rollback on error
    }
  };

  const handleAssignTechnicianSubmit = async (e) => {
    e.preventDefault();
    if (!pendingDragData || !selectedTechId) return;
    setIsSubmitLoading(true);
    try {
      await updateMaintenanceStatus(pendingDragData.requestId, 'in-progress', selectedTechId);
      toast.success('Technician assigned and work started');
      setPendingDragData(null);
      fetchRequests();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      toast.error(msg);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleRaiseRequest = async (e) => {
    e.preventDefault();
    if (!form.assetId || !form.issue) return;
    setIsSubmitLoading(true);

    try {
      const payload = {
        assetId: form.assetId,
        priority: form.priority,
        issue: form.issue,
      };

      await addMaintenanceRequest(payload);
      toast.success('Maintenance request raised successfully');
      setIsModalOpen(false);
      setForm({
        assetId: '',
        issue: '',
        priority: 'medium',
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      toast.error(msg);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const getPriorityBadge = (prio) => {
    const styles = {
      critical: 'bg-[#C85C27]/10 text-[#C85C27]',
      high: 'bg-[#D97736]/10 text-[#D97736]',
      medium: 'bg-[#D49B28]/10 text-[#D49B28]',
      low: 'bg-[#1E4620]/10 text-[#1E4620]',
    };
    return styles[prio] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">
            Maintenance Management
          </h1>
          <p className="text-sm text-[#9CA3AF] font-medium">
            Monitor, assign, and track physical equipment service requests.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D97736] text-white text-sm font-semibold rounded-full hover:bg-[#C85C27] hover:shadow-[0_4px_16px_rgba(217,119,54,0.25)] transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            Raise Request
          </button>
        </div>
      </div>

      {!mounted || isLoading ? (
        <div className="flex items-center justify-center h-[50vh] bg-white rounded-2xl border border-[#F0EBE6] shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
            <p className="text-sm text-[#9CA3AF]">
              {!mounted ? 'Initializing drag context...' : 'Loading maintenance board...'}
            </p>
          </div>
        </div>
      ) : (
        /* hello-pangea/dnd Kanban Board Context */
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none">
            {COLUMNS.map((col) => {
              const columnRequests = requests.filter(r => r.status === col.id);
              
              return (
                <Droppable key={col.id} droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-white rounded-2xl border border-[#F0EBE6] p-4 flex flex-col min-h-[450px] shadow-[0_1px_3px_rgba(30,32,34,0.02)] shrink-0 w-[240px] md:w-[250px] transition-colors duration-200 ${
                        snapshot.isDraggingOver ? 'bg-[#FAF7F5]' : ''
                      }`}
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-[#F0EBE6] mb-4">
                        <h3 className="text-xs font-bold text-[#1E2022] uppercase tracking-wider">{col.label}</h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-[#FAF7F5] border border-[#F0EBE6] rounded-full text-[#6B7280]">
                          {columnRequests.length}
                        </span>
                      </div>

                      {/* Column Cards */}
                      <div className="flex-1 space-y-3 min-h-[300px]">
                        {columnRequests.map((req, index) => (
                          <Draggable
                            key={req.id}
                            draggableId={req.id}
                            index={index}
                            isDragDisabled={!canManage}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                className={`bg-[#FAF7F5] border border-[#E8E2DC] hover:border-[#D97736]/30 p-4 rounded-xl shadow-sm transition-all select-none ${
                                  dragSnapshot.isDragging ? 'shadow-lg rotate-2 scale-[1.02]' : ''
                                } ${
                                  canManage ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'cursor-default'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="font-mono text-[10px] font-bold text-[#9CA3AF]">{req.assetTag}</span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${getPriorityBadge(req.priority)}`}>
                                    {req.priority}
                                  </span>
                                </div>

                                <h4 className="text-xs font-bold text-[#1E2022] mb-1.5 line-clamp-1">{req.name}</h4>
                                <p className="text-[11px] text-[#6B7280] leading-relaxed mb-3 line-clamp-2">{req.issue}</p>

                                <div className="flex items-center justify-between border-t border-[#E8E2DC]/60 pt-2.5">
                                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#9CA3AF]">
                                    <User size={12} />
                                    <span className="truncate max-w-[100px] text-[#6B7280]">{req.technician}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {columnRequests.length === 0 && (
                          <div className="flex-1 flex items-center justify-center border border-dashed border-[#E8E2DC] rounded-xl py-8 text-center bg-gray-50/50 min-h-[100px]">
                            <p className="text-[10px] text-[#C4BEB8] max-w-[100px] leading-relaxed">No service tickets here</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* ─────────────────────────────────────────────────────────────
         RAISE REQUEST MODAL (Premium tactile popup)
         ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6] bg-[#FAF7F5]">
              <h3 className="font-bold text-[#1E2022] text-base">Raise Maintenance Request</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#F4EFEB] hover:text-[#1E2022] transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleRaiseRequest} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Select Asset</label>
                <select
                  required
                  value={form.assetId}
                  onChange={(e) => setForm(prev => ({ ...prev, assetId: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                >
                  <option value="">Choose Asset</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.assetTag} — {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Issue / Fault Details</label>
                <textarea
                  required
                  placeholder="Describe the failure or request detail..."
                  value={form.issue}
                  onChange={(e) => setForm(prev => ({ ...prev, issue: e.target.value }))}
                  rows="3"
                  className="w-full p-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold hover:bg-[#FAF7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="flex-1 h-11 rounded-xl bg-[#D97736] text-white text-sm font-semibold hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Raise Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {pendingDragData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6] bg-[#FAF7F5]">
              <h3 className="font-bold text-[#1E2022] text-base flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#D97736]" />
                Assign Technician
              </h3>
              <button onClick={() => setPendingDragData(null)} className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#F4EFEB] hover:text-[#1E2022] transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAssignTechnicianSubmit} className="p-6 space-y-4">
              <p className="text-xs text-[#6B7280] leading-relaxed">
                You must assign a technician to move this maintenance request to In Progress.
              </p>
              
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Select Technician</label>
                <select
                  required
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                >
                  <option value="">Choose Tech</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPendingDragData(null)}
                  className="flex-1 h-11 rounded-xl border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold hover:bg-[#FAF7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="flex-1 h-11 rounded-xl bg-[#D97736] text-white text-sm font-semibold hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Assign & Start'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
