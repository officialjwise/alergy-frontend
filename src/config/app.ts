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
  referral: {
    rewardText: 'You both get a month of the Family plan when they join.',
    code: 'ALLERGY-7F3K',
    link: 'https://allergyapp.example/invite/ALLERGY-7F3K',
  },
} as const;
