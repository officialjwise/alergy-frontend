import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '../Button';

describe('Button', () => {
  it('renders the title and calls onPress', async () => {
    const onPress = jest.fn();
    await render(<Button title="Continue" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled and exposes the disabled state', async () => {
    const onPress = jest.fn();
    await render(<Button title="Continue" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Continue' });
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('shows a spinner instead of the label while loading', async () => {
    await render(<Button title="Continue" loading />);
    expect(screen.queryByText('Continue')).toBeNull();
    expect(screen.getByRole('button')).toBeBusy();
  });
});
