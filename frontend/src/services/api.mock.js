/**
 * AssetFlow — Mock API Service Layer (Persistent in LocalStorage)
 * 
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  IMPORTANT: This file is the SINGLE SOURCE for all mock data.  │
 * │  When the backend is ready, replace the return statements      │
 * │  inside each function with actual fetch/axios calls.           │
 * │  The function signatures and return shapes MUST stay the same. │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * Every function returns a Promise to simulate async API behavior.
 */

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

// ═══════════════════════════════════════════════════════════════════
//  AUTH API MOCKS
// ═══════════════════════════════════════════════════════════════════

export async function mockSignIn(email, password) {
  await delay(700);
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
  await delay(800);
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
  await delay(200);
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
  await delay(300);
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
  await delay(150);
  return getStorageItem('af_categories', DEFAULT_CATEGORIES);
}

export async function addCategory(catData) {
  await delay(200);
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
  await delay(200);
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
  await delay(200);
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
  await delay(250);
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
  await delay(300);
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
  await delay(200);
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
  await delay(400);
  const assets = getStorageItem('af_assets', DEFAULT_ASSETS);
  const allocations = getStorageItem('af_allocations', DEFAULT_ALLOCATIONS);
  const employees = getStorageItem('af_employees', DEFAULT_EMPLOYEES);

  const assetIndex = assets.findIndex(a => a.id === assetId);
  if (assetIndex === -1) throw new Error('Asset not found');

  const asset = assets[assetIndex];
  
  // ── Conflict Check ──
  if (asset.status === 'allocated') {
    const activeAlloc = allocations.find(a => a.assetId === assetId && a.status === 'active');
    const currentHolder = activeAlloc ? employees.find(e => e.id === activeAlloc.employeeId) : null;
    const holderName = currentHolder ? currentHolder.name : 'another employee';
    throw new Error(`Conflict: Asset is already allocated to ${holderName}. Direct re-allocation is blocked.`);
  }

  // Complete successful allocation
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
  await delay(300);
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
  await delay(150);
  return getStorageItem('af_resources', DEFAULT_RESOURCES);
}

export async function addResource(resData) {
  await delay(200);
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
  await delay(200);
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

// Time overlap checker helper: parses HH:MM to minutes
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export async function createBooking(bookingData) {
  await delay(400);
  const bookings = getStorageItem('af_bookings', DEFAULT_BOOKINGS);
  const employees = getStorageItem('af_employees', DEFAULT_EMPLOYEES);

  const { resourceId, date, startTime, endTime, bookedBy } = bookingData;

  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  if (startMin >= endMin) {
    throw new Error('Conflict: Start time must be before end time.');
  }

  // ── Overlap Validation Check ──
  const activeBookings = bookings.filter(
    b => b.resourceId === resourceId && b.date === date && b.status !== 'cancelled'
  );

  const overlap = activeBookings.find(b => {
    const existingStart = timeToMinutes(b.startTime);
    const existingEnd = timeToMinutes(b.endTime);
    // overlap exists if: (startA < endB) and (endA > startB)
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

  // Return with user details populated
  const emp = employees.find(e => e.id === newBooking.bookedBy);
  return {
    ...newBooking,
    bookedByName: emp ? emp.name : 'Unknown User',
  };
}

// ═══════════════════════════════════════════════════════════════════
//  OTHER DASHBOARD AND ACTIVITY MOCKS (Retained for backwards compatibility)
// ═══════════════════════════════════════════════════════════════════

export async function getDashboardKPIs() {
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
