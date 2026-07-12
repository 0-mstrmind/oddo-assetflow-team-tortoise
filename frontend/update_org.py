import re

with open('src/pages/OrganizationSetupPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
content = content.replace(
    '''import { useAuthStore } from '@/store/auth.store';''',
    '''import { useAuthStore } from '@/store/auth.store';\nimport { useCreateEmployee } from '@/hooks/useAuth';'''
)

# 2. Add state
content = content.replace(
    '''  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);''',
    '''  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);\n  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);'''
)
content = content.replace(
    '''  const [newRole, setNewRole] = useState('');''',
    '''  const [newRole, setNewRole] = useState('');\n  const [empForm, setEmpForm] = useState({ name: '', email: '', password: '', role: 'employee', departmentId: '' });'''
)

# 3. Add handler
content = content.replace(
    '''  const fetchData = async () => {''',
    '''  const { mutateAsync: createEmployeeMutation } = useCreateEmployee();\n\n  const handleAddEmp = async (e) => {\n    e.preventDefault();\n    try {\n      await createEmployeeMutation(empForm);\n      setIsEmpModalOpen(false);\n      setEmpForm({ name: '', email: '', password: '', role: 'employee', departmentId: '' });\n      fetchData();\n    } catch (err) {\n      console.error(err);\n    }\n  };\n\n  const generateRandomPassword = () => {\n    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';\n    let pass = '';\n    for(let i=0; i<10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));\n    setEmpForm(prev => ({...prev, password: pass}));\n  };\n\n  const fetchData = async () => {'''
)

# 4. Fix button
content = content.replace(
    '''              if (activeTab === 'employees') {\n                alert('To update employee roles or status, use the "Edit Role" button next to individual employee entries.');\n              }''',
    '''              if (activeTab === 'employees') setIsEmpModalOpen(true);'''
)
content = content.replace(
    '''            disabled={activeTab === 'employees'}''',
    '''            '''
)
content = content.replace(
    '''            Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Item'}''',
    '''            Add {activeTab === 'departments' ? 'Department' : activeTab === 'categories' ? 'Category' : 'Employee'}'''
)

# 5. Add modal JSX
modal_jsx = '''
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
                  <option value="department_head">Department Head</option>
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
      )}
'''
content = content.replace(
    '''    </div>\n  );\n}''',
    modal_jsx + '''    </div>\n  );\n}'''
)

with open('src/pages/OrganizationSetupPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('updated')
