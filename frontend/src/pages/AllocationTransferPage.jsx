import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  getAssets,
  getEmployees,
  getAllocationHistory,
  allocateAsset,
  submitTransferRequest,
} from '@/services/api.mock';
import {
  ArrowRightLeft,
  User,
  Calendar,
  AlertTriangle,
  History,
  Clock,
  ArrowRight,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export default function AllocationTransferPage() {
  const user = useAuthStore(s => s.user);

  // Data lists
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [history, setHistory] = useState([]);

  // Form states
  const [assigneeId, setAssigneeId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  
  // Transfer request states
  const [transferToId, setTransferToId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [transferSuccessMsg, setTransferSuccessMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [assetList, employeeList] = await Promise.all([
        getAssets(),
        getEmployees(),
      ]);
      setAssets(assetList);
      setEmployees(employeeList);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Fetch history and reset state on asset selection change
  useEffect(() => {
    if (selectedAssetId) {
      setErrorMsg('');
      setSuccessMsg('');
      setTransferSuccessMsg('');
      setTransferToId('');
      setTransferReason('');
      setAssigneeId('');
      setExpectedReturnDate('');

      getAllocationHistory(selectedAssetId).then((hist) => {
        setHistory(hist);
      });
    } else {
      setHistory([]);
    }
  }, [selectedAssetId]);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const isAssetAllocated = selectedAsset?.status === 'allocated';
  
  // Find current allocation owner
  const currentAllocation = isAssetAllocated ? history.find(h => h.status === 'active') : null;
  const currentHolderName = currentAllocation ? currentAllocation.employeeName : (selectedAsset?.assignedTo || 'another employee');

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !assigneeId) return;
    setIsSubmitLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await allocateAsset(selectedAssetId, assigneeId, expectedReturnDate, user?.id);
      setSuccessMsg(`Asset successfully allocated to ${employees.find((e) => e.id === assigneeId)?.name}!`);
      // Reload assets list to reflect changed status
      const updatedAssets = await getAssets();
      setAssets(updatedAssets);
      // Reload history
      const hist = await getAllocationHistory(selectedAssetId);
      setHistory(hist);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!selectedAssetId || !transferToId || !transferReason) return;
    setIsSubmitLoading(true);
    setTransferSuccessMsg('');

    try {
      await submitTransferRequest(selectedAssetId, transferToId, transferReason, user?.id);
      setTransferSuccessMsg(`Transfer request submitted successfully. Awaiting approval from department managers.`);
      setTransferToId('');
      setTransferReason('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">
          Asset Allocation & Transfer
        </h1>
        <p className="text-sm text-[#9CA3AF] font-medium">
          Allocate equipment to employees or initiate transfer requests for already assigned assets.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh] bg-white rounded-2xl border border-[#F0EBE6] shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
            <p className="text-sm text-[#9CA3AF]">Loading allocation engine...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Side (2 Columns on Large Screens) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Core Allocation Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)]">
              <h2 className="text-base font-bold text-[#1E2022] mb-5 flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-[#D97736]" />
                Allocate Asset
              </h2>

              <form onSubmit={handleAllocate} className="space-y-5">
                {/* Select Asset */}
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-[#6B7280]">Select Asset to Assign</label>
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    required
                    className={`w-full h-11 px-4 bg-[#FAF7F5] border rounded-xl text-sm text-[#1E2022] focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all ${
                      isAssetAllocated 
                        ? 'border-[#C85C27] focus:border-[#C85C27]' 
                        : 'border-[#E8E2DC] focus:border-[#D97736]/50'
                    }`}
                  >
                    <option value="">Choose Asset (Tag - Name - Status)</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.assetTag} — {a.name} ({a.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Conflict Block UI Warning */}
                {isAssetAllocated && (
                  <div className="bg-[#C85C27]/[0.06] border border-[#C85C27]/15 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex gap-3">
                      <AlertTriangle size={18} className="text-[#C85C27] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[#1E2022]">Already Allocated</p>
                        <p className="text-xs text-[#C85C27] font-semibold mt-0.5">
                          Already Allocated to {currentHolderName}. Direct re-allocation is blocked.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Successful allocation message */}
                {successMsg && (
                  <div className="bg-[#1E4620]/[0.06] border border-[#1E4620]/10 rounded-xl p-3.5 flex items-center gap-2">
                    <CheckCircle size={16} className="text-[#1E4620]" />
                    <p className="text-xs text-[#1E4620] font-semibold">{successMsg}</p>
                  </div>
                )}

                {/* Allocation Fields (Only enabled/visible if asset is NOT allocated) */}
                {!isAssetAllocated && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Assignee */}
                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-medium text-[#6B7280]">Assignee (Employee)</label>
                      <select
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                        required={!!selectedAssetId}
                        disabled={!selectedAssetId}
                        className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white transition-all"
                      >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.departmentName})</option>
                        ))}
                      </select>
                    </div>

                    {/* Expected Return Date */}
                    <div className="space-y-1.5">
                      <label className="block text-[13px] font-medium text-[#6B7280]">Expected Return Date (Optional)</label>
                      <div className="relative">
                        <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                        <input
                          type="date"
                          value={expectedReturnDate}
                          onChange={(e) => setExpectedReturnDate(e.target.value)}
                          disabled={!selectedAssetId}
                          className="w-full h-11 pl-11 pr-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitLoading || !selectedAssetId}
                      className="w-full h-11 bg-[#D97736] text-white text-sm font-semibold rounded-xl hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                    >
                      Assign Asset
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Conditionally Render Transfer Request Form if Asset is Blocked */}
            {isAssetAllocated && (
              <div className="bg-white rounded-2xl p-6 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] animate-in slide-in-from-bottom-2 duration-300">
                <h2 className="text-base font-bold text-[#1E2022] mb-1.5 flex items-center gap-2">
                  <ArrowRightLeft size={18} className="text-[#D97736]" />
                  Raise Transfer Request
                </h2>
                <p className="text-xs text-[#9CA3AF] mb-5">
                  Request transfer of {selectedAsset?.name} from {currentHolderName} to another user.
                </p>

                {transferSuccessMsg && (
                  <div className="bg-[#1E4620]/[0.06] border border-[#1E4620]/10 rounded-xl p-3.5 flex items-center gap-2 mb-4">
                    <CheckCircle size={16} className="text-[#1E4620]" />
                    <p className="text-xs text-[#1E4620] font-semibold">{transferSuccessMsg}</p>
                  </div>
                )}

                <form onSubmit={handleTransfer} className="space-y-4">
                  {/* Transfer To Employee */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-[#6B7280]">Transfer To Employee</label>
                    <select
                      value={transferToId}
                      onChange={(e) => setTransferToId(e.target.value)}
                      required
                      className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] outline-none focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white transition-all"
                    >
                      <option value="">Select Target Assignee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.departmentName})</option>
                      ))}
                    </select>
                  </div>

                  {/* Transfer Reason */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-[#6B7280]">Reason for Transfer</label>
                    <textarea
                      required
                      rows="3"
                      placeholder="e.g. Employee transferred to marketing squad, requires matching laptop setup..."
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                      className="w-full p-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitLoading}
                    className="w-full h-11 bg-[#D97736] text-white text-sm font-semibold rounded-xl hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all active:scale-[0.99]"
                  >
                    Submit Transfer Request
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Allocation History Side */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
              <History size={14} />
              Allocation History
            </h2>

            <div className="bg-white rounded-2xl p-5 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] min-h-[300px]">
              {selectedAssetId ? (
                <div className="relative pl-5 space-y-6 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-[#F0EBE6]">
                  {history.map((hist, i) => (
                    <div key={hist.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-[17px] top-1.5 w-2 h-2 rounded-full border-2 bg-white ${
                        hist.status === 'active' ? 'border-[#D97736]' : 'border-[#9CA3AF]'
                      }`} />
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-[#1E2022]">{hist.employeeName}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                            hist.status === 'active' ? 'bg-[#1E4620]/[0.08] text-[#1E4620]' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {hist.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#9CA3AF]">
                          Assigned: <span className="text-[#6B7280] font-medium">{hist.allocatedAt}</span>
                        </p>
                        {hist.expectedReturnDate && (
                          <p className="text-[10px] text-[#9CA3AF]">
                            Due date: <span className="text-[#6B7280] font-medium">{hist.expectedReturnDate}</span>
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400">Authorized by: {hist.allocatedByName}</p>
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
                    Select an asset from the list to retrieve its historical logs.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
