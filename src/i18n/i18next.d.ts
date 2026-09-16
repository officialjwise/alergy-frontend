import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    returnNull: false;
    // Keys are intentionally untyped: screen copy is driven by config objects
    // (question configs, option lists) whose keys are plain strings.
  }
}
