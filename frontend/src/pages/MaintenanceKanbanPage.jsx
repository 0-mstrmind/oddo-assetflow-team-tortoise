import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getMaintenanceRequests,
  addMaintenanceRequest,
  updateMaintenanceStatus,
} from '@/services/api.mock';
import {
  Wrench,
  Plus,
  X,
  AlertTriangle,
  User,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

const COLUMNS = [
  { id: 'pending', label: 'Pending Approval' },
  { id: 'approved', label: 'Approved' },
  { id: 'technician_assigned', label: 'Tech Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
];

export default function MaintenanceKanbanPage() {
  const { isAdmin, isAssetManager } = useAuthStore();
  const canManage = isAdmin || isAssetManager; // manager/admin can approve and drag cards

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    assetTag: '',
    name: '',
    issue: '',
    priority: 'medium',
    technician: '',
  });

  const fetchRequests = async () => {
    setIsLoading(true);
    const data = await getMaintenanceRequests();
    setRequests(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e, cardId) => {
    if (!canManage) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('cardId', cardId);
  };

  const handleDragOver = (e) => {
    if (!canManage) return;
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = async (e, targetStatus) => {
    if (!canManage) return;
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    if (!cardId) return;

    try {
      // Optimistic Update
      setRequests(prev =>
        prev.map(req => (req.id === cardId ? { ...req, status: targetStatus } : req))
      );
      
      await updateMaintenanceStatus(cardId, targetStatus);
    } catch (err) {
      console.error(err);
      fetchRequests(); // Rollback if error
    }
  };

  const handleRaiseRequest = async (e) => {
    e.preventDefault();
    if (!form.assetTag || !form.name || !form.issue) return;

    try {
      await addMaintenanceRequest(form);
      setIsModalOpen(false);
      setForm({
        assetTag: '',
        name: '',
        issue: '',
        priority: 'medium',
        technician: '',
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
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

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh] bg-white rounded-2xl border border-[#F0EBE6] shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
            <p className="text-sm text-[#9CA3AF]">Loading maintenance board...</p>
          </div>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((col) => {
            const columnRequests = requests.filter(r => r.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="bg-white rounded-2xl border border-[#F0EBE6] p-4 flex flex-col min-h-[450px] shadow-[0_1px_3px_rgba(30,32,34,0.02)] shrink-0 w-full"
              >
                {/* Column Title */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#F0EBE6] mb-4">
                  <h3 className="text-xs font-bold text-[#1E2022] uppercase tracking-wider">{col.label}</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-[#FAF7F5] border border-[#F0EBE6] rounded-full text-[#6B7280]">
                    {columnRequests.length}
                  </span>
                </div>

                {/* Cards list */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {columnRequests.map((req) => (
                    <div
                      key={req.id}
                      draggable={canManage}
                      onDragStart={(e) => handleDragStart(e, req.id)}
                      className={`bg-[#FAF7F5] border border-[#E8E2DC] hover:border-[#D97736]/30 p-4 rounded-xl shadow-sm transition-all ${
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
                          <span className="truncate max-w-[80px] text-[#6B7280]">{req.technician}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {columnRequests.length === 0 && (
                    <div className="flex-1 flex items-center justify-center border border-dashed border-[#E8E2DC] rounded-xl py-8 text-center bg-gray-50/50">
                      <p className="text-[10px] text-[#C4BEB8] max-w-[100px] leading-relaxed">Drag assets here for service</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
                <label className="block text-[13px] font-medium text-[#6B7280]">Asset Tag</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AF-0003"
                  value={form.assetTag}
                  onChange={(e) => setForm(prev => ({ ...prev, assetTag: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Epson Printer WF-4830"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 outline-none transition-all"
                />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-[13px] font-medium text-[#6B7280]">Assign Technician</label>
                  <select
                    value={form.technician}
                    onChange={(e) => setForm(prev => ({ ...prev, technician: e.target.value }))}
                    className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                  >
                    <option value="Unassigned">Choose Tech</option>
                    <option value="Jordan Kim">Jordan Kim</option>
                    <option value="Ravi Patel">Ravi Patel</option>
                    <option value="Sarah Mitchell">Sarah Mitchell</option>
                  </select>
                </div>
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
                  className="flex-1 h-11 rounded-xl bg-[#D97736] text-white text-sm font-semibold hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all"
                >
                  Raise Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
