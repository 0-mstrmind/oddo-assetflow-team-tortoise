import { useAppStore } from '@/store/useAppStore';
import { useAuthStore } from '@/store/auth.store';

/**
 * AssetFlow — Mock API Service Layer (Persistent in LocalStorage)
 * Intercepted with a global isDemoMode check to redirect to the live backend API when disabled.
 */

// Dynamic base URL resolver: defaults to port 4000 in dev mode, relative in prod
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '');

// Helper to make API calls to backend when demo mode is off
async function apiRequest(path, options = {}) {
  const token = useAuthStore.getState().token;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error: ${response.status} ${response.statusText}`);
  }

  const res = await response.json();
  return res.data !== undefined ? res.data : res;
}

// ─── Simulated Delay ──────────────────────────────────────────────
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// Helper to load/save state from local storage so UI is fully dynamic
function getStorageItem(key, defaultVal) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStorageItem(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════════
//  INITIAL MOCK DATA (aligned with backend model shapes)
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_DEPARTMENTS = [
  { id: 'dept_001', name: 'Engineering', headId: 'usr_002', parentDepartmentId: null, status: 'active' },
  { id: 'dept_002', name: 'Design', headId: 'usr_003', parentDepartmentId: null, status: 'active' },
  { id: 'dept_003', name: 'Operations', headId: 'usr_001', parentDepartmentId: null, status: 'active' },
  { id: 'dept_004', name: 'Marketing', headId: 'usr_004', parentDepartmentId: null, status: 'active' },
  { id: 'dept_005', name: 'QA Testing', headId: 'usr_005', parentDepartmentId: 'dept_001', status: 'active' },
];

const DEFAULT_CATEGORIES = [
  { id: 'cat_001', name: 'Laptop', description: 'Enterprise work computers', warrantyPeriod: '3 Years' },
  { id: 'cat_002', name: 'Furniture', description: 'Office desks, ergonomic chairs', warrantyPeriod: '10 Years' },
  { id: 'cat_003', name: 'Printer', description: 'Office printing & scanning devices', warrantyPeriod: '2 Years' },
  { id: 'cat_004', name: 'Monitor', description: 'Displays and 4k screens', warrantyPeriod: '3 Years' },
  { id: 'cat_005', name: 'Networking', description: 'Routers, APs, Switches', warrantyPeriod: '5 Years' },
];

const DEFAULT_EMPLOYEES = [
  { id: 'usr_001', name: 'Sarah Mitchell', email: 'sarah@assetflow.com', departmentId: 'dept_003', role: 'manager', status: 'active', initials: 'SM' },
  { id: 'usr_002', name: 'Alex Rivera', email: 'alex@assetflow.com', departmentId: 'dept_001', role: 'department_head', status: 'active', initials: 'AR' },
  { id: 'usr_003', name: 'Priya Shah', email: 'priya@assetflow.com', departmentId: 'dept_002', role: 'department_head', status: 'active', initials: 'PS' },
  { id: 'usr_004', name: 'Jordan Kim', email: 'jordan@assetflow.com', departmentId: 'dept_004', role: 'employee', status: 'active', initials: 'JK' },
  { id: 'usr_005', name: 'Ravi Patel', email: 'ravi@assetflow.com', departmentId: 'dept_005', role: 'employee', status: 'active', initials: 'RP' },
  { id: 'usr_006', name: 'Admin User', email: 'admin@assetflow.com', departmentId: 'dept_003', role: 'admin', status: 'active', initials: 'AU' },
];

const DEFAULT_ASSETS = [
  {
    id: 'ast_001',
    assetTag: 'AF-0001',
    name: 'MacBook Pro 16" M3 Max',
    categoryId: 'cat_001',
    serialNumber: 'C02F89XXMD6M',
    acquisitionDate: '2024-01-15',
    acquisitionCost: 3499.00,
    condition: 'new',
    location: 'HQ — Floor 3, Desk 42',
    status: 'allocated',
    isBookable: false,
    assignedTo: 'Alex Rivera',
    departmentId: 'dept_001'
  },
  {
    id: 'ast_002',
    assetTag: 'AF-0002',
    name: 'Herman Miller Aeron Chair',
    categoryId: 'cat_002',
    serialNumber: 'HM-AERON-9988',
    acquisitionDate: '2024-03-22',
    acquisitionCost: 1895.00,
    condition: 'good',
    location: 'HQ — Floor 2, Studio B',
    status: 'available',
    isBookable: true,
    assignedTo: null,
    departmentId: 'dept_002'
  },
  {
    id: 'ast_003',
    assetTag: 'AF-0003',
    name: 'Epson WorkForce Pro WF-4830',
    categoryId: 'cat_003',
    serialNumber: 'EP-4830-7711',
    acquisitionDate: '2023-06-10',
    acquisitionCost: 349.99,
    condition: 'fair',
    location: 'HQ — Floor 1, Print Bay',
    status: 'maintenance',
    isBookable: true,
    assignedTo: null,
    departmentId: 'dept_003'
  },
  {
    id: 'ast_004',
    assetTag: 'AF-0004',
    name: 'Dell UltraSharp U2723QE 27" 4K',
    categoryId: 'cat_004',
    serialNumber: 'CN-0D98R1-778',
    acquisitionDate: '2024-02-28',
    acquisitionCost: 619.99,
    condition: 'new',
    location: 'HQ — Floor 3, Desk 38',
    status: 'allocated',
    isBookable: false,
    assignedTo: 'Jordan Kim',
    departmentId: 'dept_004'
  },
  {
    id: 'ast_005',
    assetTag: 'AF-0005',
    name: 'Cisco Meraki MR46 Access Point',
    categoryId: 'cat_005',
    serialNumber: 'Q2JD-77TY-WWQ',
    acquisitionDate: '2022-09-05',
    acquisitionCost: 750.00,
    condition: 'good',
    location: 'HQ — Floor 3, Ceiling Zone C',
    status: 'available',
    isBookable: false,
    assignedTo: null,
    departmentId: 'dept_003'
  },
];

const DEFAULT_ALLOCATIONS = [
  { id: 'al_001', assetId: 'ast_001', employeeId: 'usr_002', allocatedBy: 'usr_001', allocatedAt: '2024-01-20', expectedReturnDate: '2026-01-20', status: 'active' },
  { id: 'al_002', assetId: 'ast_004', employeeId: 'usr_004', allocatedBy: 'usr_001', allocatedAt: '2024-03-01', expectedReturnDate: '2025-03-01', status: 'active' },
];

const DEFAULT_TRANSFERS = [
  { id: 'tr_001', assetId: 'ast_001', fromEmployeeId: 'usr_002', toEmployeeId: 'usr_005', requestedBy: 'usr_002', approvedBy: null, reason: 'Developer moving to QA team', status: 'pending', requestedAt: '2026-07-12' },
];

const DEFAULT_RESOURCES = [
  { id: 'res_001', name: 'Conference Room B2', type: 'Room', location: 'Floor 2, Room 204', status: 'available' },
  { id: 'res_002', name: 'Projector Alpha', type: 'Equipment', location: 'Floor 1, Print Bay', status: 'available' },
  { id: 'res_003', name: 'Huddle space Studio D', type: 'Room', location: 'Floor 2, Studio D', status: 'available' },
];

const DEFAULT_BOOKINGS = [
  { id: 'bk_001', resourceId: 'res_001', bookedBy: 'usr_002', startTime: '10:00', endTime: '11:30', date: new Date().toISOString().split('T')[0], status: 'confirmed' },
  { id: 'bk_002', resourceId: 'res_001', bookedBy: 'usr_003', startTime: '14:00', endTime: '15:30', date: new Date().toISOString().split('T')[0], status: 'confirmed' },
];

const DEFAULT_MAINTENANCE = [
  { id: 'm_001', assetTag: 'AF-0003', name: 'Epson WorkForce Pro WF-4830', issue: 'Paper feed rollers are slipping', priority: 'medium', status: 'pending', technician: 'Jordan Kim' },
  { id: 'm_002', assetTag: 'AF-0001', name: 'MacBook Pro 16"', issue: 'Battery expanding', priority: 'critical', status: 'approved', technician: 'Ravi Patel' },
  { id: 'm_003', assetTag: 'AF-0005', name: 'Cisco Meraki MR46 AP', issue: 'Frequent dropouts and firmware update failure', priority: 'high', status: 'technician_assigned', technician: 'Jordan Kim' },
  { id: 'm_004', assetTag: 'AF-0004', name: 'Dell UltraSharp Monitor', issue: 'Lines on screen', priority: 'low', status: 'in_progress', technician: 'Ravi Patel' },
  { id: 'm_005', assetTag: 'AF-0002', name: 'Herman Miller Aeron Chair', issue: 'Tilted armrest replacement', priority: 'low', status: 'resolved', technician: 'Jordan Kim' },
];

const DEFAULT_AUDIT_CYCLE = { name: 'Q3 Audit: Engineering Dept', active: true, department: 'Engineering' };

const DEFAULT_AUDIT_ASSETS = [
  { id: 'au_001', assetTag: 'AF-0001', name: 'MacBook Pro 16" M3 Max', expectedLocation: 'HQ — Floor 3, Desk 42', status: 'pending' },
  { id: 'au_002', assetTag: 'AF-0004', name: 'Dell UltraSharp U2723QE 27" 4K', expectedLocation: 'HQ — Floor 3, Desk 38', status: 'pending' },
  { id: 'au_003', assetTag: 'AF-0002', name: 'Herman Miller Aeron Chair', expectedLocation: 'HQ — Floor 2, Studio B', status: 'pending' },
  { id: 'au_004', assetTag: 'AF-0005', name: 'Cisco Meraki MR46 Access Point', expectedLocation: 'HQ — Floor 3, Ceiling Zone C', status: 'pending' },
];

const DEFAULT_ACTIVITY_LOGS = [
  { id: 'log_001', text: 'Laptop AF-0001 allocated to Alex Rivera', category: 'allocation', relativeTime: '2m ago', isAlert: false },
  { id: 'log_002', text: 'Printer AF-0003 flagged for maintenance by Jordan Kim', category: 'alerts', relativeTime: '15m ago', isAlert: true },
  { id: 'log_003', text: 'Conference Room B2 booked from 10:00 - 11:30 by Alex Rivera', category: 'bookings', relativeTime: '1h ago', isAlert: false },
  { id: 'log_004', text: 'Transfer request raised for Monitor AF-0004 by Jordan Kim', category: 'approvals', relativeTime: '2h ago', isAlert: true },
  { id: 'log_005', text: 'Herman Miller chair status set to available by Admin User', category: 'allocation', relativeTime: '1d ago', isAlert: false },
];

// ═══════════════════════════════════════════════════════════════════
//  AUTH API MOCKS / INTERCEPTS
// ═══════════════════════════════════════════════════════════════════

export async function mockSignIn(email, password) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  await delay(500);
  if (!email || !password) throw new Error('Email and password are required.');

  const cleanedEmail = email.toLowerCase().trim();
  const employees = getStorageItem('af_employees', DEFAULT_EMPLOYEES);
  let foundUser = employees.find(e => e.email.toLowerCase() === cleanedEmail);

  if (!foundUser) {
    if (cleanedEmail.startsWith('admin')) {
      foundUser = { id: 'usr_admin', name: 'System Admin', email: cleanedEmail, departmentId: 'dept_003', role: 'admin', status: 'active', initials: 'SA' };
    } else if (cleanedEmail.startsWith('manager')) {
      foundUser = { id: 'usr_manager', name: 'Sarah Mitchell', email: cleanedEmail, departmentId: 'dept_003', role: 'manager', status: 'active', initials: 'SM' };
    } else if (cleanedEmail.startsWith('head')) {
      foundUser = { id: 'usr_head', name: 'Alex Rivera', email: cleanedEmail, departmentId: 'dept_001', role: 'department_head', status: 'active', initials: 'AR' };
    } else {
      foundUser = { id: 'usr_emp', name: 'Priya Shah', email: cleanedEmail, departmentId: 'dept_002', role: 'employee', status: 'active', initials: 'PS' };
    }
  }

  let permissions = ['assets.read'];
  if (foundUser.role === 'admin') {
    permissions = ['assets.read', 'assets.write', 'assets.register', 'bookings.manage', 'bookings.view', 'allocations.manage', 'transfers.approve', 'maintenance.manage', 'audits.view', 'audits.submit', 'reports.view'];
  } else if (foundUser.role === 'manager') {
    permissions = ['assets.read', 'assets.write', 'assets.register', 'bookings.view', 'allocations.manage', 'maintenance.manage', 'audits.view', 'audits.submit'];
  } else if (foundUser.role === 'department_head') {
    permissions = ['assets.read', 'bookings.manage', 'bookings.view', 'transfers.approve'];
  } else if (foundUser.role === 'employee') {
    permissions = ['assets.read', 'bookings.view'];
  }

  return {
    user: { ...foundUser, permissions },
    token: 'mock_jwt_' + Date.now(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  };
}

export async function mockSignUp(name, email, password) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  await delay(600);
  if (!name || !email || !password) throw new Error('All fields are required.');

  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const newEmp = {
    id: 'usr_' + Date.now(),
    name,
    email: email.toLowerCase().trim(),
    departmentId: 'dept_001',
    role: 'employee',
    status: 'active',
    initials
  };

  const employees = getStorageItem('af_employees', DEFAULT_EMPLOYEES);
  employees.push(newEmp);
  setStorageItem('af_employees', employees);

  return {
    user: { ...newEmp, permissions: ['assets.read', 'bookings.view'] },
    token: 'mock_jwt_' + Date.now(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════
//  ORGANIZATION SETUP (DEPARTMENTS, CATEGORIES, EMPLOYEES)
// ═══════════════════════════════════════════════════════════════════

export async function getDepartments() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/departments');
  }

  await delay(100);
  const departments = getStorageItem('af_departments', DEFAULT_DEPARTMENTS);
  const employees = getStorageItem('af_employees', DEFAULT_EMPLOYEES);
  
  return departments.map(dept => {
    const head = employees.find(e => e.id === dept.headId);
    const parent = departments.find(d => d.id === dept.parentDepartmentId);
    return {
      ...dept,
      headName: head ? head.name : 'None',
      parentName: parent ? parent.name : 'None',
    };
  });
}

export async function addDepartment(deptData) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/departments', {
      method: 'POST',
      body: JSON.stringify(deptData),
    });
  }

  await delay(150);
  const departments = getStorageItem('af_departments', DEFAULT_DEPARTMENTS);
  const newDept = {
    id: 'dept_' + Date.now(),
    name: deptData.name,
    headId: deptData.headId || null,
    parentDepartmentId: deptData.parentDepartmentId || null,
    status: 'active',
  };
  departments.push(newDept);
  setStorageItem('af_departments', departments);
  return newDept;
}

export async function getCategories() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/categories');
  }

  await delay(100);
  return getStorageItem('af_categories', DEFAULT_CATEGORIES);
}

export async function addCategory(catData) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(catData),
    });
  }

  await delay(150);
  const categories = getStorageItem('af_categories', DEFAULT_CATEGORIES);
  const newCat = {
    id: 'cat_' + Date.now(),
    name: catData.name,
    description: catData.description || '',
    warrantyPeriod: catData.warrantyPeriod || 'None',
  };
  categories.push(newCat);
  setStorageItem('af_categories', categories);
  return newCat;
}

export async function getEmployees() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/employees');
  }

  await delay(100);
  const employees = getStorageItem('af_employees', DEFAULT_EMPLOYEES);
  const departments = getStorageItem('af_departments', DEFAULT_DEPARTMENTS);

  return employees.map(emp => {
    const dept = departments.find(d => d.id === emp.departmentId);
    return {
      ...emp,
      departmentName: dept ? dept.name : 'Unassigned',
    };
  });
}

export async function updateEmployeeRole(employeeId, newRole) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest(`/employees/${employeeId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole }),
    });
  }

  await delay(150);
  const employees = getStorageItem('af_employees', DEFAULT_EMPLOYEES);
  const index = employees.findIndex(e => e.id === employeeId);
  if (index !== -1) {
    employees[index].role = newRole;
    setStorageItem('af_employees', employees);
    return employees[index];
  }
  throw new Error('Employee not found');
}

// ═══════════════════════════════════════════════════════════════════
//  ASSET MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

export async function getAssets() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/assets');
  }

  await delay(150);
  const assets = getStorageItem('af_assets', DEFAULT_ASSETS);
  const categories = getStorageItem('af_categories', DEFAULT_CATEGORIES);
  const departments = getStorageItem('af_departments', DEFAULT_DEPARTMENTS);

  return assets.map(asset => {
    const cat = categories.find(c => c.id === asset.categoryId);
    const dept = departments.find(d => d.id === asset.departmentId);
    return {
      ...asset,
      categoryName: cat ? cat.name : 'General',
      departmentName: dept ? dept.name : 'Unassigned',
    };
  });
}

export async function registerAsset(assetData) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
  }

  await delay(200);
  const assets = getStorageItem('af_assets', DEFAULT_ASSETS);
  const nextNum = String(assets.length + 1).padStart(4, '0');
  const assetTag = `AF-${nextNum}`;

  const newAsset = {
    id: 'ast_' + Date.now(),
    assetTag,
    name: assetData.name,
    categoryId: assetData.categoryId,
    serialNumber: assetData.serialNumber || '',
    acquisitionDate: assetData.acquisitionDate || new Date().toISOString().split('T')[0],
    acquisitionCost: parseFloat(assetData.acquisitionCost) || 0,
    condition: assetData.condition || 'new',
    location: assetData.location || 'HQ Office',
    status: 'available',
    isBookable: assetData.isBookable || false,
    assignedTo: null,
    departmentId: assetData.departmentId || null
  };

  assets.push(newAsset);
  setStorageItem('af_assets', assets);
  return newAsset;
}

// ═══════════════════════════════════════════════════════════════════
//  CONFLICT ENGINE (ALLOCATIONS & TRANSFERS)
// ═══════════════════════════════════════════════════════════════════

export async function getAllocationHistory(assetId) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest(`/allocations/history/${assetId}`);
  }

  await delay(100);
  const allocations = getStorageItem('af_allocations', DEFAULT_ALLOCATIONS);
  const employees = getStorageItem('af_employees', DEFAULT_EMPLOYEES);

  return allocations
    .filter(a => a.assetId === assetId)
    .map(a => {
      const emp = employees.find(e => e.id === a.employeeId);
      const allocator = employees.find(e => e.id === a.allocatedBy);
      return {
        ...a,
        employeeName: emp ? emp.name : 'Unknown Employee',
        allocatedByName: allocator ? allocator.name : 'System',
      };
    })
    .sort((a, b) => new Date(b.allocatedAt) - new Date(a.allocatedAt));
}

export async function allocateAsset(assetId, employeeId, expectedReturnDate, allocatedById) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/allocations', {
      method: 'POST',
      body: JSON.stringify({ assetId, employeeId, expectedReturnDate, allocatedById }),
    });
  }

  await delay(200);
  const assets = getStorageItem('af_assets', DEFAULT_ASSETS);
  const allocations = getStorageItem('af_allocations', DEFAULT_ALLOCATIONS);
  const employees = getStorageItem('af_employees', DEFAULT_EMPLOYEES);

  const assetIndex = assets.findIndex(a => a.id === assetId);
  if (assetIndex === -1) throw new Error('Asset not found');

  const asset = assets[assetIndex];
  if (asset.status === 'allocated') {
    const activeAlloc = allocations.find(a => a.assetId === assetId && a.status === 'active');
    const currentHolder = activeAlloc ? employees.find(e => e.id === activeAlloc.employeeId) : null;
    const holderName = currentHolder ? currentHolder.name : 'another employee';
    throw new Error(`Conflict: Asset is already allocated to ${holderName}. Direct re-allocation is blocked.`);
  }

  assets[assetIndex].status = 'allocated';
  const targetEmp = employees.find(e => e.id === employeeId);
  assets[assetIndex].assignedTo = targetEmp ? targetEmp.name : 'Unknown';
  setStorageItem('af_assets', assets);

  const newAlloc = {
    id: 'al_' + Date.now(),
    assetId,
    employeeId,
    allocatedBy: allocatedById || 'usr_001',
    allocatedAt: new Date().toISOString().split('T')[0],
    expectedReturnDate: expectedReturnDate || '',
    status: 'active',
  };
  allocations.push(newAlloc);
  setStorageItem('af_allocations', allocations);

  return newAlloc;
}

export async function submitTransferRequest(assetId, toEmployeeId, reason, requestedById) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/transfers', {
      method: 'POST',
      body: JSON.stringify({ assetId, toEmployeeId, reason, requestedById }),
    });
  }

  await delay(150);
  const transfers = getStorageItem('af_transfers', DEFAULT_TRANSFERS);
  const allocations = getStorageItem('af_allocations', DEFAULT_ALLOCATIONS);
  
  const activeAlloc = allocations.find(a => a.assetId === assetId && a.status === 'active');
  const fromEmployeeId = activeAlloc ? activeAlloc.employeeId : requestedById;

  const newTransfer = {
    id: 'tr_' + Date.now(),
    assetId,
    fromEmployeeId,
    toEmployeeId,
    requestedBy: requestedById || 'usr_001',
    approvedBy: null,
    reason,
    status: 'pending',
    requestedAt: new Date().toISOString().split('T')[0],
  };

  transfers.push(newTransfer);
  setStorageItem('af_transfers', transfers);
  return newTransfer;
}

// ═══════════════════════════════════════════════════════════════════
//  CONFLICT ENGINE (RESOURCE BOOKING)
// ═══════════════════════════════════════════════════════════════════

export async function getResources() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/resources');
  }

  await delay(100);
  return getStorageItem('af_resources', DEFAULT_RESOURCES);
}

export async function addResource(resData) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/resources', {
      method: 'POST',
      body: JSON.stringify(resData),
    });
  }

  await delay(150);
  const resources = getStorageItem('af_resources', DEFAULT_RESOURCES);
  const newRes = {
    id: 'res_' + Date.now(),
    name: resData.name,
    type: resData.type || 'Room',
    location: resData.location || '',
    status: 'available',
  };
  resources.push(newRes);
  setStorageItem('af_resources', resources);
  return newRes;
}

export async function getBookings(resourceId, date) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest(`/bookings?resourceId=${resourceId}&date=${date}`);
  }

  await delay(150);
  const bookings = getStorageItem('af_bookings', DEFAULT_BOOKINGS);
  const employees = getStorageItem('af_employees', DEFAULT_EMPLOYEES);

  return bookings
    .filter(b => b.resourceId === resourceId && b.date === date && b.status !== 'cancelled')
    .map(b => {
      const emp = employees.find(e => e.id === b.bookedBy);
      return {
        ...b,
        bookedByName: emp ? emp.name : 'Unknown User',
      };
    });
}

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export async function createBooking(bookingData) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  await delay(200);
  const bookings = getStorageItem('af_bookings', DEFAULT_BOOKINGS);
  const employees = getStorageItem('af_employees', DEFAULT_EMPLOYEES);

  const { resourceId, date, startTime, endTime, bookedBy } = bookingData;
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  if (startMin >= endMin) throw new Error('Conflict: Start time must be before end time.');

  const activeBookings = bookings.filter(
    b => b.resourceId === resourceId && b.date === date && b.status !== 'cancelled'
  );

  const overlap = activeBookings.find(b => {
    const existingStart = timeToMinutes(b.startTime);
    const existingEnd = timeToMinutes(b.endTime);
    return startMin < existingEnd && endMin > existingStart;
  });

  if (overlap) {
    const holder = employees.find(e => e.id === overlap.bookedBy);
    const holderName = holder ? holder.name : 'another team';
    throw new Error(`Conflict: Slot is unavailable. Overlaps with booking from ${overlap.startTime} - ${overlap.endTime} by ${holderName}.`);
  }

  const newBooking = {
    id: 'bk_' + Date.now(),
    resourceId,
    bookedBy: bookedBy || 'usr_001',
    startTime,
    endTime,
    date,
    status: 'confirmed',
  };

  bookings.push(newBooking);
  setStorageItem('af_bookings', bookings);

  const emp = employees.find(e => e.id === newBooking.bookedBy);
  return { ...newBooking, bookedByName: emp ? emp.name : 'Unknown User' };
}

// ═══════════════════════════════════════════════════════════════════
//  SCREEN 7: KANBAN MAINTENANCE
// ═══════════════════════════════════════════════════════════════════

export async function getMaintenanceRequests() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/maintenance');
  }

  await delay(200);
  const data = getStorageItem('af_maintenance', DEFAULT_MAINTENANCE);
  const uniqueMap = new Map();
  data.forEach(item => {
    uniqueMap.set(item.id, item);
  });
  const cleaned = Array.from(uniqueMap.values());
  setStorageItem('af_maintenance', cleaned);
  return cleaned;
}

export async function addMaintenanceRequest(data) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  await delay(250);
  const list = getStorageItem('af_maintenance', DEFAULT_MAINTENANCE);
  const newReq = {
    id: 'm_' + Date.now(),
    assetTag: data.assetTag,
    name: data.name,
    issue: data.issue,
    priority: data.priority || 'medium',
    status: 'pending',
    technician: data.technician || 'Unassigned',
  };
  list.push(newReq);
  setStorageItem('af_maintenance', list);
  return newReq;
}

export async function updateMaintenanceStatus(id, newStatus) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest(`/maintenance/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  }

  await delay(150);
  const list = getStorageItem('af_maintenance', DEFAULT_MAINTENANCE);
  const index = list.findIndex(m => m.id === id);
  if (index !== -1) {
    list[index].status = newStatus;
    setStorageItem('af_maintenance', list);
    return list[index];
  }
  throw new Error('Request not found');
}

// ═══════════════════════════════════════════════════════════════════
//  SCREEN 8: AUDIT
// ═══════════════════════════════════════════════════════════════════

export async function getActiveAuditCycle() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/audits/active');
  }

  await delay(100);
  return getStorageItem('af_audit_cycle', DEFAULT_AUDIT_CYCLE);
}

export async function getAuditAssets() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/audits/assets');
  }

  await delay(200);
  return getStorageItem('af_audit_assets', DEFAULT_AUDIT_ASSETS);
}

export async function verifyAuditAsset(id, newStatus) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest(`/audits/assets/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  }

  await delay(100);
  const list = getStorageItem('af_audit_assets', DEFAULT_AUDIT_ASSETS);
  const index = list.findIndex(a => a.id === id);
  if (index !== -1) {
    list[index].status = newStatus;
    setStorageItem('af_audit_assets', list);
    return list[index];
  }
  throw new Error('Audit asset not found');
}

export async function closeAuditCycle() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/audits/close', { method: 'POST' });
  }

  await delay(300);
  const list = getStorageItem('af_audit_assets', DEFAULT_AUDIT_ASSETS);
  
  const total = list.length;
  const verified = list.filter(a => a.status === 'verified').length;
  const missing = list.filter(a => a.status === 'missing').length;
  const damaged = list.filter(a => a.status === 'damaged').length;
  const pending = list.filter(a => a.status === 'pending').length;

  return {
    cycleName: DEFAULT_AUDIT_CYCLE.name,
    closedAt: new Date().toISOString().split('T')[0],
    stats: { total, verified, missing, damaged, pending },
    discrepancies: list.filter(a => a.status === 'missing' || a.status === 'damaged'),
  };
}

// ═══════════════════════════════════════════════════════════════════
//  SCREEN 10: NOTIFICATIONS & ACTIVITY LOGS
// ═══════════════════════════════════════════════════════════════════

export async function getActivityLogs(category = 'all') {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest(`/activity-logs?category=${category}`);
  }

  await delay(150);
  const logs = getStorageItem('af_activity_logs', DEFAULT_ACTIVITY_LOGS);
  if (category === 'all') return logs;
  return logs.filter(l => l.category === category);
}

// ═══════════════════════════════════════════════════════════════════
//  OTHER DASHBOARD AND ACTIVITY MOCKS (Retained for backwards compatibility)
// ═══════════════════════════════════════════════════════════════════

export async function getDashboardKPIs() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/dashboard/kpis');
  }

  await delay(100);
  const assets = getStorageItem('af_assets', DEFAULT_ASSETS);
  const available = assets.filter(a => a.status === 'available').length;
  const allocated = assets.filter(a => a.status === 'allocated').length;
  const maintenance = assets.filter(a => a.status === 'maintenance').length;
  
  return {
    available: { count: available + 138, trend: '+8', trendDirection: 'up' }, 
    allocated: { count: allocated + 85, trend: '+3', trendDirection: 'up' },
    activeBookings: { count: 24, trend: '-2', trendDirection: 'down' },
    pendingTransfers: { count: 7, trend: '+1', trendDirection: 'up' },
    upcomingReturns: { count: 12, trend: '0', trendDirection: 'neutral' },
  };
}

export async function getDashboardAlerts() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/dashboard/alerts');
  }

  await delay(100);
  return [
    {
      id: 'alert_001',
      type: 'overdue',
      severity: 'warning',
      message: '3 assets overdue for return',
      detail: 'Flagged for follow-up',
      timestamp: '2026-07-12T08:00:00Z',
      actionLabel: 'View Details',
      actionHref: '/allocations?filter=overdue',
    },
    {
      id: 'alert_002',
      type: 'maintenance',
      severity: 'info',
      message: '5 assets due for scheduled maintenance this week',
      detail: null,
      timestamp: '2026-07-12T07:30:00Z',
      actionLabel: 'Review Schedule',
      actionHref: '/maintenance',
    },
  ];
}

export async function getRecentActivity() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/dashboard/activity');
  }

  await delay(100);
  return [
    {
      id: 'act_001',
      type: 'allocation',
      description: 'Laptop AF-0114 allocated to Priya Shah',
      department: 'Design',
      actor: 'Sarah Mitchell',
      timestamp: '2026-07-12T09:42:00Z',
      relativeTime: '18 min ago',
      icon: 'laptop',
    },
    {
      id: 'act_002',
      type: 'return',
      description: 'Projector AF-0087 returned by Marketing Dept.',
      department: 'Marketing',
      actor: 'System',
      timestamp: '2026-07-12T09:15:00Z',
      relativeTime: '45 min ago',
      icon: 'undo',
    },
    {
      id: 'act_003',
      type: 'booking',
      description: 'Conference Room B booked for Jul 14, 2–4 PM',
      department: 'Engineering',
      actor: 'Alex Rivera',
      timestamp: '2026-07-12T08:55:00Z',
      relativeTime: '1 hr ago',
      icon: 'calendar',
    },
  ];
}

export async function getQuickActions(role) {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest(`/dashboard/quick-actions?role=${role}`);
  }

  const actions = [];
  if (role === 'admin' || role === 'manager') {
    actions.push({
      id: 'register',
      label: '+ Register Asset',
      href: '/assets?register=true',
      variant: 'primary',
    });
  }
  actions.push({
    id: 'book',
    label: 'Book Resource',
    href: '/bookings',
    variant: 'secondary',
  });
  actions.push({
    id: 'request',
    label: 'Raise Request',
    href: '/allocations',
    variant: 'secondary',
  });
  return actions;
}

export async function getNavigationItems() {
  const isDemoMode = useAppStore.getState().isDemoMode;
  if (!isDemoMode) {
    return apiRequest('/navigation');
  }

  return [
    { id: 'dashboard',      label: 'Dashboard',             icon: 'layout-dashboard', href: '/dashboard' },
    { id: 'organization',   label: 'Organization Setup',    icon: 'building-2',       href: '/organization' },
    { id: 'assets',         label: 'Assets',                icon: 'package',          href: '/assets' },
    { id: 'allocation',     label: 'Allocation & Transfer', icon: 'arrow-right-left', href: '/allocations' },
    { id: 'booking',        label: 'Resource Booking',      icon: 'calendar-clock',   href: '/bookings' },
    { id: 'maintenance',    label: 'Maintenance',           icon: 'wrench',           href: '/maintenance' },
    { id: 'audit',          label: 'Audit',                 icon: 'clipboard-check',  href: '/audit' },
    { id: 'reports',        label: 'Reports',               icon: 'bar-chart-3',      href: '/reports' },
    { id: 'notifications',  label: 'Notifications',         icon: 'bell',             href: '/notifications', badge: 3 },
  ];
}
