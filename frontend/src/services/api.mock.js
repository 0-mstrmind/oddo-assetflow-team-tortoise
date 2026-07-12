/**
 * AssetFlow — Mock API Service Layer
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

// ═══════════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════════

export async function mockSignIn(email, password) {
  await delay(700);

  if (!email || !password) {
    throw new Error('Email and password are required.');
  }
  if (password.length < 4) {
    throw new Error('Invalid credentials.');
  }

  return {
    user: {
      id: 'usr_01J8K3PXY0',
      name: 'Sarah Mitchell',
      email: email,
      role: 'asset_manager',
      department: 'Operations',
      avatar: null,
      initials: 'SM',
      permissions: [
        'assets.read', 'assets.write', 'assets.register',
        'bookings.manage', 'bookings.view',
        'allocations.manage', 'transfers.approve',
        'maintenance.manage',
        'audits.view', 'audits.submit',
        'reports.view',
      ],
    },
    token: 'mock_jwt_' + Date.now(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  };
}

export async function mockSignUp(name, email, password) {
  await delay(800);

  if (!name || !email || !password) {
    throw new Error('All fields are required.');
  }

  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return {
    user: {
      id: 'usr_' + Date.now(),
      name,
      email,
      role: 'employee', // new signups are always employees
      department: 'Unassigned',
      avatar: null,
      initials,
      permissions: ['assets.read', 'bookings.view'],
    },
    token: 'mock_jwt_' + Date.now(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD KPIs
// ═══════════════════════════════════════════════════════════════════

export async function getDashboardKPIs() {
  await delay(350);

  return {
    available: { count: 142, trend: '+8', trendDirection: 'up' },
    allocated: { count: 89, trend: '+3', trendDirection: 'up' },
    activeBookings: { count: 24, trend: '-2', trendDirection: 'down' },
    pendingTransfers: { count: 7, trend: '+1', trendDirection: 'up' },
    upcomingReturns: { count: 12, trend: '0', trendDirection: 'neutral' },
  };
}

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD ALERTS
// ═══════════════════════════════════════════════════════════════════

export async function getDashboardAlerts() {
  await delay(200);

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

// ═══════════════════════════════════════════════════════════════════
//  RECENT ACTIVITY FEED
// ═══════════════════════════════════════════════════════════════════

export async function getRecentActivity() {
  await delay(300);

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
    {
      id: 'act_004',
      type: 'maintenance',
      description: 'Printer AF-0053 sent for maintenance — paper feed issue',
      department: 'Admin',
      actor: 'Jordan Kim',
      timestamp: '2026-07-12T08:30:00Z',
      relativeTime: '1.5 hrs ago',
      icon: 'wrench',
    },
    {
      id: 'act_005',
      type: 'registration',
      description: 'New asset registered: Dell U2723QE Monitor (AF-0221)',
      department: 'IT',
      actor: 'Sarah Mitchell',
      timestamp: '2026-07-12T08:10:00Z',
      relativeTime: '2 hrs ago',
      icon: 'plus-circle',
    },
    {
      id: 'act_006',
      type: 'transfer',
      description: 'Transfer request: 3× Standing Desks from Floor 2 → Floor 5',
      department: 'Facilities',
      actor: 'Ravi Patel',
      timestamp: '2026-07-11T17:20:00Z',
      relativeTime: 'Yesterday',
      icon: 'arrow-right-left',
    },
    {
      id: 'act_007',
      type: 'audit',
      description: 'Quarterly audit completed for Engineering Dept. — 98% accuracy',
      department: 'Engineering',
      actor: 'Sarah Mitchell',
      timestamp: '2026-07-11T15:00:00Z',
      relativeTime: 'Yesterday',
      icon: 'clipboard-check',
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════
//  QUICK ACTIONS (configurable per role)
// ═══════════════════════════════════════════════════════════════════

export async function getQuickActions(role) {
  await delay(100);

  const actions = [
    {
      id: 'register',
      label: '+ Register Asset',
      href: '/assets/register',
      variant: 'primary',
      requiredPermission: 'assets.register',
    },
    {
      id: 'book',
      label: 'Book Resource',
      href: '/bookings/new',
      variant: 'secondary',
      requiredPermission: 'bookings.manage',
    },
    {
      id: 'request',
      label: 'Raise Request',
      href: '/requests/new',
      variant: 'secondary',
      requiredPermission: 'assets.read', // everyone can raise requests
    },
  ];

  return actions;
}

// ═══════════════════════════════════════════════════════════════════
//  NAVIGATION CONFIG
// ═══════════════════════════════════════════════════════════════════

export async function getNavigationItems() {
  await delay(50);

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
