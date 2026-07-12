import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getAssets, getDepartments } from '@/services/api.mock';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileText,
} from 'lucide-react';

export default function ReportsPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'admin';
  const isAssetManager = user?.role === 'manager' || user?.role === 'asset_manager';
  const isAuthorized = isAdmin || isAssetManager;

  const [assets, setAssets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthorized) {
      Promise.all([getAssets(), getDepartments()]).then(([aList, dList]) => {
        setAssets(aList);
        setDepartments(dList);
        setIsLoading(false);
      });
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-16 h-16 bg-[#C85C27]/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <ShieldAlert className="text-[#C85C27]" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[#1E2022] tracking-tight mb-2">Access Denied</h1>
        <p className="text-sm text-[#9CA3AF] text-center max-w-sm mb-6 leading-relaxed">
          The Reports module is restricted to Administrators and Asset Managers only.
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

  // Pre-calculate mock report statistics
  const totalAssetsVal = assets.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0);
  const activeMaintenanceCount = assets.filter(a => a.status === 'maintenance').length;
  const utilizationRate = Math.round((assets.filter(a => a.status === 'allocated').length / (assets.length || 1)) * 100);

  // Utilization by department stats (Bar Chart Data)
  const deptStats = [
    { name: 'Engineering', rate: 78, color: '#D97736' },
    { name: 'Design', rate: 92, color: '#D49B28' },
    { name: 'Operations', rate: 64, color: '#D97736' },
    { name: 'Marketing', rate: 85, color: '#D49B28' },
    { name: 'QA Testing', rate: 52, color: '#1E4620' },
  ];

  // Maintenance Frequency (Line Chart Data)
  // Mock monthly failure/maintenance counts
  const maintenanceTrends = [
    { month: 'Jan', count: 4 },
    { month: 'Feb', count: 6 },
    { month: 'Mar', count: 3 },
    { month: 'Apr', count: 8 },
    { month: 'May', count: 5 },
    { month: 'Jun', count: 9 },
  ];

  // Lists
  const mostUsedAssets = [
    { tag: 'AF-0001', name: 'MacBook Pro 16" M3 Max', allocationsCount: 14, rate: '98% uptime' },
    { tag: 'AF-0004', name: 'Dell UltraSharp 27" 4K', allocationsCount: 11, rate: '92% uptime' },
    { tag: 'AF-0002', name: 'Herman Miller Aeron Chair', allocationsCount: 9, rate: '89% uptime' },
  ];

  const idleAssets = [
    { tag: 'AF-0005', name: 'Cisco Meraki MR46 AP', idleDays: 45, status: 'available' },
    { tag: 'AF-0002', name: 'Herman Miller Office Desk', idleDays: 32, status: 'available' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">
            Reports & Analytics
          </h1>
          <p className="text-sm text-[#9CA3AF] font-medium">
            Analyze asset utilization indexes, audit cycles and failure rate timelines.
          </p>
        </div>

        <div>
          <button
            onClick={() => alert('Exporting dashboard PDF and Excel sheets...')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D97736] text-white text-sm font-semibold rounded-full hover:bg-[#C85C27] hover:shadow-[0_4px_16px_rgba(217,119,54,0.25)] transition-all active:scale-[0.98]"
          >
            <Download size={15} />
            Export Audit Report
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh] bg-white rounded-2xl border border-[#F0EBE6] shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
            <p className="text-sm text-[#9CA3AF]">Compiling report metrics...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Top Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-[#F0EBE6] shadow-sm">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Total Fleet Value</span>
              <p className="text-2xl font-bold text-[#1E2022] mt-1">${totalAssetsVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <div className="flex items-center gap-1 text-[#1E4620] text-xs font-semibold mt-2">
                <ArrowUpRight size={14} />
                <span>+4.2% from Q2</span>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-[#F0EBE6] shadow-sm">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Utilization Rate</span>
              <p className="text-2xl font-bold text-[#1E2022] mt-1">{utilizationRate}%</p>
              <div className="flex items-center gap-1 text-[#1E4620] text-xs font-semibold mt-2">
                <ArrowUpRight size={14} />
                <span>Steady allocation index</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#F0EBE6] shadow-sm">
              <span className="text-[10px] font-bold text-[#9CA3AF] uppercase">Failure Incident Index</span>
              <p className="text-2xl font-bold text-[#1E2022] mt-1">{activeMaintenanceCount} Active</p>
              <div className="flex items-center gap-1 text-[#C85C27] text-xs font-semibold mt-2">
                <ArrowDownRight size={14} />
                <span>-2 cases resolved this week</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Custom SVG Bar Chart: Utilization by Department */}
            <div className="bg-white rounded-2xl p-5 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)]">
              <h3 className="text-sm font-bold text-[#1E2022] mb-6 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#D97736]" />
                Utilization by Department (%)
              </h3>

              {/* Bar Layout */}
              <div className="space-y-4">
                {deptStats.map(stat => (
                  <div key={stat.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-[#1E2022]">
                      <span>{stat.name}</span>
                      <span className="text-[#6B7280]">{stat.rate}%</span>
                    </div>
                    {/* Cozy Rounded Track */}
                    <div className="w-full h-3 bg-[#FAF7F5] border border-[#E8E2DC] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${stat.rate}%`,
                          backgroundColor: stat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom SVG Line Chart: Maintenance Frequency */}
            <div className="bg-white rounded-2xl p-5 border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03)]">
              <h3 className="text-sm font-bold text-[#1E2022] mb-6 flex items-center gap-2">
                <TrendingUp size={16} className="text-[#1E2022]" />
                Maintenance Incidents Timeline
              </h3>

              {/* Responsive SVG Draw */}
              <div className="w-full h-[220px] flex items-end">
                <svg className="w-full h-full" viewBox="0 0 500 200">
                  {/* Grid Lines */}
                  <line x1="40" y1="30" x2="480" y2="30" stroke="#FAF7F5" strokeWidth="1" />
                  <line x1="40" y1="80" x2="480" y2="80" stroke="#FAF7F5" strokeWidth="1" />
                  <line x1="40" y1="130" x2="480" y2="130" stroke="#FAF7F5" strokeWidth="1" />
                  <line x1="40" y1="170" x2="480" y2="170" stroke="#E8E2DC" strokeWidth="1" />

                  {/* Left Axis Labels */}
                  <text x="15" y="35" fill="#9CA3AF" fontSize="10" fontWeight="bold">10</text>
                  <text x="15" y="85" fill="#9CA3AF" fontSize="10" fontWeight="bold">5</text>
                  <text x="15" y="135" fill="#9CA3AF" fontSize="10" fontWeight="bold">2</text>
                  <text x="15" y="175" fill="#9CA3AF" fontSize="10" fontWeight="bold">0</text>

                  {/* Line Graph path calculation */}
                  {/* points: Jan(40, 130), Feb(120, 110), Mar(200, 140), Apr(280, 90), May(360, 120), Jun(440, 80) */}
                  <path
                    d="M 40 130 L 120 110 L 200 140 L 280 90 L 360 120 L 440 80"
                    fill="none"
                    stroke="#1E2022"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Dots over coordinates */}
                  <circle cx="40" cy="130" r="5" fill="#D97736" stroke="white" strokeWidth="1.5" />
                  <circle cx="120" cy="110" r="5" fill="#D97736" stroke="white" strokeWidth="1.5" />
                  <circle cx="200" cy="140" r="5" fill="#D97736" stroke="white" strokeWidth="1.5" />
                  <circle cx="280" cy="90" r="5" fill="#D97736" stroke="white" strokeWidth="1.5" />
                  <circle cx="360" cy="120" r="5" fill="#D97736" stroke="white" strokeWidth="1.5" />
                  <circle cx="440" cy="80" r="5" fill="#D97736" stroke="white" strokeWidth="1.5" />

                  {/* Monthly Labels */}
                  <text x="30" y="195" fill="#6B7280" fontSize="11" fontWeight="600">Jan</text>
                  <text x="110" y="195" fill="#6B7280" fontSize="11" fontWeight="600">Feb</text>
                  <text x="190" y="195" fill="#6B7280" fontSize="11" fontWeight="600">Mar</text>
                  <text x="270" y="195" fill="#6B7280" fontSize="11" fontWeight="600">Apr</text>
                  <text x="350" y="195" fill="#6B7280" fontSize="11" fontWeight="600">May</text>
                  <text x="430" y="195" fill="#6B7280" fontSize="11" fontWeight="600">Jun</text>
                </svg>
              </div>
            </div>

          </div>

          {/* List Sections Below Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Most Used Assets */}
            <div className="bg-white rounded-2xl p-5 border border-[#F0EBE6] shadow-sm">
              <h4 className="text-xs font-bold text-[#1E2022] uppercase tracking-wider mb-4">Most Utilized Equipment</h4>
              <div className="divide-y divide-[#F0EBE6] text-xs">
                {mostUsedAssets.map(item => (
                  <div key={item.tag} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-[#1E2022]">{item.name}</p>
                      <p className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">{item.tag} · {item.allocationsCount} allocations</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#1E4620] bg-[#1E4620]/[0.08] px-2.5 py-1 rounded-lg">
                      {item.rate}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Idle Assets */}
            <div className="bg-white rounded-2xl p-5 border border-[#F0EBE6] shadow-sm">
              <h4 className="text-xs font-bold text-[#1E2022] uppercase tracking-wider mb-4">Idle Equipment Warnings</h4>
              <div className="divide-y divide-[#F0EBE6] text-xs">
                {idleAssets.map(item => (
                  <div key={item.tag} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-[#1E2022]">{item.name}</p>
                      <p className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">{item.tag} · status: {item.status}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#C85C27] bg-[#C85C27]/[0.08] px-2.5 py-1 rounded-lg">
                      Idle {item.idleDays} Days
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
