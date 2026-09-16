import { fireEvent, render, screen } from '@testing-library/react-native';

import { OptionCard } from '../OptionCard';

describe('OptionCard', () => {
  it('announces selection state and toggles on press', async () => {
    const onPress = jest.fn();
    const { rerender } = await render(
      <OptionCard label="Myself" icon="person" selected={false} onPress={onPress} />,
    );
    const card = screen.getByRole('radio', { name: 'Myself' });
    expect(card).not.toBeSelected();
    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalledTimes(1);

    await rerender(<OptionCard label="Myself" icon="person" selected onPress={onPress} />);
    expect(screen.getByRole('radio', { name: 'Myself' })).toBeSelected();
  });

  it('uses the checkbox role for multi select and includes the description in the label', async () => {
    await render(
      <OptionCard
        label="Severe"
        description="Serious reaction"
        icon="warning"
        selected
        role="checkbox"
        onPress={() => undefined}
      />,
    );
    expect(screen.getByRole('checkbox', { name: 'Severe, Serious reaction' })).toBeChecked();
  });
});
