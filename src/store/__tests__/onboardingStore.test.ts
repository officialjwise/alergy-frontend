import { useOnboardingStore } from '../onboardingStore';

describe('onboardingStore', () => {
  beforeEach(() => useOnboardingStore.getState().reset());

  it('stores single answers and toggles multi answers', () => {
    const store = useOnboardingStore.getState();
    store.setAnswer('profileFor', 'child');
    store.toggleMulti('watchFor', 'allergies');
    store.toggleMulti('watchFor', 'gluten');
    store.toggleMulti('watchFor', 'allergies');
    expect(useOnboardingStore.getState().answers.profileFor).toBe('child');
    expect(useOnboardingStore.getState().answers.watchFor).toEqual(['gluten']);
  });

  it('removes severities and custom entries together with an ingredient', () => {
    const store = useOnboardingStore.getState();
    store.addIngredient('custom_1', {
      id: 'custom_1',
      name: 'Quinoa',
      aliases: [],
      category: 'grains',
      icon: 'wheat',
      isCustom: true,
    });
    store.setSeverity('custom_1', 'severe');
    store.removeIngredient('custom_1');
    const { answers } = useOnboardingStore.getState();
    expect(answers.ingredients).toEqual([]);
    expect(answers.severities).toEqual({});
    expect(answers.customIngredients).toEqual({});
  });

  it('remembers the current step for resuming', () => {
    useOnboardingStore.getState().setCurrentStep('diet');
    expect(useOnboardingStore.getState().currentStep).toBe('diet');
    expect(useOnboardingStore.getState().hasStarted).toBe(true);
  });
});
