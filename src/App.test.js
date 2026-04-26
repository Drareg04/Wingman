import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Wingman header', () => {
  render(<App />);
  expect(screen.getByText(/wingman/i)).toBeInTheDocument();
});
