/**
 * Billing module exports
 * Centralized access to all billing functionality
 */

// Constants and types
export {
  PLANS,
  PLANS_LIST,
  type PlanType,
  type Plan,
  type PlanFeatures,
  getPlan,
  isFreeplan,
  isProOrHigher,
  isProMax,
  getFeatureLimit,
  isLimitReached,
} from "./constants"

// Permission checking
export {
  getPlanPermissions,
  canUserCreateInterview,
  canUserCreateQuestion,
  canUserAnalyzeResume,
  getRemainingQuota,
  formatQuotaMessage,
  type PlanPermissions,
} from "./permissions"

// Subscription management
export {
  getUserSubscription,
  upsertUserSubscription,
  getUserPlan,
  updateUserPlan,
  cancelUserSubscription,
  getSubscriptionStatus,
  type SubscriptionRecord,
} from "./subscription"
