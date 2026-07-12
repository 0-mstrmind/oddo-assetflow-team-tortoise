import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCreateEmployee } from '@/hooks/useAuth';
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
  getCategories, createCategory, updateCategory, deleteCategory,
  getEmployees, updateEmployeeRole, deleteEmployee,
} from '@/services/organization.service';
import {
  ShieldAlert, Plus, Users, Building, FolderOpen,
  X, Edit2, Trash2, Download, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

const inputCls = 'w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all';
const selectCls = 'w-full h-11 px-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all';
const cancelBtnCls = 'flex-1 h-11 rounded-xl border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold hover:bg-[#FAF7F5] transition-colors';
const saveBtnCls = 'flex-1 h-11 rounded-xl bg-[#D97736] text-white text-sm font-semibold hover:bg-[#C85C27] hover:shadow-[0_4px_12px_rgba(217,119,54,0.2)] transition-all';

const ROLE_LABEL = { manager: 'Asset Manager', auditor: 'Auditor', technician: 'Technician', admin: 'Administrator', employee: 'Employee' };

function extractMessage(err, fallback) {
  return err?.response?.data?.message ?? fallback;
}

// ── Reusable Modal wrappers (Defined outside to prevent unmounting on parent re-renders) ──
const Modal = ({ onClose, title, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0EBE6] bg-[#FAF7F5]">
        <h3 className="font-bold text-[#1E2022] text-base">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-md text-[#9CA3AF] hover:bg-[#F4EFEB] hover:text-[#1E2022] transition-colors">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const DeleteConfirmModal = ({ item, label, onConfirm, onClose, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-xl border border-[#F0EBE6] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div className="p-6 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle size={22} className="text-red-600" />
        </div>
        <div>
          <h3 className="font-bold text-[#1E2022] text-base mb-1">Delete {label}</h3>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-[#1E2022]">{item?.name}</span>? This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} disabled={isDeleting} className={cancelBtnCls}>Cancel</button>
          <button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 h-11 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {isDeleting
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Trash2 size={14} />}
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default function OrganizationSetupPage() {
  const user = useAuthStore(s => s.user);
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('departments');

  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Add modals ──────────────────────────────────────────────────
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

  // ── Edit modals ──────────────────────────────────────────────────
  const [editDept, setEditDept] = useState(null);
  const [editCat, setEditCat] = useState(null);
  const [editEmp, setEditEmp] = useState(null); // for role edit

  // ── Delete confirms ──────────────────────────────────────────────
  const [deleteConfirmDept, setDeleteConfirmDept] = useState(null);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState(null);
  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Forms ─────────────────────────────────────────────────────────
  const [deptForm, setDeptForm] = useState({ name: '', headId: '', parentDepartmentId: '' });
  const [catForm, setCatForm] = useState({ name: '', description: '' });
  const [empForm, setEmpForm] = useState({ name: '', email: '', password: '', role: 'employee', departmentId: '' });
  const [newRole, setNewRole] = useState('employee');

  const { mutateAsync: createEmployeeMutation } = useCreateEmployee();

  // ── Fetch ─────────────────────────────────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rawDepts, rawCats, rawEmps] = await Promise.all([getDepartments(), getCategories(), getEmployees()]);
      setDepartments(rawDepts.map(d => ({
        ...d, id: d._id || d.id,
        headName: d.headId?.name || '—',
        parentName: d.parentDepartmentId?.name || '—',
        status: d.status || 'active',
      })));
      setCategories(rawCats.map(c => ({
        ...c, id: c._id || c.id,
      })));
      setEmployees(rawEmps.map(e => ({
        ...e, id: e._id || e.id,
        initials: (e.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        departmentName: e.departmentId?.name || 'Unassigned',
        status: e.status || 'active',
      })));
    } catch (err) {
      toast.error(extractMessage(err, 'Failed to load organization data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin]);

  // ── Handlers: Department ─────────────────────────────────────────
  const handleAddDept = async (e) => {
    e.preventDefault();
    try {
      await createDepartment({
        name: deptForm.name,
        ...(deptForm.headId && { headId: deptForm.headId }),
        ...(deptForm.parentDepartmentId && { parentDepartmentId: deptForm.parentDepartmentId }),
      });
      toast.success('Department added successfully');
      setIsDeptModalOpen(false);
      setDeptForm({ name: '', headId: '', parentDepartmentId: '' });
      fetchData();
    } catch (err) {
      toast.error(extractMessage(err, 'Failed to add department'));
    }
  };

  const handleEditDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDepartment(editDept.id, {
        name: editDept.name,
        headId: editDept.headId || null,
        parentDepartmentId: editDept.parentDepartmentId || null,
      });
      toast.success('Department updated successfully');
      setEditDept(null);
      fetchData();
    } catch (err) {
      toast.error(extractMessage(err, 'Failed to update department'));
    }
  };

  const handleDeleteDept = async () => {
    if (!deleteConfirmDept) return;
    setIsDeleting(true);
    try {
      await deleteDepartment(deleteConfirmDept.id);
      toast.success('Department deleted successfully');
      setDeleteConfirmDept(null);
      fetchData();
    } catch (err) {
      toast.error(extractMessage(err, 'Failed to delete department'));
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Handlers: Category ───────────────────────────────────────────
  const handleAddCat = async (e) => {
    e.preventDefault();
    try {
      await createCategory({
        name: catForm.name,
        description: catForm.description || '',
      });
      toast.success('Category added successfully');
      setIsCatModalOpen(false);
      setCatForm({ name: '', description: '' });
      fetchData();
    } catch (err) {
      toast.error(extractMessage(err, 'Failed to add category'));
    }
  };

  const handleEditCatSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCategory(editCat.id, {
        name: editCat.name,
        description: editCat.description || '',
      });
      toast.success('Category updated successfully');
      setEditCat(null);
      fetchData();
    } catch (err) {
      toast.error(extractMessage(err, 'Failed to update category'));
    }
  };

  const handleDeleteCat = async () => {
    if (!deleteConfirmCat) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteConfirmCat.id);
      toast.success('Category deleted successfully');
      setDeleteConfirmCat(null);
      fetchData();
    } catch (err) {
      toast.error(extractMessage(err, 'Failed to delete category'));
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Handlers: Employee ───────────────────────────────────────────
  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setEmpForm(prev => ({ ...prev, password: pass }));
  };

  const handleAddEmp = async (e) => {
    e.preventDefault();
    try {
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

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editEmp) return;
    try {
      await updateEmployeeRole(editEmp.id, { role: newRole });
      toast.success('Employee role updated successfully');
      setEditEmp(null);
      fetchData();
    } catch (err) {
      toast.error(extractMessage(err, 'Failed to update employee role'));
    }
  };

  const handleDeleteEmp = async () => {
    if (!deleteConfirmEmp) return;
    setIsDeleting(true);
    try {
      await deleteEmployee(deleteConfirmEmp.id);
      toast.success('Employee deleted successfully');
      setDeleteConfirmEmp(null);
      fetchData();
    } catch (err) {
      toast.error(extractMessage(err, 'Failed to delete employee'));
    } finally {
      setIsDeleting(false);
    }
  };

  const exportEmployeesCSV = () => {
    const headers = ['Name', 'Email', 'Department', 'Role', 'Status'];
    const rows = employees.map(e => [
      e.name, e.email,
      e.departmentName || 'Unassigned',
      ROLE_LABEL[e.role] || e.role,
      e.status || 'active',
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'employees.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Guard ─────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-16 h-16 bg-[#C85C27]/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
          <ShieldAlert className="text-[#C85C27]" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-[#1E2022] tracking-tight mb-2">Access Denied</h1>
        <p className="text-sm text-[#9CA3AF] text-center max-w-sm mb-6 leading-relaxed">
          The Organization Setup screen is strictly reserved for Administrators.
        </p>
        <a href="/dashboard" className="px-5 py-2.5 bg-[#1E2022] text-white text-sm font-semibold rounded-full hover:bg-[#2D3135] transition-all">
          Return to Dashboard
        </a>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-[1.75rem] font-bold text-[#1E2022] tracking-[-0.02em] mb-1">Organization Setup</h1>
          <p className="text-sm text-[#9CA3AF] font-medium">Manage company departments, asset categories, and control user roles.</p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'employees' && employees.length > 0 && (
            <button onClick={exportEmployeesCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E8E2DC] text-[#1E2022] text-sm font-semibold rounded-full hover:bg-[#FAF7F5] transition-all shadow-sm">
              <Download size={15} /> Export CSV
            </button>
          )}
          <button
            onClick={() => {
              if (activeTab === 'departments') setIsDeptModalOpen(true);
              if (activeTab === 'categories') setIsCatModalOpen(true);
              if (activeTab === 'employees') setIsEmpModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D97736] text-white text-sm font-semibold rounded-full hover:bg-[#C85C27] hover:shadow-[0_4px_16px_rgba(217,119,54,0.25)] transition-all active:scale-[0.98]">
            <Plus size={16} />
            Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#E8E2DC]/50 p-1.5 rounded-full max-w-lg">
        {[
          { id: 'departments', label: 'Departments', icon: Building },
          { id: 'categories', label: 'Categories', icon: FolderOpen },
          { id: 'employees', label: 'Employee Directory', icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs font-semibold tracking-tight transition-all duration-300 ${activeTab === id ? 'bg-[#1E2022] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#1E2022]'}`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      {isLoading ? (
        <div className="flex items-center justify-center h-[40vh] bg-white rounded-2xl border border-[#F0EBE6] shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#E8E2DC] border-t-[#D97736] rounded-full animate-spin" />
            <p className="text-sm text-[#9CA3AF]">Fetching records...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F0EBE6] shadow-[0_1px_4px_rgba(30,32,34,0.03),0_4px_16px_rgba(30,32,34,0.025)] overflow-hidden">

          {/* Departments Table */}
          {activeTab === 'departments' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F5]/80 border-b border-[#F0EBE6] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="py-4 px-6">Department Name</th>
                    <th className="py-4 px-6">Department Head</th>
                    <th className="py-4 px-6">Parent Department</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE6] text-sm text-[#1E2022]">
                  {departments.map(dept => (
                    <tr key={dept.id} className="hover:bg-[#FAF7F5]/30 transition-colors duration-150">
                      <td className="py-4 px-6 font-semibold">{dept.name}</td>
                      <td className="py-4 px-6 text-[#6B7280]">{dept.headName}</td>
                      <td className="py-4 px-6 text-[#6B7280]">{dept.parentName}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${dept.status === 'active' ? 'bg-[#1E4620]/[0.08] text-[#1E4620]' : 'bg-gray-100 text-gray-500'}`}>
                          {dept.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditDept({ ...dept, headId: dept.headId?._id || dept.headId || '', parentDepartmentId: dept.parentDepartmentId?._id || dept.parentDepartmentId || '' })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF7F5] hover:bg-[#F4EFEB] border border-[#E8E2DC] text-[#1E2022] text-xs font-semibold rounded-lg transition-colors">
                            <Edit2 size={12} /> Edit
                          </button>
                          <button onClick={() => setDeleteConfirmDept(dept)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFF1F0] hover:bg-[#FFE4E2] border border-[#FFC9C6] text-red-600 text-xs font-semibold rounded-lg transition-colors">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {departments.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#F4EFEB] flex items-center justify-center"><Building size={18} className="text-[#D8D2CC]" /></div>
                        <p className="text-sm text-[#9CA3AF]">No departments configured</p>
                        <p className="text-xs text-[#C5BEB8]">Add a department to get started</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Categories Table */}
          {activeTab === 'categories' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F5]/80 border-b border-[#F0EBE6] text-xs font-bold text-[#6B7280] uppercase tracking-wider">
                    <th className="py-4 px-6">Category Name</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EBE6] text-sm text-[#1E2022]">
                  {categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-[#FAF7F5]/30 transition-colors duration-150">
                      <td className="py-4 px-6 font-semibold">{cat.name}</td>
                      <td className="py-4 px-6 text-[#6B7280] max-w-sm truncate">{cat.description || 'No description'}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditCat({ ...cat })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF7F5] hover:bg-[#F4EFEB] border border-[#E8E2DC] text-[#1E2022] text-xs font-semibold rounded-lg transition-colors">
                            <Edit2 size={12} /> Edit
                          </button>
                          <button onClick={() => setDeleteConfirmCat(cat)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFF1F0] hover:bg-[#FFE4E2] border border-[#FFC9C6] text-red-600 text-xs font-semibold rounded-lg transition-colors">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr><td colSpan="3" className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#F4EFEB] flex items-center justify-center"><FolderOpen size={18} className="text-[#D8D2CC]" /></div>
                        <p className="text-sm text-[#9CA3AF]">No categories configured</p>
                        <p className="text-xs text-[#C5BEB8]">Add a category to get started</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Employees Table */}
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
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-[#FAF7F5]/30 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FAF7F5] border border-[#F0EBE6] flex items-center justify-center text-xs font-bold text-[#D97736]">{emp.initials}</div>
                          <span className="font-semibold">{emp.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#6B7280]">{emp.email}</td>
                      <td className="py-4 px-6 text-[#6B7280]">{emp.departmentName}</td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-xs text-[#1E2022]">{ROLE_LABEL[emp.role] || emp.role}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${emp.status === 'active' ? 'bg-[#1E4620]/[0.08] text-[#1E4620]' : 'bg-[#C85C27]/[0.08] text-[#C85C27]'}`}>
                          {emp.status === 'active' ? 'Active' : emp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditEmp(emp); setNewRole(emp.role); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF7F5] hover:bg-[#F4EFEB] border border-[#E8E2DC] text-[#1E2022] text-xs font-semibold rounded-lg transition-colors">
                            <Edit2 size={12} /> Edit Role
                          </button>
                          <button onClick={() => setDeleteConfirmEmp(emp)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFF1F0] hover:bg-[#FFE4E2] border border-[#FFC9C6] text-red-600 text-xs font-semibold rounded-lg transition-colors">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr><td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-[#F4EFEB] flex items-center justify-center"><Users size={18} className="text-[#D8D2CC]" /></div>
                        <p className="text-sm text-[#9CA3AF]">No employees found</p>
                        <p className="text-xs text-[#C5BEB8]">Add an employee to get started</p>
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── ADD MODALS ─────────────────────────────────────────────── */}

      {isDeptModalOpen && (
        <Modal title="Add Department" onClose={() => setIsDeptModalOpen(false)}>
          <form onSubmit={handleAddDept} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Department Name</label>
              <input required placeholder="e.g. Facilities, Human Resources" value={deptForm.name}
                onChange={e => setDeptForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Department Head</label>
              <select value={deptForm.headId} onChange={e => setDeptForm(p => ({ ...p, headId: e.target.value }))} className={selectCls}>
                <option value="">Select Department Head</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Parent Department</label>
              <select value={deptForm.parentDepartmentId} onChange={e => setDeptForm(p => ({ ...p, parentDepartmentId: e.target.value }))} className={selectCls}>
                <option value="">None</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsDeptModalOpen(false)} className={cancelBtnCls}>Cancel</button>
              <button type="submit" className={saveBtnCls}>Add Department</button>
            </div>
          </form>
        </Modal>
      )}

      {isCatModalOpen && (
        <Modal title="Add Asset Category" onClose={() => setIsCatModalOpen(false)}>
          <form onSubmit={handleAddCat} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Category Name</label>
              <input required placeholder="e.g. Computing, AV Equipment" value={catForm.name}
                onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Description</label>
              <textarea placeholder="Brief category description..." value={catForm.description} rows={3}
                onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))}
                className="w-full p-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsCatModalOpen(false)} className={cancelBtnCls}>Cancel</button>
              <button type="submit" className={saveBtnCls}>Add Category</button>
            </div>
          </form>
        </Modal>
      )}

      {isEmpModalOpen && (
        <Modal title="Create Employee" onClose={() => setIsEmpModalOpen(false)}>
          <form onSubmit={handleAddEmp} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Full Name</label>
              <input required placeholder="John Doe" value={empForm.name}
                onChange={e => setEmpForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Email Address</label>
              <input type="email" required placeholder="john@company.com" value={empForm.email}
                onChange={e => setEmpForm(p => ({ ...p, email: e.target.value }))} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Password</label>
              <div className="flex gap-2">
                <input required placeholder="Set initial password..." value={empForm.password}
                  onChange={e => setEmpForm(p => ({ ...p, password: e.target.value }))} className={inputCls} />
                <button type="button" onClick={generateRandomPassword}
                  className="px-4 h-11 rounded-xl bg-[#E8E2DC] text-xs font-semibold text-[#1E2022] hover:bg-[#D97736] hover:text-white transition-colors">
                  Random
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Role</label>
              <select value={empForm.role} onChange={e => setEmpForm(p => ({ ...p, role: e.target.value }))} className={selectCls}>
                <option value="employee">Employee</option>
                <option value="auditor">Auditor</option>
                <option value="technician">Technician</option>
                <option value="manager">Asset Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Department</label>
              <select value={empForm.departmentId} onChange={e => setEmpForm(p => ({ ...p, departmentId: e.target.value }))} className={selectCls}>
                <option value="">None / Unassigned</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsEmpModalOpen(false)} className={cancelBtnCls}>Cancel</button>
              <button type="submit" className={saveBtnCls}>Create Employee</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── EDIT MODALS ───────────────────────────────────────────── */}

      {editDept && (
        <Modal title="Edit Department" onClose={() => setEditDept(null)}>
          <form onSubmit={handleEditDeptSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Department Name</label>
              <input required value={editDept.name}
                onChange={e => setEditDept(p => ({ ...p, name: e.target.value }))} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Department Head</label>
              <select value={editDept.headId} onChange={e => setEditDept(p => ({ ...p, headId: e.target.value }))} className={selectCls}>
                <option value="">None</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Parent Department</label>
              <select value={editDept.parentDepartmentId} onChange={e => setEditDept(p => ({ ...p, parentDepartmentId: e.target.value }))} className={selectCls}>
                <option value="">None</option>
                {departments.filter(d => d.id !== editDept.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditDept(null)} className={cancelBtnCls}>Cancel</button>
              <button type="submit" className={saveBtnCls}>Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {editCat && (
        <Modal title="Edit Category" onClose={() => setEditCat(null)}>
          <form onSubmit={handleEditCatSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Category Name</label>
              <input required value={editCat.name}
                onChange={e => setEditCat(p => ({ ...p, name: e.target.value }))} className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">Description</label>
              <textarea value={editCat.description || ''} rows={3}
                onChange={e => setEditCat(p => ({ ...p, description: e.target.value }))}
                className="w-full p-4 bg-[#FAF7F5] border border-[#E8E2DC] rounded-xl text-sm text-[#1E2022] placeholder:text-[#C4BEB8] focus:border-[#D97736]/50 focus:ring-2 focus:ring-[#D97736]/10 focus:bg-white outline-none transition-all resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditCat(null)} className={cancelBtnCls}>Cancel</button>
              <button type="submit" className={saveBtnCls}>Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {editEmp && (
        <Modal title="Assign User Role" onClose={() => setEditEmp(null)}>
          <form onSubmit={handleUpdateRole} className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[#FAF7F5] rounded-xl border border-[#F0EBE6]">
              <div className="w-10 h-10 rounded-lg bg-[#D97736]/20 flex items-center justify-center text-xs font-bold text-[#D97736]">{editEmp.initials}</div>
              <div>
                <h4 className="font-semibold text-sm text-[#1E2022]">{editEmp.name}</h4>
                <p className="text-xs text-[#9CA3AF]">{editEmp.email}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-[#6B7280]">System Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} className={selectCls}>
                <option value="employee">Employee</option>
                <option value="auditor">Auditor</option>
                <option value="technician">Technician</option>
                <option value="manager">Asset Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditEmp(null)} className={cancelBtnCls}>Cancel</button>
              <button type="submit" className={saveBtnCls}>Save Role</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── DELETE CONFIRMS ────────────────────────────────────────── */}
      {deleteConfirmDept && (
        <DeleteConfirmModal item={deleteConfirmDept} label="Department"
          onConfirm={handleDeleteDept} onClose={() => setDeleteConfirmDept(null)} isDeleting={isDeleting} />
      )}
      {deleteConfirmCat && (
        <DeleteConfirmModal item={deleteConfirmCat} label="Category"
          onConfirm={handleDeleteCat} onClose={() => setDeleteConfirmCat(null)} isDeleting={isDeleting} />
      )}
      {deleteConfirmEmp && (
        <DeleteConfirmModal item={deleteConfirmEmp} label="Employee"
          onConfirm={handleDeleteEmp} onClose={() => setDeleteConfirmEmp(null)} isDeleting={isDeleting} />
      )}
    </div>
  );
}
