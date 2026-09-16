import { activeSteps, stepPosition } from '../steps';
import { emptyAnswers } from '@/store/onboardingStore';

describe('onboarding steps', () => {
  it('hides conditional steps until their answers exist', () => {
    const routes = activeSteps(emptyAnswers).map((s) => s.route);
    expect(routes).not.toContain('profile-name');
    expect(routes).not.toContain('severity');
    expect(routes).not.toContain('camera-permission');
  });

  it('inserts steps without the progress ever decreasing', () => {
    const before = stepPosition('who', emptyAnswers).progress;
    const after = stepPosition('profile-name', { ...emptyAnswers, profileFor: 'child' }).progress;
    const later = stepPosition('birth', { ...emptyAnswers, profileFor: 'child' }).progress;
    expect(after).toBeGreaterThan(before);
    expect(later).toBeGreaterThan(after);
  });

  it('links previous and next steps', () => {
    const position = stepPosition('frequency', emptyAnswers);
    expect(position.previous?.route).toBe('birth');
    expect(position.next?.route).toBe('tried-apps');
  });
});
