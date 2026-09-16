import { fireEvent, render, screen } from '@testing-library/react-native';

import { ProgressHeader } from '../ProgressHeader';

describe('ProgressHeader', () => {
  it('exposes progress as a percentage and handles back', async () => {
    const onBack = jest.fn();
    await render(
      <ProgressHeader
        progress={0.25}
        onBack={onBack}
        backLabel="Go back"
        progressLabel="Progress"
      />,
    );
    expect(screen.getByRole('progressbar', { name: 'Progress' })).toHaveAccessibilityValue({
      now: 25,
    });
    await fireEvent.press(screen.getByRole('button', { name: 'Go back' }));
    expect(onBack).toHaveBeenCalled();
  });
});
