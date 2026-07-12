import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getAssets } from '@/services/asset.service';
import { getEmployees } from '@/services/organization.service';
import {
  getAllocationHistory,
  allocateAsset,
  getPendingRequests,
  updateRequestStatus,
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
} from 'lucide-react';

// ─── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    pending:  { cls: 'bg-amber-50 text-amber-600 border border-amber-200',      Icon: Clock,         label: 'Pending' },
    approved: { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200', Icon: CheckCircle,   label: 'Approved' },
    rejected: { cls: 'bg-red-50 text-red-500 border border-red-200',             Icon: XCircle,       label: 'Rejected' },
  }[status] || { cls: 'bg-gray-100 text-gray-500', Icon: Clock, label: status };
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      <cfg.Icon size={10} />
      {cfg.label}
    </span>
  );
}

// ─── Pending Request Card ─────────────────────────────────────────
function PendingRequestCard({ request, onApprove, onReject, isProcessing }) {
  const asset       = request.assetId;
  const requester   = request.requestedBy;
  const toEmployee  = request.toEmployeeId;
  const fromEmployee= request.fromEmployeeId;

  const assetName   = asset?.name    || 'Unknown Asset';
  const assetTag    = asset?.assetTag|| '—';
  const reqName     = requester?.name|| toEmployee?.name || 'Unknown';
  const reqEmail    = requester?.email|| '';
  const dateStr     = new Date(request.requestedAt || request.createdAt)
    .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const isTransfer  = !!fromEmployee;

  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] p-5">
      <div className="flex items-start gap-4">
        {/* Asset icon */}
        <div className="w-11 h-11 bg-[#D97736]/[0.08] rounded-xl flex items-center justify-center shrink-0">
          <Package size={18} className="text-[#D97736]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-bold text-[#1E2022]">{assetName}</p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">{assetTag}</p>
            </div>
            <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isTransfer ? 'bg-blue-50 text-blue-600' : 'bg-[#D97736]/[0.08] text-[#D97736]'
            }`}>
              {isTransfer ? 'Transfer Request' : 'New Asset Request'}
            </span>
          </div>

          {/* Details */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <User size={12} className="text-[#9CA3AF] shrink-0" />
              <p className="text-xs text-[#6B7280]">
                Requested by <span className="font-semibold text-[#1E2022]">{reqName}</span>
                {reqEmail && <span className="text-[#9CA3AF]"> · {reqEmail}</span>}
              </p>
            </div>
            {isTransfer && fromEmployee && (
              <div className="flex items-center gap-2">
                <ArrowRightLeft size={12} className="text-[#9CA3AF] shrink-0" />
                <p className="text-xs text-[#6B7280]">
                  Transfer from <span className="font-semibold text-[#1E2022]">{fromEmployee.name}</span>
                  {' → '}<span className="font-semibold text-[#1E2022]">{toEmployee?.name}</span>
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-[#9CA3AF] shrink-0" />
              <p className="text-xs text-[#9CA3AF]">Submitted {dateStr}</p>
            </div>
            {request.reason && (
              <div className="mt-2 p-3 bg-[#FAF7F5] rounded-xl border border-[#F0EBE6]">
                <p className="text-[11px] text-[#6B7280] italic">"{request.reason}"</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 mt-4">
            <button
              onClick={() => onApprove(request._id)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 hover:shadow-[0_4px_12px_rgba(22,163,74,0.25)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={13} />}
              Approve
            </button>
            <button
              onClick={() => onReject(request._id)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-red-200 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [assets,    setAssets]    = useState([]);
  const [employees, setEmployees] = useState([]);
  const [history,   setHistory]   = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');

  // ── Form state ────────────────────────────────────────────────
  const [assigneeId,          setAssigneeId]          = useState('');
  const [expectedReturnDate,  setExpectedReturnDate]  = useState('');

  // ── UI state ──────────────────────────────────────────────────
  const [activeTab,        setActiveTab]        = useState('allocate'); // 'allocate' | 'pending'
  const [isLoading,        setIsLoading]        = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [processingId,     setProcessingId]     = useState(null); // which request is being approved/rejected
  const [successMsg,       setSuccessMsg]       = useState('');
  const [errorMsg,         setErrorMsg]         = useState('');

  // ── Load core data ────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [assetList, employeeList] = await Promise.all([getAssets(), getEmployees()]);
        setAssets(assetList.map(a => ({ ...a, id: a._id || a.id })));
        setEmployees(employeeList.map(e => ({ ...e, id: e._id || e.id })));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load assets or employees');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Load pending requests ─────────────────────────────────────
  const loadPendingRequests = useCallback(async () => {
    setIsLoadingPending(true);
    try {
      const list = await getPendingRequests();
      setPendingRequests(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending requests');
    } finally {
      setIsLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  // ── Fetch allocation history on asset select ──────────────────
  useEffect(() => {
    if (!selectedAssetId) { setHistory([]); return; }
    setErrorMsg(''); setSuccessMsg(''); setAssigneeId(''); setExpectedReturnDate('');
    getAllocationHistory(selectedAssetId)
      .then(hist => setHistory(hist))
      .catch(err => { console.error(err); toast.error('Failed to fetch allocation history'); });
  }, [selectedAssetId]);

  // ── Derived ───────────────────────────────────────────────────
  const selectedAsset   = assets.find(a => a.id === selectedAssetId);
  const isAssetAllocated= selectedAsset?.status === 'allocated';
  const currentAllocation= isAssetAllocated ? history.find(h => h.status === 'active') : null;
  const currentHolderName= currentAllocation?.employeeName || selectedAsset?.assignedTo || 'another employee';

  // ── Allocate asset ────────────────────────────────────────────
  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !assigneeId) return;
    setIsSubmitting(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await allocateAsset({ assetId: selectedAssetId, employeeId: assigneeId, expectedReturnDate: expectedReturnDate || undefined });
      const emp = employees.find(e => e.id === assigneeId);
      setSuccessMsg(`Asset successfully allocated to ${emp?.name}!`);
      toast.success('Asset allocated successfully');
      const updatedAssets = await getAssets();
      setAssets(updatedAssets.map(a => ({ ...a, id: a._id || a.id })));
      const hist = await getAllocationHistory(selectedAssetId);
      setHistory(hist);
    } catch (err) {
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      setErrorMsg(msg); toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Approve request ───────────────────────────────────────────
  const handleApprove = async (transferId) => {
    setProcessingId(transferId);
    try {
      await updateRequestStatus(transferId, 'approved');
      toast.success('Request approved — asset allocated!');
      setPendingRequests(prev => prev.filter(r => r._id !== transferId));
      // Refresh asset list to reflect new allocation
      const updatedAssets = await getAssets();
      setAssets(updatedAssets.map(a => ({ ...a, id: a._id || a.id })));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  // ── Reject request ────────────────────────────────────────────
  const handleReject = async (transferId) => {
    setProcessingId(transferId);
    try {
      await updateRequestStatus(transferId, 'rejected');
      toast.success('Request rejected.');
      setPendingRequests(prev => prev.filter(r => r._id !== transferId));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">
            Asset Allocation & Transfer
          </h1>
          <p className="text-sm text-[#9CA3AF] font-medium">
            Allocate equipment to employees and review pending asset requests.
          </p>
        </div>

        {/* Pending badge */}
        {pendingRequests.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock size={14} className="text-amber-500" />
            <span className="text-sm font-bold text-amber-700">{pendingRequests.length}</span>
            <span className="text-xs text-amber-600">Pending Request{pendingRequests.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] w-fit">
        {[
          { id: 'allocate', label: 'Allocate Asset',    Icon: ArrowRightLeft },
          { id: 'pending',  label: 'Pending Requests',  Icon: ClipboardList, badge: pendingRequests.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[#1E2022] text-white shadow-sm'
                : 'text-[#6B7280] hover:text-[#1E2022] hover:bg-[#FAF7F5]'
            }`}
          >
            <tab.Icon size={15} />
            {tab.label}
            {tab.badge > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-amber-400 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Allocate ── */}
      {activeTab === 'allocate' && (
        isLoading ? (
          <div className="flex items-center justify-center h-[50vh] bg-white rounded-2xl border border-[#F0EBE6]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
              <p className="text-sm text-[#9CA3AF]">Loading allocation engine...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)]">
                <h2 className="text-base font-bold text-[#1E2022] mb-5 flex items-center gap-2">
                  <ArrowRightLeft size={18} className="text-[#D97736]" />
                  Allocate Asset
                </h2>

                <form onSubmit={handleAllocate} className="space-y-5">
                  {/* Asset selector */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-[#6B7280]">Select Asset</label>
                    <select
                      value={selectedAssetId}
                      onChange={e => setSelectedAssetId(e.target.value)}
                      required
                      className={`w-full h-11 px-4 bg-[#FAF7F5] border rounded-xl text-sm text-[#1E2022] focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all ${
                        isAssetAllocated ? 'border-[#C85C27]' : 'border-[#E8E2DC] focus:border-[#D97736]/50'
                      }`}
                    >
                      <option value="">Choose Asset (Tag — Name — Status)</option>
                      {assets.map(a => (
                        <option key={a.id} value={a.id}>{a.assetTag} — {a.name} ({a.status})</option>
                      ))}
                    </select>
                  </div>

                  {/* Already allocated warning */}
                  {isAssetAllocated && (
                    <div className="bg-[#C85C27]/[0.06] border border-[#C85C27]/15 rounded-xl p-4">
                      <div className="flex gap-3">
                        <AlertTriangle size={18} className="text-[#C85C27] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-[#1E2022]">Already Allocated</p>
                          <p className="text-xs text-[#C85C27] font-semibold mt-0.5">
                            Allocated to {currentHolderName}. Direct re-allocation is blocked.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success message */}
                  {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-600" />
                      <p className="text-xs text-emerald-700 font-semibold">{successMsg}</p>
                    </div>
                  )}

                  {/* Error message */}
                  {errorMsg && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-center gap-2">
                      <XCircle size={16} className="text-red-500" />
                      <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>
                    </div>
                  )}

                  {/* Allocation fields — only if asset is available */}
                  {!isAssetAllocated && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-[#6B7280]">Assignee (Employee)</label>
                        <select
                          value={assigneeId}
                          onChange={e => setAssigneeId(e.target.value)}
                          required={!!selectedAssetId}
                          disabled={!selectedAssetId}
                          className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white transition-all"
                        >
                          <option value="">Select Employee</option>
                          {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.departmentId?.name || 'No Dept'})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-[#6B7280]">Expected Return Date (Optional)</label>
                        <div className="relative">
                          <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                          <input
                            type="date"
                            value={expectedReturnDate}
                            onChange={e => setExpectedReturnDate(e.target.value)}
                            disabled={!selectedAssetId}
                            className="w-full h-11 pl-11 pr-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || !selectedAssetId}
                        className="w-full h-11 bg-[#D97736] text-white text-sm font-semibold rounded-xl hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : null}
                        Assign Asset
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Allocation History sidebar */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
                <History size={14} />
                Allocation History
              </h2>
              <div className="bg-white rounded-2xl p-5 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] min-h-[300px]">
                {selectedAssetId ? (
                  <div className="relative pl-5 space-y-6 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-[#F0EBE6]">
                    {history.map((hist) => (
                      <div key={hist.id} className="relative">
                        <div className={`absolute -left-[17px] top-1.5 w-2 h-2 rounded-full border-2 bg-white ${
                          hist.status === 'active' ? 'border-[#D97736]' : 'border-[#9CA3AF]'
                        }`} />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-[#1E2022]">{hist.employeeName}</p>
                            <StatusBadge status={hist.status} />
                          </div>
                          <p className="text-xs text-[#9CA3AF]">Assigned: <span className="text-[#6B7280] font-medium">{hist.allocatedAt}</span></p>
                          {hist.expectedReturnDate && (
                            <p className="text-[10px] text-[#9CA3AF]">Due: <span className="text-[#6B7280] font-medium">{hist.expectedReturnDate}</span></p>
                          )}
                          <p className="text-[10px] text-gray-400">By: {hist.allocatedByName}</p>
                        </div>
                      </div>
                    ))}
                    {history.length === 0 && (
                      <p className="text-xs text-[#9CA3AF] text-center pt-8">No previous allocations recorded.</p>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-52 text-center">
                    <HelpCircle size={32} className="text-[#E8E2DC] mb-2" />
                    <p className="text-xs text-[#9CA3AF] max-w-[200px] leading-relaxed">
                      Select an asset to view its history.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )
      )}

      {/* ── Tab: Pending Requests ── */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">
              Review and action employee asset requests. Approving will immediately allocate the asset.
            </p>
            <button
              onClick={loadPendingRequests}
              className="flex items-center gap-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#D97736] transition-colors"
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
                  isProcessing={processingId === request._id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
