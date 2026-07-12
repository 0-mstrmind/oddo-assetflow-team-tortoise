import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSearchParams } from 'react-router-dom';
import {
  getAssets,
  registerAsset,
  getCategories,
  getDepartments,
} from '@/services/api.mock';
import {
  Search,
  Plus,
  Filter,
  X,
  Laptop,
  CheckCircle,
  AlertTriangle,
  History,
  Info,
  Calendar,
  DollarSign,
  MapPin,
  UploadCloud,
  QrCode
} from 'lucide-react';

export default function AssetDirectoryPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'admin';
  const isAssetManager = user?.role === 'manager' || user?.role === 'asset_manager';
  const canRegister = isAdmin || isAssetManager;

  const [searchParams, setSearchParams] = useSearchParams();

  // Data lists
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal trigger
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDept, setSelectedDept] = useState('all');

  // Form state
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    serialNumber: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: '',
    condition: 'new',
    location: '',
    isBookable: false,
    departmentId: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assetList, catList, deptList] = await Promise.all([
        getAssets(),
        getCategories(),
        getDepartments(),
      ]);
      setAssets(assetList);
      setCategories(catList);
      setDepartments(deptList);
    } catch (err) {
      console.error('Error fetching assets directory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync query parameter (useful if triggered from dashboard link)
  useEffect(() => {
    if (searchParams.get('register') === 'true' && canRegister) {
      setIsModalOpen(true);
      // Clean query parameter after trigger
      setSearchParams({});
    }
  }, [searchParams, canRegister]);

  // Filtering Logic
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCat === 'all' || asset.categoryId === selectedCat;
    const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
    const matchesDept = selectedDept === 'all' || asset.departmentId === selectedDept;

    return matchesSearch && matchesCategory && matchesStatus && matchesDept;
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.categoryId) return;
    try {
      await registerAsset(form);
      setIsModalOpen(false);
      // Reset form
      setForm({
        name: '',
        categoryId: '',
        serialNumber: '',
        acquisitionDate: new Date().toISOString().split('T')[0],
        acquisitionCost: '',
        condition: 'new',
        location: '',
        isBookable: false,
        departmentId: '',
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-[#1E4620]/[0.08] text-[#1E4620]',
      allocated: 'bg-[#D97736]/[0.08] text-[#D97736]',
      maintenance: 'bg-[#D49B28]/[0.08] text-[#D49B28]',
      reserved: 'bg-blue-50 text-blue-700 border-blue-100',
      retired: 'bg-gray-100 text-gray-500',
    };
    return styles[status] || 'bg-gray-50 text-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">
            Asset Directory
          </h1>
          <p className="text-sm text-[#9CA3AF] font-medium">
            Search, filter, and track all physical equipment and capital assets.
          </p>
        </div>

        {/* Action Button: visible ONLY to admin and manager */}
        {canRegister && (
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D97736] text-white text-sm font-semibold rounded-full hover:bg-[#C85C27] hover:shadow-[0_4px_16px_rgba(217,119,54,0.25)] transition-all active:scale-[0.98]"
            >
              <Plus size={16} />
              Register Asset
            </button>
          </div>
        )}
      </div>

      {/* Search & Filter Top Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)] flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search by tag, serial, or QR code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-xs font-semibold text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-xs font-semibold text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="allocated">Allocated</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
            <option value="retired">Retired</option>
          </select>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-xs font-semibold text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Clear Filters Button */}
          {(selectedCat !== 'all' || selectedStatus !== 'all' || selectedDept !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setSelectedCat('all');
                setSelectedStatus('all');
                setSelectedDept('all');
                setSearchQuery('');
              }}
              className="h-11 px-3.5 bg-[#FAF7F5] hover:bg-[#F4EFEB] border border-[#E8E2DC] text-[#6B7280] hover:text-[#1E2022] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Asset Directory Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[40vh] bg-white rounded-2xl border border-[#F0EBE6] shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
            <p className="text-sm text-[#9CA3AF]">Fetching asset inventory...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03),0_4px_16px_rgba(30,32,34,0.025)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F5]/80 border-b border-[#F0EBE6] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-4 px-6">Asset Tag</th>
                  <th className="py-4 px-6">Asset Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Bookable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE6] text-sm text-[#1E2022]">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#FAF7F5]/30 hover:shadow-inner transition-all duration-150">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <QrCode size={14} className="text-[#9CA3AF]" />
                        <span className="font-mono text-xs font-bold text-[#1E2022]">{asset.assetTag}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold">{asset.name}</p>
                        {asset.serialNumber && (
                          <p className="text-[10px] text-[#9CA3AF] font-mono">S/N: {asset.serialNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[#6B7280]">{asset.categoryName}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusBadge(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-[#6B7280]">
                        <MapPin size={12} className="text-[#9CA3AF]" />
                        <span className="text-xs">{asset.location || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {asset.isBookable ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-[#1E4620]/10 text-[#1E4620] rounded-full text-[10px] font-bold" title="Available for Booking">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 text-gray-400 rounded-full text-[10px] font-medium" title="Dedicated Assignment Only">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-[#9CA3AF]">
                      No assets found matching the selected search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         REGISTRATION MODAL (Premium rounded-2xl overlay)
         ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6] bg-[#FAF7F5]">
              <h3 className="font-bold text-[#1E2022] text-base">Register Physical Asset</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#F4EFEB] hover:text-[#1E2022] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleRegister} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Asset Name */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell UltraSharp 27 Monitor"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                />
              </div>

              {/* Grid: Category & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-[#6B7280]">Category</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-[#6B7280]">Assigned Department</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm(prev => ({ ...prev, departmentId: e.target.value }))}
                    className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                  >
                    <option value="">Unassigned / Floating</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid: Serial Number & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-[#6B7280]">Serial Number (S/N)</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-098822A"
                    value={form.serialNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-[#6B7280]">Location / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 402, Floor B"
                    value={form.location}
                    onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Grid: Date & Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-[#6B7280]">Acquisition Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="date"
                      value={form.acquisitionDate}
                      onChange={(e) => setForm(prev => ({ ...prev, acquisitionDate: e.target.value }))}
                      className="w-full h-11 pl-11 pr-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[13px] font-medium text-[#6B7280]">Acquisition Cost ($)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="350.00"
                      value={form.acquisitionCost}
                      onChange={(e) => setForm(prev => ({ ...prev, acquisitionCost: e.target.value }))}
                      className="w-full h-11 pl-11 pr-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Physical Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 outline-none transition-all"
                >
                  <option value="new">Brand New</option>
                  <option value="good">Good / Used</option>
                  <option value="fair">Fair (Wear and Tear)</option>
                  <option value="poor">Poor (Damaged)</option>
                </select>
              </div>

              {/* Photo Upload simulation */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Upload Image</label>
                <div className="border border-dashed border-[#E8E2DC] hover:border-[#D97736]/60 rounded-xl p-4 bg-[#FAF7F5] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors group">
                  <UploadCloud size={20} className="text-[#9CA3AF] group-hover:text-[#D97736] transition-colors" />
                  <span className="text-xs font-semibold text-[#1E2022]">Select a file to upload</span>
                  <span className="text-[10px] text-[#9CA3AF]">Supports JPG, PNG up to 5MB</span>
                </div>
              </div>

              {/* Shared Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-[#FAF7F5] rounded-xl border border-[#E8E2DC]">
                <div>
                  <h4 className="text-sm font-semibold text-[#1E2022]">Shared Bookable Resource</h4>
                  <p className="text-xs text-[#9CA3AF]">Allow general employees to book this resource in time-slots.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isBookable}
                    onChange={(e) => setForm(prev => ({ ...prev, isBookable: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#E8E2DC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D97736]"></div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-[#F0EBE6]">
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
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
