/**
 * Asset Service Layer
 * 
 * Manages all asset CRUD operations, filtering, and pagination.
 * Replace mock data with actual fetch/axios calls when backend is ready.
 */

const MOCK_ASSETS = [
  {
    id: 'ast_001',
    assetTag: 'AST-2024-001',
    name: 'MacBook Pro 16" M3 Max',
    category: 'Laptop',
    department: 'Engineering',
    status: 'active',
    assignedTo: 'Alex Rivera',
    purchaseDate: '2024-01-15',
    warrantyExpiry: '2027-01-15',
    value: 3499.00,
    location: 'HQ — Floor 3, Desk 42',
    lastAudit: '2024-11-01',
    condition: 'excellent',
  },
  {
    id: 'ast_002',
    assetTag: 'AST-2024-002',
    name: 'Herman Miller Aeron Chair',
    category: 'Furniture',
    department: 'Design',
    status: 'active',
    assignedTo: 'Priya Sharma',
    purchaseDate: '2024-03-22',
    warrantyExpiry: '2036-03-22',
    value: 1895.00,
    location: 'HQ — Floor 2, Studio B',
    lastAudit: '2024-10-15',
    condition: 'good',
  },
  {
    id: 'ast_003',
    assetTag: 'AST-2023-047',
    name: 'Epson WorkForce Pro WF-4830',
    category: 'Printer',
    department: 'Admin',
    status: 'maintenance',
    assignedTo: null,
    purchaseDate: '2023-06-10',
    warrantyExpiry: '2025-06-10',
    value: 349.99,
    location: 'HQ — Floor 1, Print Bay',
    lastAudit: '2024-09-20',
    condition: 'fair',
    maintenanceNote: 'Paper feed mechanism requires service',
  },
  {
    id: 'ast_004',
    assetTag: 'AST-2024-018',
    name: 'Dell UltraSharp U2723QE 27" 4K',
    category: 'Monitor',
    department: 'Engineering',
    status: 'active',
    assignedTo: 'Jordan Kim',
    purchaseDate: '2024-02-28',
    warrantyExpiry: '2027-02-28',
    value: 619.99,
    location: 'HQ — Floor 3, Desk 38',
    lastAudit: '2024-11-01',
    condition: 'excellent',
  },
  {
    id: 'ast_005',
    assetTag: 'AST-2022-091',
    name: 'Cisco Meraki MR46 Access Point',
    category: 'Networking',
    department: 'IT Infrastructure',
    status: 'active',
    assignedTo: null,
    purchaseDate: '2022-09-05',
    warrantyExpiry: '2025-09-05',
    value: 750.00,
    location: 'HQ — Floor 3, Ceiling Zone C',
    lastAudit: '2024-08-12',
    condition: 'good',
  },
];

/**
 * Fetch all assets.
 * @returns {Promise<Array>}
 */
export async function getAssets() {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return MOCK_ASSETS;
}

/**
 * Fetch a single asset by ID.
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getAssetById(id) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const asset = MOCK_ASSETS.find((a) => a.id === id);
  if (!asset) throw new Error(`Asset ${id} not found`);
  return asset;
}

/**
 * Get asset statistics.
 * @returns {Promise<Object>}
 */
export async function getAssetStats() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return {
    totalAssets: 248,
    activeAssets: 221,
    inMaintenance: 12,
    retired: 15,
    totalValue: 1247850.00,
    overdueAudits: 8,
  };
}
