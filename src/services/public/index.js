/**
 * 📦 PUBLIC APIs INDEX
 * Không cần authentication - Sử dụng cho Guest users
 */

// Auth APIs (Register, Login, Google Login)
export * from './authService';

// Pets APIs (GET pets list, GET pet details)
export * from './petsService';

// Shelters APIs (GET shelters list, GET shelter details)
export * from './sheltersService';

// Posts/Blog APIs (GET posts, GET post details)
export * from './postsService';

// Home Stats APIs (GET homepage statistics)
export * from './homeStatsService';

// Adoption APIs (POST adoption request, GET adoption details)
export * from './adoptionService';

// Donation APIs (POST create payment, handle VNPay callback)
export * from './donationService';

// Surrender / Rescue Request API
export * from './surrenderService';
