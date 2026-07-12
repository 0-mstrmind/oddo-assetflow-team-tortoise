import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getDepartments,
  addDepartment,
  getCategories,
  addCategory,
  getEmployees,
  updateEmployeeRole,
} from '@/services/api.mock';
import {
  ShieldAlert,
  Plus,
  Users,
  Building,
  FolderOpen,
  X,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function OrganizationSetupPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'categories' | 'employees'
  
  // Data State
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  // Modal forms
  const [deptForm, setDeptForm] = useState({ name: '', headId: '', parentDepartmentId: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '', warrantyPeriod: '' });
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [newRole, setNewRole] = useState('');

  // Fetch all initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [depts, cats, emps] = await Promise.all([
        getDepartments(),
        getCategories(),
        getEmployees(),
      ]);
      setDepartments(depts);
      setCategories(cats);
      setEmployees(emps);
    } catch (err) {
      console.error('Error fetching organization setup data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Authorization Guard
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-16 h-16 bg-[#C85C27]/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <ShieldAlert className="text-[#C85C27]" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[#1E2022] tracking-tight mb-2">Access Denied</h1>
        <p className="text-sm text-[#9CA3AF] text-center max-w-sm mb-6 leading-relaxed">
          The Organization Setup screen is strictly reserved for Administrators. Please contact your system administrator if you require access.
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

  // Submit Handlers
  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!deptForm.name) return;
    try {
      await addDepartment(deptForm);
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', headId: '', parentDepartmentId: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCat = async (e) => {
    e.preventDefault();
    if (!catForm.name) return;
    try {
      await addCategory(catForm);
      setIsCatModalOpen(false);
      setCatForm({ name: '', description: '', warrantyPeriod: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedEmp || !newRole) return;
    try {
      await updateEmployeeRole(selectedEmp.id, newRole);
      setIsRoleModalOpen(false);
      setSelectedEmp(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">
            Organization Setup
          </h1>
          <p className="text-sm text-[#9CA3AF] font-medium">
            Manage company departments, asset categories, and control user roles.
          </p>
        </div>

        {/* Terracotta Action Button */}
        <div>
          <button
            onClick={() => {
              if (activeTab === 'departments') setIsDeptModalOpen(true);
              if (activeTab === 'categories') setIsCatModalOpen(true);
              if (activeTab === 'employees') {
                alert('To update employee roles or status, use the "Edit Role" button next to individual employee entries.');
              }
            }}
            disabled={activeTab === 'employees'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#D97736] text-white text-sm font-semibold rounded-full hover:bg-[#C85C27] hover:shadow-[0_4px_16px_rgba(217,119,54,0.25)] transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Plus size={16} />
            Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Item'}
          </button>
        </div>
      </div>

      {/* Sleek Pill Tabs */}
      <div className="flex bg-[#E8E2DC]/50 p-1.5 rounded-full max-w-lg">
        {[
          { id: 'departments', label: 'Departments', icon: Building },
          { id: 'categories', label: 'Categories', icon: FolderOpen },
          { id: 'employees', label: 'Employee Directory', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-semibold tracking-tight transition-all duration-300 ${
                isActive
                  ? 'bg-[#1E2022] text-white shadow-sm'
                  : 'text-[#6B7280] hover:text-[#1E2022]'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Table Card Area */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[40vh] bg-white rounded-2xl border border-[#F0EBE6] shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
            <p className="text-sm text-[#9CA3AF]">Fetching records...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03),0_4px_16px_rgba(30,32,34,0.025)] overflow-hidden">
          
          {/* Tab A: Departments Table */}
          {activeTab === 'departments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F5]/80 border-b border-[#F0EBE6] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="py-4 px-6">Department Name</th>
                    <th className="py-4 px-6">Department Head</th>
                    <th className="py-4 px-6">Parent Department</th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE6] text-sm text-[#1E2022]">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-[#FAF7F5]/30 transition-colors duration-150">
                      <td className="py-4 px-6 font-semibold">{dept.name}</td>
                      <td className="py-4 px-6 text-[#6B7280]">{dept.headName}</td>
                      <td className="py-4 px-6 text-[#6B7280]">{dept.parentName}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          dept.status === 'active' 
                            ? 'bg-[#1E4620]/[0.08] text-[#1E4620]' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {dept.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {departments.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-[#9CA3AF]">No departments configured.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab B: Categories Table */}
          {activeTab === 'categories' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F5]/80 border-b border-[#F0EBE6] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="py-4 px-6">Category Name</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Warranty Period (Default)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE6] text-sm text-[#1E2022]">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-[#FAF7F5]/30 transition-colors duration-150">
                      <td className="py-4 px-6 font-semibold">{cat.name}</td>
                      <td className="py-4 px-6 text-[#6B7280] max-w-sm truncate">{cat.description || 'No description'}</td>
                      <td className="py-4 px-6 text-[#6B7280]">{cat.warrantyPeriod}</td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-8 text-[#9CA3AF]">No categories configured.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab C: Employee Directory Table */}
          {activeTab === 'employees' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F5]/80 border-b border-[#F0EBE6] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">System Role</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE6] text-sm text-[#1E2022]">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-[#FAF7F5]/30 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FAF7F5] border border-[#F0EBE6] flex items-center justify-center text-xs font-bold text-[#D97736]">
                            {emp.initials}
                          </div>
                          <span className="font-semibold">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#6B7280]">{emp.email}</td>
                      <td className="py-4 px-6 text-[#6B7280]">{emp.departmentName}</td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-xs text-[#1E2022] capitalize">
                          {emp.role === 'manager' ? 'Asset Manager' : emp.role === 'department_head' ? 'Department Head' : emp.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          emp.status === 'active' 
                            ? 'bg-[#1E4620]/[0.08] text-[#1E4620]' 
                            : 'bg-[#C85C27]/[0.08] text-[#C85C27]'
                        }`}>
                          {emp.status === 'active' ? 'Active' : emp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedEmp(emp);
                            setNewRole(emp.role);
                            setIsRoleModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF7F5] hover:bg-[#F4EFEB] border border-[#E8E2DC] text-[#1E2022] text-xs font-semibold rounded-lg transition-colors"
                        >
                          <Edit2 size={12} />
                          Edit Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         MODALS (Tacile, rounded-2xl overlays with backdrop-blur)
         ───────────────────────────────────────────────────────────── */}

      {/* Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6] bg-[#FAF7F5]">
              <h3 className="font-bold text-[#1E2022] text-base">Add Department</h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#F4EFEB] hover:text-[#1E2022] transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddDept} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Department Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Facilities, Human Resources"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Department Head</label>
                <select
                  value={deptForm.headId}
                  onChange={(e) => setDeptForm(prev => ({ ...prev, headId: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                >
                  <option value="">Select Department Head</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Parent Department</label>
                <select
                  value={deptForm.parentDepartmentId}
                  onChange={(e) => setDeptForm(prev => ({ ...prev, parentDepartmentId: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                >
                  <option value="">None</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold hover:bg-[#FAF7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#D97736] text-white text-sm font-semibold hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all"
                >
                  Add Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6] bg-[#FAF7F5]">
              <h3 className="font-bold text-[#1E2022] text-base">Add Asset Category</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#F4EFEB] hover:text-[#1E2022] transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddCat} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computing, AV Equipment"
                  value={catForm.name}
                  onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Description</label>
                <textarea
                  placeholder="Provide a brief category description..."
                  value={catForm.description}
                  onChange={(e) => setCatForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full p-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Default Warranty Period</label>
                <input
                  type="text"
                  placeholder="e.g. 3 Years, 12 Months"
                  value={catForm.warrantyPeriod}
                  onChange={(e) => setCatForm(prev => ({ ...prev, warrantyPeriod: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold hover:bg-[#FAF7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#D97736] text-white text-sm font-semibold hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {isRoleModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6] bg-[#FAF7F5]">
              <h3 className="font-bold text-[#1E2022] text-base">Assign User Role</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#F4EFEB] hover:text-[#1E2022] transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateRole} className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#FAF7F5] rounded-xl border border-[#F0EBE6]">
                <div className="w-10 h-10 rounded-lg bg-[#D97736]/20 flex items-center justify-center text-xs font-bold text-[#D97736]">
                  {selectedEmp.initials}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#1E2022]">{selectedEmp.name}</h4>
                  <p className="text-xs text-[#9CA3AF]">{selectedEmp.email}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">System Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                >
                  <option value="employee">Employee</option>
                  <option value="department_head">Department Head</option>
                  <option value="manager">Asset Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold hover:bg-[#FAF7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#D97736] text-white text-sm font-semibold hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all"
                >
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
