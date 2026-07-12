import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import {
  getAuditCycles,
  getAuditChecklist,
  getAllCycleResults,
  verifyAuditAsset,
  closeAuditCycle,
  createAuditCycle,
  startAuditCycle,
} from '@/services/audit.service';
import { getAssets } from '@/services/asset.service';
import {
  ClipboardCheck,
  ShieldAlert,
  AlertTriangle,
  FileSpreadsheet,
  X,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AssetAuditPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'admin';
  const isAssetManager = user?.role === 'manager' || user?.role === 'asset_manager';
  const isAuditor = user?.role === 'auditor';
  const isAuthorized = isAdmin || isAssetManager || isAuditor;

  const [activeCycle, setActiveCycle] = useState(null);
  const [auditAssets, setAuditAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Close Audit Summary Modal
  const [summaryReport, setSummaryReport] = useState(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Initiate Audit Cycle Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    scope: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Add Audit Record Modal
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [assetsList, setAssetsList] = useState([]);
  const [recordForm, setRecordForm] = useState({
    assetId: '',
    status: 'verified',
    condition: '',
    remarks: '',
  });

  const openAddRecord = async () => {
    setRecordForm({ assetId: '', status: 'verified', condition: '', remarks: '' });
    try {
      const assets = await getAssets();
      setAssetsList(assets);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load assets list');
    }
    setIsAddRecordOpen(true);
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!activeCycle) return;
    if (!recordForm.assetId) {
      toast.error('Please select an asset');
      return;
    }
    setIsAddingRecord(true);
    try {
      await verifyAuditAsset({
        auditCycleId: activeCycle.id,
        assetId: recordForm.assetId,
        status: recordForm.status,
        remarks: recordForm.remarks || undefined,
        ...(recordForm.condition ? { condition: recordForm.condition } : {}),
      });
      toast.success('Audit record added successfully');
      setIsAddRecordOpen(false);
      fetchAuditData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      toast.error(msg);
    } finally {
      setIsAddingRecord(false);
    }
  };

  const fetchAuditData = async () => {
    setIsLoading(true);
    try {
      const cycles = await getAuditCycles();
      const active = cycles.find(c => c.status === 'in-progress');
      if (active) {
        const activeWithId = { ...active, id: active._id || active.id };
        setActiveCycle(activeWithId);

        // Fetch checklist (scope-filtered assets) + all audit results in parallel
        const [checklistData, rawResults] = await Promise.all([
          getAuditChecklist(activeWithId.id),
          getAllCycleResults(activeWithId.id).catch(() => []),
        ]);

        // Build map from checklist items
        const itemMap = {};
        (checklistData.checklist || []).forEach(item => {
          const id = item.asset._id || item.asset.id;
          itemMap[id] = {
            id,
            assetTag: item.asset.assetTag,
            name: item.asset.name,
            expectedLocation: item.asset.location || 'HQ',
            status: item.auditResult?.status || 'pending',
            remarks: item.auditResult?.remarks || '',
            condition: item.auditResult?.condition || '',
          };
        });

        // Merge in any extra results whose assets weren't in the checklist scope
        rawResults.forEach(result => {
          const assetId = result.assetId?._id || result.assetId?.id || result.assetId;
          const assetObj = result.assetId;
          if (assetId && !itemMap[assetId]) {
            itemMap[assetId] = {
              id: assetId,
              assetTag: typeof assetObj === 'object' ? assetObj.assetTag : '',
              name: typeof assetObj === 'object' ? assetObj.name : assetId,
              expectedLocation: typeof assetObj === 'object' ? (assetObj.location || 'HQ') : 'HQ',
              status: result.status || 'pending',
              remarks: result.remarks || '',
              condition: result.condition || '',
            };
          }
        });

        setAuditAssets(Object.values(itemMap));
      } else {
        setActiveCycle(null);
        setAuditAssets([]);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load audit data');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (isAuthorized) {
      fetchAuditData();
    }
  }, [isAuthorized]);

  // Authorization Guard
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-16 h-16 bg-[#C85C27]/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <ShieldAlert className="text-[#C85C27]" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[#1E2022] tracking-tight mb-2">Access Denied</h1>
        <p className="text-sm text-[#9CA3AF] text-center max-w-sm mb-6 leading-relaxed">
          The Audit module is restricted to Administrators, Asset Managers, and Auditors.
        </p>
        <a
          href="/dashboard"
          className="px-5 py-2.5 bg-[#1E2022] text-white text-sm font-semibold rounded-full hover:bg-[#2D3135] transition-all shadow-[0_2px_8px_rgba(30,32,34,0.06)]"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  const handleVerify = async (assetId, status, remarks = '', condition = '') => {
    if (!activeCycle) return;
    try {
      await verifyAuditAsset({
        auditCycleId: activeCycle.id,
        assetId,
        status,
        remarks,
        ...(condition ? { condition } : {}),
      });
      toast.success('Verification claim submitted successfully');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      toast.error(msg);
      fetchAuditData();
    }
  };

  const handleCloseAudit = async () => {
    if (!activeCycle) return;
    try {
      await closeAuditCycle(activeCycle.id);
      toast.success('Audit cycle closed successfully');

      const total = auditAssets.length;
      const verified = auditAssets.filter(a => a.status === 'verified').length;
      const missing = auditAssets.filter(a => a.status === 'missing').length;
      const damaged = auditAssets.filter(a => a.status === 'damaged').length;
      const pending = auditAssets.filter(a => a.status === 'pending').length;
      const discrepancies = auditAssets.filter(a => a.status === 'missing' || a.status === 'damaged');

      const summary = {
        cycleName: activeCycle.name,
        closedAt: new Date().toISOString().split('T')[0],
        stats: { total, verified, missing, damaged, pending },
        discrepancies,
      };

      setSummaryReport(summary);
      setIsSummaryOpen(true);
      fetchAuditData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      toast.error(msg);
    }
  };

  const handleInitiateAudit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cycle = await createAuditCycle(createForm);
      await startAuditCycle(cycle._id || cycle.id);
      
      toast.success('Audit cycle created and started successfully');
      setIsCreateOpen(false);
      setCreateForm({
        name: '',
        scope: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchAuditData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">
            Structured Assets Audit
          </h1>
          <p className="text-sm text-[#9CA3AF] font-medium">
            Verify physical locations and condition claims against current system records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Audit Record — visible to all authorized roles when cycle is active */}
          {activeCycle && (
            <button
              onClick={openAddRecord}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold rounded-full hover:bg-[#FAF7F5] hover:border-[#D97736] hover:text-[#D97736] transition-all active:scale-[0.98] shadow-sm"
            >
              <Plus size={16} />
              Add Audit Record
            </button>
          )}
          {/* Initiate Cycle — admin/manager only */}
          {(isAdmin || isAssetManager) && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D97736] text-white text-sm font-semibold rounded-full hover:bg-[#C85C27] hover:shadow-[0_4px_16px_rgba(217,119,54,0.25)] transition-all active:scale-[0.98]"
            >
              <ClipboardCheck size={16} />
              Initiate Audit Cycle
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh] bg-white rounded-2xl border border-[#F0EBE6] shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
            <p className="text-sm text-[#9CA3AF]">Loading active audit cycle...</p>
          </div>
        </div>
      ) : !activeCycle ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl border border-[#F0EBE6] p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#FAF7F5] border border-[#E8E2DC] flex items-center justify-center text-[#D97736] mb-4">
            <ClipboardCheck size={22} />
          </div>
          <h3 className="text-lg font-bold text-[#1E2022]">No Active Audit Cycle</h3>
          <p className="text-sm text-[#9CA3AF] max-w-sm mt-1 mb-6 leading-relaxed">
            There are no asset audit cycles currently in progress. Active audits will appear here for verification.
          </p>
          {(isAdmin || isAssetManager) && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D97736] text-white text-sm font-semibold rounded-full hover:bg-[#C85C27] hover:shadow-[0_4px_16px_rgba(217,119,54,0.25)] transition-all active:scale-[0.98]"
            >
              Initiate New Audit Cycle
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Cycle Top Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1E4620]/10 flex items-center justify-center text-[#1E4620] shrink-0">
                <ClipboardCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#9CA3AF] uppercase">Active Audit Cycle</p>
                <h3 className="text-lg font-bold text-[#1E2022] mt-0.5">{activeCycle.name}</h3>
                <p className="text-xs text-[#6B7280]">
                  Targeting: <span className="font-semibold">{activeCycle.scope || 'All Locations'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#1E4620] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-[#1E4620] uppercase tracking-wide">In Progress</span>
            </div>
          </div>

          {/* Asset Verification Directory Table */}
          <div className="bg-white rounded-2xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03),0_4px_16px_rgba(30,32,34,0.025)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F5]/80 border-b border-[#F0EBE6] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="py-4 px-6">Asset Tag & Name</th>
                    <th className="py-4 px-6">Expected Location</th>
                    <th className="py-4 px-6">Remarks</th>
                    <th className="py-4 px-6">Condition</th>
                    <th className="py-4 px-6">Verification Claims</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE6] text-sm text-[#1E2022]">
                  {auditAssets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 px-6 text-center text-sm text-[#9CA3AF] font-medium">
                        No assets in this audit cycle.
                      </td>
                    </tr>
                  ) : (
                    auditAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-[#FAF7F5]/30 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-bold text-xs font-mono text-[#9CA3AF]">{asset.assetTag}</p>
                            <p className="font-semibold text-sm text-[#1E2022] mt-0.5">{asset.name}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[#6B7280] font-medium text-xs">
                          {asset.expectedLocation}
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="text"
                            placeholder="e.g. Notes or observations"
                            value={asset.remarks || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAuditAssets(prev => prev.map(a => (a.id === asset.id ? { ...a, remarks: val } : a)));
                            }}
                            onBlur={() => handleVerify(asset.id, asset.status, asset.remarks, asset.condition)}
                            className="w-full h-10 px-3 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-xs text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736] outline-none transition-all"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={asset.condition || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAuditAssets(prev => prev.map(a => (a.id === asset.id ? { ...a, condition: val } : a)));
                              handleVerify(asset.id, asset.status, asset.remarks, val);
                            }}
                            className="w-full h-10 px-3 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-xs text-[#1E2022] focus:border-[#D97736] outline-none transition-all"
                          >
                            <option value="">Select condition</option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                            <option value="critical">Critical</option>
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {/* Verified [Green] */}
                            <button
                              onClick={() => {
                                setAuditAssets(prev => prev.map(a => (a.id === asset.id ? { ...a, status: 'verified' } : a)));
                                handleVerify(asset.id, 'verified', asset.remarks, asset.condition);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                asset.status === 'verified'
                                  ? 'bg-[#1E4620] text-white shadow-sm'
                                  : 'bg-[#1E4620]/[0.06] text-[#1E4620] hover:bg-[#1E4620]/15'
                              }`}
                            >
                              Verified
                            </button>

                            {/* Missing [Red] */}
                            <button
                              onClick={() => {
                                setAuditAssets(prev => prev.map(a => (a.id === asset.id ? { ...a, status: 'missing' } : a)));
                                handleVerify(asset.id, 'missing', asset.remarks, asset.condition);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                asset.status === 'missing'
                                  ? 'bg-[#C85C27] text-white shadow-sm'
                                  : 'bg-[#C85C27]/[0.06] text-[#C85C27] hover:bg-[#C85C27]/15'
                              }`}
                            >
                              Missing
                            </button>

                            {/* Damaged [Ochre] */}
                            <button
                              onClick={() => {
                                setAuditAssets(prev => prev.map(a => (a.id === asset.id ? { ...a, status: 'damaged' } : a)));
                                handleVerify(asset.id, 'damaged', asset.remarks, asset.condition);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                asset.status === 'damaged'
                                  ? 'bg-[#D49B28] text-white shadow-sm'
                                  : 'bg-[#D49B28]/[0.06] text-[#D49B28] hover:bg-[#D49B28]/15'
                              }`}
                            >
                              Damaged
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Close Audit Action Button */}
          {(isAdmin || isAssetManager) && (
            <div className="flex justify-end">
              <button
                onClick={handleCloseAudit}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1E2022] hover:bg-[#2D3135] text-white text-sm font-semibold rounded-xl hover:shadow-[0_4px_16px_rgba(30,32,34,0.15)] transition-all active:scale-[0.99]"
              >
                Close Audit Cycle & Generate Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         ADD AUDIT RECORD MODAL
         ───────────────────────────────────────────────────────────── */}
      {isAddRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6] bg-[#FAF7F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#D97736]/10 flex items-center justify-center">
                  <Plus size={15} className="text-[#D97736]" />
                </div>
                <h3 className="font-bold text-[#1E2022] text-base">Add Audit Record</h3>
              </div>
              <button
                onClick={() => setIsAddRecordOpen(false)}
                className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#F4EFEB] hover:text-[#1E2022] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="p-6 space-y-4">
              {/* Asset Selector */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide">Asset</label>
                <select
                  required
                  value={recordForm.assetId}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, assetId: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/60 outline-none transition-all"
                >
                  <option value="">— Select an asset —</option>
                  {assetsList.map(asset => (
                    <option key={asset._id || asset.id} value={asset._id || asset.id}>
                      {asset.assetTag ? `[${asset.assetTag}] ` : ''}{asset.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide">Verification Status</label>
                <div className="grid grid-cols-4 gap-2">
                  {['verified', 'missing', 'damaged', 'misplaced'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRecordForm(prev => ({ ...prev, status: s }))}
                      className={`h-9 rounded-xl text-xs font-bold capitalize transition-all ${
                        recordForm.status === s
                          ? s === 'verified'
                            ? 'bg-[#1E4620] text-white shadow-sm'
                            : s === 'missing'
                            ? 'bg-[#C85C27] text-white shadow-sm'
                            : s === 'damaged'
                            ? 'bg-[#D49B28] text-white shadow-sm'
                            : 'bg-[#6B7280] text-white shadow-sm'
                          : 'bg-[#FAF7F5] border border-[#E8E2DC] text-[#6B7280] hover:border-[#D97736]/40'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide">Physical Condition</label>
                <select
                  value={recordForm.condition}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/60 outline-none transition-all"
                >
                  <option value="">— Select condition (optional) —</option>
                  <option value="excellent">✅ Excellent — No visible wear</option>
                  <option value="good">🟢 Good — Minor cosmetic wear</option>
                  <option value="fair">🟡 Fair — Functional but noticeable wear</option>
                  <option value="poor">🟠 Poor — Reduced functionality</option>
                  <option value="critical">🔴 Critical — Immediate attention needed</option>
                </select>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-semibold text-[#6B7280] uppercase tracking-wide">Remarks / Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Found in storage room B, cable missing, serial number verified..."
                  value={recordForm.remarks}
                  onChange={(e) => setRecordForm(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/60 outline-none transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRecordOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold hover:bg-[#FAF7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingRecord}
                  className="flex-1 h-11 rounded-xl bg-[#D97736] text-white text-sm font-semibold hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isAddingRecord
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Plus size={14} /> Save Record</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         INITIATE AUDIT CYCLE MODAL
         ───────────────────────────────────────────────────────────── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6] bg-[#FAF7F5]">
              <h3 className="font-bold text-[#1E2022] text-base">Initiate Audit Cycle</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#F4EFEB] hover:text-[#1E2022] transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleInitiateAudit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Audit Cycle Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 2026 Electronics Audit"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Scope / Location Filter (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Floor 4, Bangalore HQ"
                  value={createForm.scope}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, scope: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-[#6B7280]">Start Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-[#6B7280]">End Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold hover:bg-[#FAF7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 rounded-xl bg-[#D97736] text-white text-sm font-semibold hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Start Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         AUDIT DISCREPANCY REPORT SUMMARY MODAL
         ───────────────────────────────────────────────────────────── */}
      {isSummaryOpen && summaryReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6] bg-[#FAF7F5]">
              <h3 className="font-bold text-[#1E2022] text-base flex items-center gap-2">
                <FileSpreadsheet className="text-[#D97736]" size={18} />
                Discrepancy Report Summary
              </h3>
              <button onClick={() => setIsSummaryOpen(false)} className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#F4EFEB] hover:text-[#1E2022] transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase">Completed Audit Cycle</p>
                <h4 className="font-bold text-base text-[#1E2022] mt-0.5">{summaryReport.cycleName}</h4>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Closed Date: {summaryReport.closedAt}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-[#FAF7F5] border border-[#F0EBE6] rounded-xl p-3.5 text-center">
                  <p className="text-xl font-bold text-[#1E2022]">{summaryReport.stats.verified}</p>
                  <p className="text-[10px] text-[#1E4620] font-bold">Verified</p>
                </div>
                <div className="bg-[#FAF7F5] border border-[#F0EBE6] rounded-xl p-3.5 text-center">
                  <p className="text-xl font-bold text-[#1E2022]">{summaryReport.stats.missing}</p>
                  <p className="text-[10px] text-[#C85C27] font-bold">Missing</p>
                </div>
                <div className="bg-[#FAF7F5] border border-[#F0EBE6] rounded-xl p-3.5 text-center">
                  <p className="text-xl font-bold text-[#1E2022]">{summaryReport.stats.damaged}</p>
                  <p className="text-[10px] text-[#D49B28] font-bold">Damaged</p>
                </div>
                <div className="bg-[#FAF7F5] border border-[#F0EBE6] rounded-xl p-3.5 text-center">
                  <p className="text-xl font-bold text-[#1E2022]">{summaryReport.stats.pending}</p>
                  <p className="text-[10px] text-[#9CA3AF] font-bold">Unchecked</p>
                </div>
              </div>

              {/* List of Discrepancies */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[#1E2022] uppercase tracking-wider">Discrepancy Details</h5>
                <div className="max-h-[180px] overflow-y-auto border border-[#F0EBE6] rounded-xl divide-y divide-[#F0EBE6] bg-gray-50/50">
                  {summaryReport.discrepancies.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-4 text-xs">
                      <div>
                        <p className="font-bold text-[#1E2022]">{item.name}</p>
                        <p className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">{item.assetTag} · {item.expectedLocation}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                        item.status === 'missing' ? 'bg-[#C85C27]/10 text-[#C85C27]' : 'bg-[#D49B28]/10 text-[#D49B28]'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                  {summaryReport.discrepancies.length === 0 && (
                    <p className="text-xs text-[#9CA3AF] text-center py-6">All assets verified perfectly. No discrepancies flagged.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsSummaryOpen(false)}
                  className="w-full h-11 rounded-xl bg-[#1E2022] text-white text-sm font-semibold hover:bg-[#2D3135] transition-colors"
                >
                  Close Summary Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
