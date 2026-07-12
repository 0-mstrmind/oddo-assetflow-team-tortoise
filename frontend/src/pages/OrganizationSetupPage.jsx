import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCreateEmployee } from '@/hooks/useAuth';
import {
  getDepartments,
  createDepartment,
  getCategories,
  createCategory,
  getEmployees,
  updateEmployeeRole,
  deleteEmployee,
} from '@/services/organization.service';
import {
  ShieldAlert,
  Plus,
  Users,
  Building,
  FolderOpen,
  X,
  Edit2,
  Trash2,
  Download,
  AlertTriangle,
} from 'lucide-react';

export default function OrganizationSetupPage() {
  const user = useAuthStore(s => s.user);
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
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState(null); // emp to delete
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal forms
  const [deptForm, setDeptForm] = useState({ name: '', headId: '', parentDepartmentId: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '', warrantyPeriod: '' });
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [empForm, setEmpForm] = useState({ name: '', email: '', password: '', role: 'employee', departmentId: '' });

  // Fetch all initial data
  const { mutateAsync: createEmployeeMutation } = useCreateEmployee();

  const handleAddEmp = async (e) => {
    e.preventDefault();
    try {
      // Strip empty departmentId — MongoDB rejects empty string as ObjectId
      const payload = { ...empForm };
      if (!payload.departmentId) delete payload.departmentId;
      await createEmployeeMutation(payload);
      setIsEmpModalOpen(false);
      setEmpForm({ name: '', email: '', password: '', role: 'employee', departmentId: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for(let i=0; i<10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setEmpForm(prev => ({...prev, password: pass}));
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rawDepts, rawCats, rawEmps] = await Promise.all([
        getDepartments(),
        getCategories(),
        getEmployees(),
      ]);

      // Normalize departments
      setDepartments(rawDepts.map(d => ({
        ...d,
        id: d._id || d.id,
        headName: d.headId?.name || d.headName || '—',
        parentName: d.parentDepartmentId?.name || d.parentName || '—',
        status: d.status || 'active',
      })));

      // Normalize categories
      setCategories(rawCats.map(c => ({
        ...c,
        id: c._id || c.id,
        warrantyPeriod: c.warrantyPeriod || c.defaultWarrantyPeriod || '—',
      })));

      // Normalize employees
      setEmployees(rawEmps.map(e => ({
        ...e,
        id: e._id || e.id,
        initials: (e.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        departmentName: e.departmentId?.name || e.departmentName || 'Unassigned',
        status: e.status || 'active',
      })));
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
      await createDepartment({
        name: deptForm.name,
        ...(deptForm.headId && { headId: deptForm.headId }),
        ...(deptForm.parentDepartmentId && { parentDepartmentId: deptForm.parentDepartmentId }),
      });
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
      await createCategory({
        name: catForm.name,
        ...(catForm.description && { description: catForm.description }),
        ...(catForm.warrantyPeriod && { warrantyPeriod: catForm.warrantyPeriod }),
      });
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
      await updateEmployeeRole(selectedEmp.id, { role: newRole });
      setIsRoleModalOpen(false);
      setSelectedEmp(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEmp = async () => {
    if (!deleteConfirmEmp) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteConfirmEmp.id);
      setDeleteConfirmEmp(null);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportEmployeesCSV = () => {
    const headers = ['Name', 'Email', 'Department', 'Role', 'Status'];
    const rows = employees.map(e => [
      e.name,
      e.email,
      e.departmentName || 'Unassigned',
      e.role === 'manager' ? 'Asset Manager' : e.role === 'auditor' ? 'Auditor' : e.role === 'technician' ? 'Technician' : e.role === 'admin' ? 'Administrator' : 'Employee',
      e.status || 'active',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    URL.revokeObjectURL(url);
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

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {activeTab === 'employees' && employees.length > 0 && (
            <button
              onClick={exportEmployeesCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold rounded-full hover:bg-[#FAF7F5] transition-all shadow-sm"
            >
              <Download size={15} />
              Export CSV
            </button>
          )}
          <button
            onClick={() => {
              if (activeTab === 'departments') setIsDeptModalOpen(true);
              if (activeTab === 'categories') setIsCatModalOpen(true);
              if (activeTab === 'employees') setIsEmpModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D97736] text-white text-sm font-semibold rounded-full hover:bg-[#C85C27] hover:shadow-[0_4px_16px_rgba(217,119,54,0.25)] transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}
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
                          {emp.role === 'manager' ? 'Asset Manager' : emp.role === 'auditor' ? 'Auditor' : emp.role === 'technician' ? 'Technician' : emp.role === 'admin' ? 'Administrator' : 'Employee'}
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
                        <div className="flex items-center justify-end gap-2">
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
                          <button
                            onClick={() => setDeleteConfirmEmp(emp)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFF1F0] hover:bg-[#FFE4E2] border border-[#FFC9C6] text-[#C0392B] text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-[#F4EFEB] flex items-center justify-center">
                            <Users size={18} className="text-[#D8D2CC]" />
                          </div>
                          <p className="text-sm text-[#9CA3AF]">No employees found</p>
                          <p className="text-xs text-[#C5BEB8]">Add an employee to get started</p>
                        </div>
                      </td>
                    </tr>
                  )}
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
                  <option value="auditor">Auditor</option>
                  <option value="technician">Technician</option>
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

      {/* Employee Modal */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6] bg-[#FAF7F5]">
              <h3 className="font-bold text-[#1E2022] text-base">Create Employee</h3>
              <button onClick={() => setIsEmpModalOpen(false)} className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#F4EFEB] hover:text-[#1E2022] transition-colors">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddEmp} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Full Name</label>
                <input
                  type="text" required
                  placeholder="John Doe"
                  value={empForm.name}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Email Address</label>
                <input
                  type="email" required
                  placeholder="john@company.com"
                  value={empForm.email}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Password</label>
                <div className="flex gap-2">
                  <input
                    type="text" required
                    placeholder="Set initial password..."
                    value={empForm.password}
                    onChange={(e) => setEmpForm(prev => ({ ...prev, password: e.target.value }))}
                    className="flex-1 h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                  />
                  <button type="button" onClick={generateRandomPassword} className="px-4 h-11 rounded-xl bg-[#E8E2DC] text-xs font-semibold text-[#1E2022] hover:bg-[#D97736] hover:text-white transition-colors">
                    Random
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Role</label>
                <select
                  value={empForm.role}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                >
                  <option value="employee">Employee</option>
                  <option value="auditor">Auditor</option>
                  <option value="technician">Technician</option>
                  <option value="manager">Asset Manager</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-[#6B7280]">Department</label>
                <select
                  value={empForm.departmentId}
                  onChange={(e) => setEmpForm(prev => ({ ...prev, departmentId: e.target.value }))}
                  className="w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all"
                >
                  <option value="">None / Unassigned</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold hover:bg-[#FAF7F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#D97736] text-white text-sm font-semibold hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle size={22} className="text-[#C0392B]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1E2022] text-base mb-1">Delete Employee</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-[#1E2022]">{deleteConfirmEmp.name}</span>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full pt-1">
                <button
                  onClick={() => setDeleteConfirmEmp(null)}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-xl border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold hover:bg-[#FAF7F5] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteEmp}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
