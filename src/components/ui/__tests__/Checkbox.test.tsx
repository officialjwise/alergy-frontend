import { fireEvent, render, screen } from '@testing-library/react-native';

import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  it('reports the toggled value', async () => {
    const onChange = jest.fn();
    await render(<Checkbox checked={false} onChange={onChange} label="I agree" />);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'I agree' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
