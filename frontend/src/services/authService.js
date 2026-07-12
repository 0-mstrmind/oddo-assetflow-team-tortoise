/**
 * Authentication Service Layer
 * 
 * Handles user authentication flows.
 * Replace mock data with actual API calls when backend is ready.
 */

const MOCK_USER = {
  id: 'usr_01H8K3PXY0',
  name: 'Sarah Mitchell',
  email: 'sarah.mitchell@acmecorp.com',
  role: 'Asset Manager',
  department: 'Operations',
  avatar: null,
  permissions: ['assets.read', 'assets.write', 'bookings.manage', 'audits.view'],
};

/**
 * Sign in with email/password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} User session
 */
export async function signIn(email, password) {
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock validation
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  return {
    user: MOCK_USER,
    token: 'mock_jwt_token_' + Date.now(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Sign out the current user.
 * @returns {Promise<void>}
 */
export async function signOut() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return;
}

/**
 * Get current user session.
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return null; // No session by default
}
