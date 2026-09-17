import { useOnboardingStore } from '../onboardingStore';

describe('onboardingStore', () => {
  beforeEach(() => useOnboardingStore.getState().reset());

  it('stores answers, picked foods and typed foods', () => {
    const store = useOnboardingStore.getState();
    store.setAnswer('hasAllergies', 'yes');
    store.togglePicked('peanuts');
    store.togglePicked('milk');
    store.togglePicked('peanuts');
    store.addTyped('dragon fruit', { kind: 'custom', id: 'custom_dragon-fruit' });
    const { answers } = useOnboardingStore.getState();
    expect(answers.hasAllergies).toBe('yes');
    expect(answers.pickedFoods).toEqual(['milk']);
    expect(answers.typedFoods).toHaveLength(1);
  });

  it('keeps per-food answers and condition end dates', () => {
    const store = useOnboardingStore.getState();
    store.setFoodAnswer('milk', { kind: 'allergy' });
    store.setFoodAnswer('milk', { worst: 'unsure' });
    store.toggleCondition('pregnancy');
    store.setConditionEnd('pregnancy', '2027-01-10');
    const { answers } = useOnboardingStore.getState();
    expect(answers.perFood.milk).toMatchObject({ kind: 'allergy', worst: 'unsure' });
    expect(answers.conditions).toEqual(['pregnancy']);
    expect(answers.conditionEnds.pregnancy).toBe('2027-01-10');
  });

  it('remembers the current step for resuming and starts fresh for another person', () => {
    useOnboardingStore.getState().setCurrentStep('food-worst:milk');
    expect(useOnboardingStore.getState().currentStep).toBe('food-worst:milk');
    useOnboardingStore.getState().startFor('other');
    expect(useOnboardingStore.getState().answers.target).toBe('other');
    expect(useOnboardingStore.getState().currentStep).toBeNull();
  });
});
