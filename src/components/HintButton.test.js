import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HintButton from './HintButton';

test('HintButton renders with hint icon and shows hint on click', () => {
  const hint = "This is a test hint";
  render(
    <HintButton hint={hint}>
      Test Button
    </HintButton>
  );
  
  // Check that the button renders
  const button = screen.getByRole('button', { name: /test button/i });
  expect(button).toBeInTheDocument();
  
  // Check that the hint icon is present
  const hintIcon = screen.getByRole('button', { name: /show hint/i });
  expect(hintIcon).toBeInTheDocument();
  
  // Check that hint is not initially visible
  expect(screen.queryByText(hint)).not.toBeInTheDocument();
  
  // Click the hint icon
  fireEvent.click(hintIcon);
  
  // Check that hint is now visible
  expect(screen.getByText(hint)).toBeInTheDocument();
  
  // Test ESC key dismisses hint
  fireEvent.keyDown(button, { key: 'Escape' });
  
  // Hint should be gone
  expect(screen.queryByText(hint)).not.toBeInTheDocument();
});

test('HintButton main click functionality works', () => {
  const mockOnClick = jest.fn();
  
  render(
    <HintButton onClick={mockOnClick} hint="Test hint">
      Click Me
    </HintButton>
  );
  
  const button = screen.getByRole('button', { name: /click me/i });
  fireEvent.click(button);
  
  expect(mockOnClick).toHaveBeenCalledTimes(1);
});