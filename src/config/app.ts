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
    rewardText: 'You both get a month of the Family plan when they join.',
    code: 'ALLERGY-7F3K',
    link: 'https://allergyapp.example/invite/ALLERGY-7F3K',
  },
} as const;
