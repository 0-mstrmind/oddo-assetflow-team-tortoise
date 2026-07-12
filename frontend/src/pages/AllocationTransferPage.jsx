import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getAssets } from '@/services/asset.service';
import { getEmployees } from '@/services/organization.service';
import {
  getAllocationHistory,
  allocateAsset,
  getPendingRequests,
  updateRequestStatus,
  getActiveAllocations,
  revokeAllocation,
  directTransfer,
} from '@/services/allocation.service';
import { toast } from 'sonner';
import {
  ArrowRightLeft,
  Calendar,
  AlertTriangle,
  History,
  CheckCircle,
  HelpCircle,
  ClipboardList,
  CheckCheck,
  XCircle,
  Package,
  User,
  Clock,
  Loader2,
  RefreshCw,
  RotateCcw,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    active:   { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200', label: 'Active' },
    overdue:  { cls: 'bg-red-50 text-red-500 border border-red-200',             label: 'Overdue' },
    returned: { cls: 'bg-gray-100 text-gray-500 border border-gray-200',         label: 'Returned' },
    pending:  { cls: 'bg-amber-50 text-amber-600 border border-amber-200',       label: 'Pending' },
    approved: { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200', label: 'Approved' },
    rejected: { cls: 'bg-red-50 text-red-500 border border-red-200',             label: 'Rejected' },
  }[status] || { cls: 'bg-gray-100 text-gray-500', label: status };
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Active Allocation Card ───────────────────────────────────────
function AllocationCard({ allocation, employees, onRevoke, onTransfer, processingId }) {
  const [showTransfer, setShowTransfer] = useState(false);
  const [toEmployeeId, setToEmployeeId] = useState('');
  const [transferDate, setTransferDate]  = useState('');
  const isProcessing = processingId === allocation._id;

  const asset    = allocation.assetId;
  const employee = allocation.employeeId;
  const allocatedDate = new Date(allocation.allocatedAt || allocation.createdAt)
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const dueDate = allocation.expectedReturnDate
    ? new Date(allocation.expectedReturnDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const isOverdue = allocation.status === 'overdue' ||
    (allocation.expectedReturnDate && new Date(allocation.expectedReturnDate) < new Date());

  const availableEmployees = employees.filter(e => e.id !== (employee?._id || employee?.id));

  const handleTransferSubmit = () => {
    if (!toEmployeeId) { toast.error('Please select a target employee'); return; }
    onTransfer(asset?._id || asset?.id, toEmployeeId, transferDate, allocation._id);
    setShowTransfer(false);
    setToEmployeeId('');
    setTransferDate('');
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-[0_1px_4px_rgba(30,32,34,0.03)] overflow-hidden ${
      isOverdue ? 'border-red-200' : 'border-[#F0EBE6]'
    }`}>
      {isOverdue && (
        <div className="bg-red-50 border-b border-red-100 px-4 py-2 flex items-center gap-2">
          <AlertTriangle size={13} className="text-red-500" />
          <p className="text-[11px] font-semibold text-red-600">Overdue — past expected return date</p>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#D97736]/[0.08] rounded-xl flex items-center justify-center shrink-0">
            <Package size={16} className="text-[#D97736]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="text-sm font-bold text-[#1E2022]">{asset?.name || 'Unknown Asset'}</p>
                <p className="text-[11px] text-[#9CA3AF]">{asset?.assetTag || '—'}</p>
              </div>
              <StatusBadge status={isOverdue ? 'overdue' : allocation.status} />
            </div>

            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <User size={12} className="text-[#9CA3AF]" />
                <p className="text-xs text-[#6B7280]">
                  Held by <span className="font-semibold text-[#1E2022]">{employee?.name || 'Unknown'}</span>
                  <span className="text-[#9CA3AF]"> · {employee?.email}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={12} className="text-[#9CA3AF]" />
                <p className="text-xs text-[#9CA3AF]">
                  Since {allocatedDate}
                  {dueDate && <span className={`ml-2 ${isOverdue ? 'text-red-500 font-semibold' : ''}`}>· Due {dueDate}</span>}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <button
                onClick={() => onRevoke(allocation._id)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-[#6B7280] bg-[#FAF7F5] border border-[#E8E2DC] rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
                Mark Available
              </button>
              <button
                onClick={() => setShowTransfer(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  showTransfer
                    ? 'bg-[#D97736] text-white border border-[#D97736]'
                    : 'text-[#D97736] bg-[#D97736]/[0.06] border border-[#D97736]/20 hover:bg-[#D97736]/10'
                }`}
              >
                <ArrowRightLeft size={11} />
                Transfer
                {showTransfer ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>

            {/* Transfer Form (inline) */}
            {showTransfer && (
              <div className="mt-3 p-4 bg-[#FAF7F5] rounded-xl border border-[#E8E2DC] space-y-3 animate-in fade-in duration-200">
                <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">Transfer to Employee</p>
                <select
                  value={toEmployeeId}
                  onChange={e => setToEmployeeId(e.target.value)}
                  className="w-full h-9 px-3 bg-white border border-[#E8E2DC] rounded-lg text-xs text-[#1E2022] outline-none focus:border-[#D97736]/50 focus:ring-1 focus:ring-[#D97736]/10 transition-all"
                >
                  <option value="">Select target employee…</option>
                  {availableEmployees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.departmentId?.name || 'No Dept'})</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={transferDate}
                    onChange={e => setTransferDate(e.target.value)}
                    placeholder="Expected return (optional)"
                    className="flex-1 h-9 px-3 bg-white border border-[#E8E2DC] rounded-lg text-xs text-[#1E2022] outline-none focus:border-[#D97736]/50 focus:ring-1 focus:ring-[#D97736]/10 transition-all"
                  />
                  <button
                    onClick={handleTransferSubmit}
                    disabled={!toEmployeeId || isProcessing}
                    className="flex items-center gap-1 px-4 py-2 bg-[#D97736] text-white text-[11px] font-bold rounded-lg hover:bg-[#C85C27] transition-all disabled:opacity-50"
                  >
                    <Send size={11} />
                    Transfer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pending Request Card ─────────────────────────────────────────
function PendingRequestCard({ request, onApprove, onReject, processingId }) {
  const isProcessing = processingId === request._id;
  const asset      = request.assetId;
  const requester  = request.requestedBy;
  const toEmployee = request.toEmployeeId;
  const fromEmployee = request.fromEmployeeId;
  const isTransfer   = !!fromEmployee;

  const dateStr = new Date(request.requestedAt || request.createdAt)
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
          <Package size={16} className="text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-sm font-bold text-[#1E2022]">{asset?.name || 'Unknown Asset'}</p>
              <p className="text-[11px] text-[#9CA3AF]">{asset?.assetTag}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              isTransfer ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {isTransfer ? 'Transfer Request' : 'New Request'}
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <User size={12} className="text-[#9CA3AF]" />
              <p className="text-xs text-[#6B7280]">
                From <span className="font-semibold text-[#1E2022]">{requester?.name || toEmployee?.name}</span>
                <span className="text-[#9CA3AF]"> · {requester?.email}</span>
              </p>
            </div>
            {isTransfer && fromEmployee && (
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={12} className="text-[#9CA3AF]" />
                <p className="text-xs text-[#6B7280]">
                  <span className="font-semibold">{fromEmployee.name}</span>
                  {' → '}
                  <span className="font-semibold">{toEmployee?.name}</span>
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-[#9CA3AF]" />
              <p className="text-xs text-[#9CA3AF]">{dateStr}</p>
            </div>
            {request.reason && (
              <div className="p-2.5 bg-[#FAF7F5] rounded-lg border border-[#F0EBE6]">
                <p className="text-[11px] text-[#6B7280] italic">"{request.reason}"</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => onApprove(request._id)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={13} />}
              Approve
            </button>
            <button
              onClick={() => onReject(request._id)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <XCircle size={13} />
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function AllocationTransferPage() {
  const user = useAuthStore(s => s.user);

  // ── Data ──────────────────────────────────────────────────────
  const [assets,            setAssets]            = useState([]);
  const [employees,         setEmployees]         = useState([]);
  const [history,           setHistory]           = useState([]);
  const [activeAllocations, setActiveAllocations] = useState([]);
  const [pendingRequests,   setPendingRequests]   = useState([]);
  const [selectedAssetId,   setSelectedAssetId]   = useState('');

  // ── Form state ────────────────────────────────────────────────
  const [assigneeId,         setAssigneeId]         = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  // ── UI state ──────────────────────────────────────────────────
  const [activeTab,        setActiveTab]        = useState('allocate');
  const [isLoadingInit,    setIsLoadingInit]    = useState(true);
  const [isLoadingActive,  setIsLoadingActive]  = useState(false);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [processingId,     setProcessingId]     = useState(null);
  const [successMsg,       setSuccessMsg]       = useState('');
  const [errorMsg,         setErrorMsg]         = useState('');

  // ── Load assets + employees ───────────────────────────────────
  useEffect(() => {
    async function init() {
      setIsLoadingInit(true);
      try {
        const [assetList, employeeList] = await Promise.all([getAssets(), getEmployees()]);
        setAssets(assetList.map(a => ({ ...a, id: a._id || a.id })));
        setEmployees(employeeList.map(e => ({ ...e, id: e._id || e.id })));
      } catch (err) {
        toast.error('Failed to load assets or employees');
      } finally {
        setIsLoadingInit(false);
      }
    }
    init();
  }, []);

  // ── Load active allocations ───────────────────────────────────
  const loadActiveAllocations = useCallback(async () => {
    setIsLoadingActive(true);
    try {
      const list = await getActiveAllocations();
      // Filter to only active/overdue
      setActiveAllocations(list.filter(a => ['active', 'overdue'].includes(a.status)));
    } catch (err) {
      toast.error('Failed to load active allocations');
    } finally {
      setIsLoadingActive(false);
    }
  }, []);

  // ── Load pending requests ─────────────────────────────────────
  const loadPendingRequests = useCallback(async () => {
    setIsLoadingPending(true);
    try {
      const list = await getPendingRequests();
      setPendingRequests(list);
    } catch (err) {
      toast.error('Failed to load pending requests');
    } finally {
      setIsLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    loadActiveAllocations();
    loadPendingRequests();
  }, [loadActiveAllocations, loadPendingRequests]);

  // ── Load allocation history when asset changes ────────────────
  useEffect(() => {
    if (!selectedAssetId) { setHistory([]); return; }
    setErrorMsg(''); setSuccessMsg('');
    getAllocationHistory(selectedAssetId)
      .then(setHistory)
      .catch(() => toast.error('Failed to load history'));
  }, [selectedAssetId]);

  // ── Derived ───────────────────────────────────────────────────
  const selectedAsset    = assets.find(a => a.id === selectedAssetId);
  const isAssetAllocated = selectedAsset?.status === 'allocated';
  const currentAlloc     = isAssetAllocated ? history.find(h => h.status === 'active') : null;
  const holderName       = currentAlloc?.employeeName || 'another employee';

  // ── Allocate ──────────────────────────────────────────────────
  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !assigneeId) return;
    setIsSubmitting(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await allocateAsset({ assetId: selectedAssetId, employeeId: assigneeId, expectedReturnDate: expectedReturnDate || undefined });
      const emp = employees.find(e => e.id === assigneeId);
      toast.success(`Asset allocated to ${emp?.name}`);
      setSuccessMsg(`Asset successfully allocated to ${emp?.name}!`);
      setAssigneeId(''); setExpectedReturnDate('');
      // Refresh everything
      const [updatedAssets, hist] = await Promise.all([getAssets(), getAllocationHistory(selectedAssetId)]);
      setAssets(updatedAssets.map(a => ({ ...a, id: a._id || a.id })));
      setHistory(hist);
      loadActiveAllocations();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setErrorMsg(msg); toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Revoke (mark available) ───────────────────────────────────
  const handleRevoke = async (allocationId) => {
    setProcessingId(allocationId);
    try {
      await revokeAllocation(allocationId);
      toast.success('Asset marked as available');
      setActiveAllocations(prev => prev.filter(a => a._id !== allocationId));
      const updatedAssets = await getAssets();
      setAssets(updatedAssets.map(a => ({ ...a, id: a._id || a.id })));
      if (selectedAssetId) {
        const hist = await getAllocationHistory(selectedAssetId);
        setHistory(hist);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke allocation');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Direct Transfer ───────────────────────────────────────────
  const handleDirectTransfer = async (assetId, toEmployeeId, expectedReturnDate, allocationId) => {
    setProcessingId(allocationId);
    try {
      const result = await directTransfer(assetId, toEmployeeId, expectedReturnDate);
      const empName = employees.find(e => e.id === toEmployeeId)?.name || 'new employee';
      toast.success(`Asset transferred to ${empName}`);
      await loadActiveAllocations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Approve request ───────────────────────────────────────────
  const handleApprove = async (transferId) => {
    setProcessingId(transferId);
    try {
      await updateRequestStatus(transferId, 'approved');
      toast.success('Request approved — asset allocated!');
      setPendingRequests(prev => prev.filter(r => r._id !== transferId));
      const updatedAssets = await getAssets();
      setAssets(updatedAssets.map(a => ({ ...a, id: a._id || a.id })));
      loadActiveAllocations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Reject request ────────────────────────────────────────────
  const handleReject = async (transferId) => {
    setProcessingId(transferId);
    try {
      await updateRequestStatus(transferId, 'rejected');
      toast.success('Request rejected');
      setPendingRequests(prev => prev.filter(r => r._id !== transferId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessingId(null);
    }
  };

  const TABS = [
    { id: 'allocate', label: 'Allocate Asset',    Icon: ArrowRightLeft },
    { id: 'manage',   label: 'Manage Active',      Icon: Package, badge: activeAllocations.length },
    { id: 'pending',  label: 'Pending Requests',   Icon: ClipboardList, badge: pendingRequests.length, badgeColor: 'amber' },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">
            Asset Allocation & Transfer
          </h1>
          <p className="text-sm text-[#9CA3AF] font-medium">
            Allocate, manage active holdings, and review employee requests.
          </p>
        </div>
        {pendingRequests.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock size={14} className="text-amber-500" />
            <span className="text-sm font-bold text-amber-700">{pendingRequests.length}</span>
            <span className="text-xs text-amber-600">Pending Request{pendingRequests.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] w-fit overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[#1E2022] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#1E2022] hover:bg-[#FAF7F5]'
            }`}
          >
            <tab.Icon size={15} />
            {tab.label}
            {tab.badge > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : tab.badgeColor === 'amber'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-[#F0EBE6] text-[#6B7280]'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ TAB: ALLOCATE ═══ */}
      {activeTab === 'allocate' && (
        isLoadingInit ? (
          <div className="flex items-center justify-center h-[50vh] bg-white rounded-2xl border border-[#F0EBE6]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
              <p className="text-sm text-[#9CA3AF]">Loading…</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)]">
                <h2 className="text-base font-bold text-[#1E2022] mb-5 flex items-center gap-2">
                  <ArrowRightLeft size={16} className="text-[#D97736]" />
                  Allocate Asset to Employee
                </h2>
                <form onSubmit={handleAllocate} className="space-y-5">

                  {/* Asset picker */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-semibold text-[#6B7280]">Select Asset</label>
                    <select
                      value={selectedAssetId}
                      onChange={e => setSelectedAssetId(e.target.value)}
                      required
                      className={`w-full h-11 px-4 bg-[#FAF7F5] border rounded-xl text-sm outline-none focus:bg-white transition-all ${
                        isAssetAllocated
                          ? 'border-red-300 text-red-600 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                          : 'border-[#E8E2DC] text-[#1E2022] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10'
                      }`}
                    >
                      <option value="">Choose Asset (Tag — Name — Status)</option>
                      {assets.map(a => (
                        <option key={a.id} value={a.id} disabled={a.status === 'maintenance' || a.status === 'retired'}>
                          {a.assetTag} — {a.name} [{a.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Already allocated warning */}
                  {isAssetAllocated && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                      <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[#1E2022]">Asset Already Allocated</p>
                        <p className="text-xs text-red-600 mt-0.5">
                          Currently held by <span className="font-semibold">{holderName}</span>.
                          Go to <button type="button" onClick={() => setActiveTab('manage')} className="underline font-semibold">Manage Active</button> to transfer or revoke.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Feedback banners */}
                  {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-2">
                      <CheckCircle size={15} className="text-emerald-600" />
                      <p className="text-xs text-emerald-700 font-semibold">{successMsg}</p>
                    </div>
                  )}
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-center gap-2">
                      <XCircle size={15} className="text-red-500" />
                      <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
                    </div>
                  )}

                  {/* Allocation fields (only if available) */}
                  {!isAssetAllocated && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-semibold text-[#6B7280]">
                          Assignee <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={assigneeId}
                          onChange={e => setAssigneeId(e.target.value)}
                          required={!!selectedAssetId}
                          disabled={!selectedAssetId}
                          className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] disabled:opacity-50 outline-none focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white transition-all"
                        >
                          <option value="">Select Employee…</option>
                          {employees.map(e => (
                            <option key={e.id} value={e.id}>{e.name} — {e.departmentId?.name || 'No Dept'}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-semibold text-[#6B7280]">Expected Return Date (optional)</label>
                        <div className="relative">
                          <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                          <input
                            type="date"
                            value={expectedReturnDate}
                            onChange={e => setExpectedReturnDate(e.target.value)}
                            disabled={!selectedAssetId}
                            className="w-full h-11 pl-10 pr-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] disabled:opacity-50 outline-none focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedAssetId || !assigneeId}
                        className="w-full h-11 bg-[#D97736] text-white text-sm font-bold rounded-xl hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <ArrowRightLeft size={15} />}
                        Assign Asset
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Allocation history */}
            <div>
              <div className="bg-white rounded-2xl p-5 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] min-h-[300px]">
                <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5 mb-4">
                  <History size={12} />Allocation History
                </h3>
                {selectedAssetId ? (
                  history.length === 0 ? (
                    <p className="text-xs text-[#9CA3AF] text-center pt-10">No previous allocations.</p>
                  ) : (
                    <div className="relative pl-5 space-y-5 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-[#F0EBE6]">
                      {history.map(hist => (
                        <div key={hist.id} className="relative">
                          <div className={`absolute -left-[17px] top-1.5 w-2 h-2 rounded-full border-2 bg-white ${
                            hist.status === 'active' ? 'border-[#D97736]' : 'border-[#C4BEB8]'
                          }`} />
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-[#1E2022]">{hist.employeeName}</p>
                            <StatusBadge status={hist.status} />
                          </div>
                          <p className="text-[10px] text-[#9CA3AF] mt-0.5">From: {hist.allocatedAt}</p>
                          {hist.expectedReturnDate && (
                            <p className="text-[10px] text-[#9CA3AF]">Due: {hist.expectedReturnDate}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <HelpCircle size={28} className="text-[#E8E2DC] mb-2" />
                    <p className="text-xs text-[#9CA3AF]">Select an asset to view history</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )
      )}

      {/* ═══ TAB: MANAGE ACTIVE ═══ */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">
              View all active allocations. Mark as available or transfer directly to another employee.
            </p>
            <button
              onClick={loadActiveAllocations}
              className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#D97736] transition-colors"
            >
              <RefreshCw size={12} className={isLoadingActive ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {isLoadingActive ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-[#F0EBE6]">
              <Loader2 size={22} className="animate-spin text-[#D97736]" />
            </div>
          ) : activeAllocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#F0EBE6] gap-3">
              <div className="w-14 h-14 bg-[#F4EFEB] rounded-2xl flex items-center justify-center">
                <Package size={24} className="text-[#D8D2CC]" />
              </div>
              <p className="text-sm font-semibold text-[#6B7280]">No active allocations</p>
              <p className="text-xs text-[#9CA3AF]">All assets are currently available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeAllocations.map(allocation => (
                <AllocationCard
                  key={allocation._id}
                  allocation={allocation}
                  employees={employees}
                  onRevoke={handleRevoke}
                  onTransfer={handleDirectTransfer}
                  processingId={processingId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: PENDING REQUESTS ═══ */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">
              Review and action employee asset requests. Approving immediately allocates the asset.
            </p>
            <button
              onClick={loadPendingRequests}
              className="flex items-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#D97736] transition-colors"
            >
              <RefreshCw size={12} className={isLoadingPending ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {isLoadingPending ? (
            <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-[#F0EBE6]">
              <Loader2 size={22} className="animate-spin text-[#D97736]" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#F0EBE6] gap-3">
              <div className="w-14 h-14 bg-[#F4EFEB] rounded-2xl flex items-center justify-center">
                <ClipboardList size={24} className="text-[#D8D2CC]" />
              </div>
              <p className="text-sm font-semibold text-[#6B7280]">No pending requests</p>
              <p className="text-xs text-[#9CA3AF]">All asset requests have been reviewed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingRequests.map(request => (
                <PendingRequestCard
                  key={request._id}
                  request={request}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  processingId={processingId}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
