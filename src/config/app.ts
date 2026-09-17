/**
 * Product configuration that marketing or support may change without a code
 * change once it comes from the backend. Nothing in the UI hardcodes these.
 */
export const appConfig = {
  supportEmail: 'support@allergyapp.example',
  social: {
    instagram: 'https://instagram.com/allergyapp',
    tiktok: 'https://tiktok.com/@allergyapp',
    x: 'https://x.com/allergyapp',
  },
  /** Builds older than this must update before they can be used. */
  minimumVersion: '1.0.0',
  storeUrl: 'https://apps.apple.com/app/id0000000000',
  referral: {
    /** Row title on Profile ("Refer a friend and earn $10"). */
    title: 'Refer a friend and earn $10',
    /** Row description and the "How to earn" line. */
    body: 'Earn $10 per friend that signs up with your promo code.',
    earnLine: 'Earn $10 per friend that signs up with your code',
    code: 'YLFGYH',
    link: 'https://allergyapp.example/invite/YLFGYH',
  },
  familyPlan: {
    priceLine: 'Only $2.50/mo more! ($59.99/yr)',
    maxMembers: 6,
  },
} as const;
