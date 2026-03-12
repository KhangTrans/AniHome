/**
 * 🛡️ ADMIN APIs INDEX
 * Role: Admin (RoleID = 1)
 * Requires: accessToken + Admin role
 */

// Admin Dashboard
export * from './adminDashboardService';

// Admin Shelters Management
export * from './adminSheltersService';

// Admin Content Moderation (Posts & Reports)
export * from './adminModerationService';

// Admin Categories Management
export * from './adminCategoriesService';

// Admin Profile
export * from './adminProfileService';

// Admin Pets Management
export * from './adminPetsService';

// Admin Donations History
export * from './adminDonationsService';
