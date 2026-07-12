import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getActiveAuditCycle,
  getAuditAssets,
  verifyAuditAsset,
  closeAuditCycle,
} from '@/services/api.mock';
import {
  ClipboardCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  X,
} from 'lucide-react';

export default function AssetAuditPage() {
  const { user } = useAuthStore();
  const isAuthorized = user?.role === 'admin' || user?.role === 'manager';

  const [activeCycle, setActiveCycle] = useState(null);
  const [auditAssets, setAuditAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Close Audit Summary Modal
  const [summaryReport, setSummaryReport] = useState(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const fetchAuditData = async () => {
    setIsLoading(true);
    try {
      const [cycle, list] = await Promise.all([
        getActiveAuditCycle(),
        getAuditAssets(),
      ]);
      setActiveCycle(cycle);
      setAuditAssets(list);
    } catch (e) {
      console.error(e);
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
          The Audit module is strictly restricted to Administrators and Asset Managers.
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

  const handleVerify = async (id, status) => {
    try {
      // Optimistic update
      setAuditAssets(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
      await verifyAuditAsset(id, status);
    } catch (err) {
      console.error(err);
      fetchAuditData();
    }
  };

  const handleCloseAudit = async () => {
    try {
      const summary = await closeAuditCycle();
      setSummaryReport(summary);
      setIsSummaryOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">
          Structured Assets Audit
        </h1>
        <p className="text-sm text-[#9CA3AF] font-medium">
          Verify physical locations and condition claims against current system records.
        </p>
      </div>

      {isLoading || !activeCycle ? (
        <div className="flex items-center justify-center h-[50vh] bg-white rounded-2xl border border-[#F0EBE6] shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
            <p className="text-sm text-[#9CA3AF]">Loading active audit cycle...</p>
          </div>
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
                <p className="text-xs text-[#6B7280]">Targeting Department: <span className="font-semibold">{activeCycle.department}</span></p>
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
                    <th className="py-4 px-6">Verification Claims</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE6] text-sm text-[#1E2022]">
                  {auditAssets.map((asset) => (
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
                        <div className="flex items-center gap-2">
                          {/* Verified [Green] */}
                          <button
                            onClick={() => handleVerify(asset.id, 'verified')}
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
                            onClick={() => handleVerify(asset.id, 'missing')}
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
                            onClick={() => handleVerify(asset.id, 'damaged')}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Close Audit Action Button */}
          <div className="flex justify-end">
            <button
              onClick={handleCloseAudit}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1E2022] hover:bg-[#2D3135] text-white text-sm font-semibold rounded-xl hover:shadow-[0_4px_16px_rgba(30,32,34,0.15)] transition-all active:scale-[0.99]"
            >
              Close Audit Cycle & Generate Report
            </button>
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
                  Download Detailed Audit PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
