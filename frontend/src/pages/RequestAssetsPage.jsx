import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getAssets } from '@/services/asset.service';
import { submitAssetRequest, getMyRequests } from '@/services/request.service';
import { toast } from 'sonner';
import {
  Package,
  ClipboardList,
  Search,
  SendHorizonal,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  Tag,
  User,
  Loader2,
} from 'lucide-react';

// ─── Status Badge ─────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    pending:  { cls: 'bg-amber-50 text-amber-600 border border-amber-200',  Icon: Clock,         label: 'Pending' },
    approved: { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200', Icon: CheckCircle2, label: 'Approved' },
    rejected: { cls: 'bg-red-50 text-red-500 border border-red-200',        Icon: XCircle,       label: 'Rejected' },
  };
  const { cls, Icon, label } = styles[status] || styles.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

// ─── Asset Status Badge ───────────────────────────────────────────
function AssetStatusPill({ status }) {
  const styles = {
    available:  'bg-emerald-50 text-emerald-600',
    allocated:  'bg-amber-50 text-amber-600',
    maintenance:'bg-blue-50 text-blue-600',
    retired:    'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────
function EmptyState({ title, description, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-14 h-14 bg-[#F4EFEB] rounded-2xl flex items-center justify-center">
        <Icon size={24} className="text-[#D8D2CC]" />
      </div>
      <p className="text-sm font-semibold text-[#6B7280]">{title}</p>
      <p className="text-xs text-[#9CA3AF] max-w-xs leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Request Row ──────────────────────────────────────────────────
function RequestRow({ request }) {
  const asset = request.assetId;
  const assetName = asset?.name || 'Unknown Asset';
  const assetTag = asset?.assetTag || '—';
  const dateStr = new Date(request.requestedAt || request.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="flex items-center gap-4 py-4 border-b border-[#F0EBE6] last:border-none group">
      <div className="w-10 h-10 bg-[#FAF7F5] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#F0EBE6] transition-colors">
        <Package size={16} className="text-[#D97736]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1E2022] truncate">{assetName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Tag size={10} className="text-[#C4BEB8]" />
          <span className="text-[11px] text-[#9CA3AF]">{assetTag}</span>
          <span className="text-[11px] text-[#D8D2CC]">·</span>
          <span className="text-[11px] text-[#9CA3AF]">{dateStr}</span>
        </div>
        {request.reason && (
          <p className="text-[11px] text-[#9CA3AF] mt-1 italic truncate max-w-sm">"{request.reason}"</p>
        )}
      </div>

      <StatusBadge status={request.status} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function RequestAssetsPage() {
  const user = useAuthStore(s => s.user);

  // ── Data ──────────────────────────────────────────────────────
  const [assets, setAssets]     = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  // ── Form state ────────────────────────────────────────────────
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [reason, setReason]                   = useState('');
  const [searchQuery, setSearchQuery]         = useState('');

  // ── UI state ──────────────────────────────────────────────────
  const [isLoadingAssets,   setIsLoadingAssets]   = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isSubmitting,      setIsSubmitting]       = useState(false);
  const [activeTab,         setActiveTab]          = useState('request'); // 'request' | 'history'

  // ── Load assets ───────────────────────────────────────────────
  const loadAssets = useCallback(async () => {
    setIsLoadingAssets(true);
    try {
      const list = await getAssets();
      setAssets(list.map(a => ({ ...a, id: a._id || a.id })));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load assets');
    } finally {
      setIsLoadingAssets(false);
    }
  }, []);

  // ── Load my requests ──────────────────────────────────────────
  const loadMyRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    try {
      const list = await getMyRequests();
      setMyRequests(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your requests');
    } finally {
      setIsLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
    loadMyRequests();
  }, [loadAssets, loadMyRequests]);

  // ── Derived ───────────────────────────────────────────────────
  const filteredAssets = assets.filter(a => {
    const q = searchQuery.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.assetTag?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q)
    );
  });

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  const pendingCount  = myRequests.filter(r => r.status === 'pending').length;
  const approvedCount = myRequests.filter(r => r.status === 'approved').length;

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId) { toast.error('Please select an asset'); return; }
    if (!reason.trim())   { toast.error('Please provide a reason for your request'); return; }

    setIsSubmitting(true);
    try {
      await submitAssetRequest({ assetId: selectedAssetId, reason: reason.trim() });
      toast.success('Asset request submitted successfully!');
      setSelectedAssetId('');
      setReason('');
      setSearchQuery('');
      // Refresh requests list and switch to history tab
      await loadMyRequests();
      setActiveTab('history');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.join(', ') || err.message;
      toast.error(msg || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-[#9CA3AF] font-medium mb-0.5">
            Welcome, {user?.name?.split(' ')[0] || 'there'}
          </p>
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em]">
            Request Assets
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Browse available assets and raise a request. Track all your requests below.
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)]">
            <Clock size={14} className="text-amber-500" />
            <span className="text-sm font-semibold text-[#1E2022]">{pendingCount}</span>
            <span className="text-xs text-[#9CA3AF]">Pending</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)]">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-sm font-semibold text-[#1E2022]">{approvedCount}</span>
            <span className="text-xs text-[#9CA3AF]">Approved</span>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] w-fit">
        {[
          { id: 'request', label: 'New Request', Icon: Package },
          { id: 'history', label: 'My Requests', Icon: ClipboardList, badge: myRequests.length },
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
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#F0EBE6] text-[#6B7280]'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: New Request ── */}
      {activeTab === 'request' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Asset Browser (left panel) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-[#F0EBE6]">
              <h2 className="text-sm font-bold text-[#1E2022] mb-3">Browse Assets</h2>
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search by name, tag or status…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] outline-none focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Asset List */}
            <div className="divide-y divide-[#F0EBE6] max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#E8E2DC]">
              {isLoadingAssets ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={22} className="animate-spin text-[#D97736]" />
                </div>
              ) : filteredAssets.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No assets found"
                  description={searchQuery ? `No assets match "${searchQuery}"` : 'No assets have been registered yet.'}
                />
              ) : (
                filteredAssets.map(asset => {
                  const isSelected = asset.id === selectedAssetId;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setSelectedAssetId(isSelected ? '' : asset.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-150 ${
                        isSelected
                          ? 'bg-[#D97736]/[0.06] border-l-[3px] border-l-[#D97736]'
                          : 'hover:bg-[#FAF7F5] border-l-[3px] border-l-transparent'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-[#D97736]/10' : 'bg-[#F4EFEB]'
                      }`}>
                        <Package size={16} className={isSelected ? 'text-[#D97736]' : 'text-[#C4BEB8]'} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-[#D97736]' : 'text-[#1E2022]'}`}>
                            {asset.name}
                          </p>
                          <AssetStatusPill status={asset.status} />
                        </div>
                        <p className="text-[11px] text-[#9CA3AF]">
                          {asset.assetTag}
                          {asset.categoryId?.name && ` · ${asset.categoryId.name}`}
                          {asset.location && ` · ${asset.location}`}
                        </p>
                      </div>

                      {isSelected && (
                        <CheckCircle2 size={18} className="text-[#D97736] shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Request Form (right panel) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] p-6">
              <h2 className="text-sm font-bold text-[#1E2022] mb-5 flex items-center gap-2">
                <SendHorizonal size={15} className="text-[#D97736]" />
                Submit Request
              </h2>

              {/* Selected Asset Preview */}
              {selectedAsset ? (
                <div className="bg-[#D97736]/[0.05] border border-[#D97736]/15 rounded-xl p-4 mb-5">
                  <p className="text-[11px] font-semibold text-[#D97736] uppercase tracking-wider mb-1">Selected Asset</p>
                  <p className="text-sm font-bold text-[#1E2022]">{selectedAsset.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-[#9CA3AF]">{selectedAsset.assetTag}</span>
                    <AssetStatusPill status={selectedAsset.status} />
                  </div>
                  {selectedAsset.status === 'allocated' && (
                    <div className="flex items-start gap-1.5 mt-3 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                      <AlertCircle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-600 leading-relaxed">
                        This asset is currently allocated. Your request will be reviewed by an admin.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#FAF7F5] border-2 border-dashed border-[#E8E2DC] rounded-xl p-5 mb-5 text-center">
                  <Package size={22} className="text-[#D8D2CC] mx-auto mb-2" />
                  <p className="text-xs text-[#9CA3AF]">Select an asset from the list</p>
                </div>
              )}

              {/* Requestor Info */}
              <div className="flex items-center gap-2 mb-5 px-3 py-2.5 bg-[#FAF7F5] rounded-xl border border-[#E8E2DC]">
                <User size={13} className="text-[#9CA3AF]" />
                <span className="text-xs text-[#6B7280]">
                  Requesting as <span className="font-semibold text-[#1E2022]">{user?.name}</span>
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Reason */}
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-semibold text-[#6B7280]">
                    Reason for Request <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="Explain why you need this asset (e.g., required for new project, current equipment failed…)"
                    className="w-full p-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedAssetId || !reason.trim()}
                  className="w-full h-12 bg-[#D97736] text-white text-sm font-bold rounded-xl hover:bg-[#C85C27] hover:shadow-[0_4px_16px_rgba(217,119,54,0.25)] transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <SendHorizonal size={15} />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: My Requests ── */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6]">
            <h2 className="text-sm font-bold text-[#1E2022] flex items-center gap-2">
              <ClipboardList size={15} className="text-[#D97736]" />
              My Request History
            </h2>
            <button
              onClick={loadMyRequests}
              className="flex items-center gap-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#D97736] transition-colors"
            >
              <RefreshCw size={12} className={isLoadingRequests ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 px-6 py-3 border-b border-[#F0EBE6] overflow-x-auto">
            {['All', 'Pending', 'Approved', 'Rejected'].map(filter => {
              const count =
                filter === 'All' ? myRequests.length :
                myRequests.filter(r => r.status === filter.toLowerCase()).length;
              return (
                <span
                  key={filter}
                  className="flex items-center gap-1.5 shrink-0 px-3 py-1 text-xs font-medium text-[#6B7280] bg-[#FAF7F5] rounded-full border border-[#E8E2DC]"
                >
                  {filter}
                  <span className="text-[10px] font-bold text-[#9CA3AF]">{count}</span>
                </span>
              );
            })}
          </div>

          <div className="px-6 divide-y-0">
            {isLoadingRequests ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={22} className="animate-spin text-[#D97736]" />
              </div>
            ) : myRequests.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No requests yet"
                description="You haven't submitted any asset requests. Use the 'New Request' tab to get started."
              />
            ) : (
              myRequests.map(req => (
                <RequestRow key={req._id || req.id} request={req} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
