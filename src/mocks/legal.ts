/** Placeholder legal copy until the real documents are provided. */
export const LEGAL_DOCS = {
  terms: {
    titleKey: 'legal.terms',
    updated: '2026-09-01',
    sections: [
      {
        heading: '1. Using the app',
        body: 'The app helps you check foods against the ingredients you choose to avoid. It is a convenience tool and not a substitute for reading labels, medical advice or the judgement of the person eating.',
      },
      {
        heading: '2. No medical advice',
        body: 'Results are generated from label text and your own profile. They can be incomplete or wrong. Always read the label, ask the restaurant, and follow your clinician’s guidance.',
      },
      {
        heading: '3. Your account',
        body: 'You are responsible for the accuracy of the profiles you create and for keeping your sign-in method secure. You can delete your account at any time from Settings.',
      },
      {
        heading: '4. Changes',
        body: 'We may update these terms. We will show the new version in the app and ask you to accept it when the changes are material.',
      },
    ],
  },
  privacy: {
    titleKey: 'legal.privacy',
    updated: '2026-09-01',
    sections: [
      {
        heading: 'What we store',
        body: 'Your food profiles, scan history and settings are stored on your device. When you sign in they are also synced to your account so you can restore them on a new phone.',
      },
      {
        heading: 'Photos',
        body: 'Photos you take to scan a label are processed to read the text and are not kept after the result is produced unless you save the food.',
      },
      {
        heading: 'Your choices',
        body: 'You can switch off notifications, change or delete profiles, and delete your account and all associated data from Settings at any time.',
      },
      {
        heading: 'Contact',
        body: 'Questions about privacy can be sent to the address listed on the app store page.',
      },
    ],
  },
} as const;

export type LegalDocKey = keyof typeof LEGAL_DOCS;
