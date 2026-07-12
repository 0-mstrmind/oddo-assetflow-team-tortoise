/**
 * Landing Page Service Layer
 * 
 * All data for the landing page is served through this module.
 * When the backend is ready, swap the mock data with actual fetch calls.
 * 
 * Pattern: Each function returns a Promise, simulating async API behavior.
 */

const MOCK_FEATURES = [
  {
    id: 'allocation',
    title: 'Conflict-Free Allocation',
    description: 'Intelligent resource allocation that prevents double-bookings and conflicts automatically. Every team gets exactly what they need, when they need it.',
    icon: 'shield-check',
    gradient: 'from-[#1E4620] to-[#2D6A31]',
  },
  {
    id: 'booking',
    title: 'Time-Slot Resource Booking',
    description: 'Granular scheduling with drag-and-drop simplicity. Book equipment by the hour, day, or week with instant availability visibility.',
    icon: 'calendar-clock',
    gradient: 'from-[#D97736] to-[#C85C27]',
  },
  {
    id: 'maintenance',
    title: 'Dynamic Maintenance Workflows',
    description: 'Proactive maintenance scheduling that adapts to usage patterns. Never miss a service window or let assets fall into disrepair.',
    icon: 'wrench',
    gradient: 'from-[#D49B28] to-[#B8841E]',
  },
  {
    id: 'audits',
    title: 'Structured Audits',
    description: 'Complete audit trails with compliance-ready reporting. Track every movement, assignment, and lifecycle event with zero manual effort.',
    icon: 'clipboard-check',
    gradient: 'from-[#2D3135] to-[#1E2022]',
  },
];

const MOCK_STATS = [
  { label: 'Assets Managed', value: '2.4M+', description: 'across 500+ enterprises' },
  { label: 'Uptime', value: '99.97%', description: 'guaranteed SLA' },
  { label: 'Faster Audits', value: '85%', description: 'time reduction average' },
  { label: 'Team Satisfaction', value: '4.9/5', description: 'from 10k+ reviews' },
];

const MOCK_NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Enterprise', href: '#enterprise' },
];

/**
 * Fetches feature cards for the landing page value proposition grid.
 * @returns {Promise<Array>} Feature objects
 */
export async function getFeatures() {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_FEATURES;
}

/**
 * Fetches stats for the social proof section.
 * @returns {Promise<Array>} Stats objects
 */
export async function getStats() {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return MOCK_STATS;
}

/**
 * Fetches navigation links.
 * @returns {Promise<Array>} Nav link objects
 */
export async function getNavLinks() {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return MOCK_NAV_LINKS;
}
