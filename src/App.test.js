import { render, screen } from '@testing-library/react';
import App from './App';

test('renders FGO application with navigation', () => {
  render(<App />);
  const instructionsLink = screen.getByRole('link', { name: /instructions/i });
  expect(instructionsLink).toBeInTheDocument();
  
  const teamSelectionLink = screen.getByRole('link', { name: /team selection/i });
  expect(teamSelectionLink).toBeInTheDocument();
  
  const questSelectionLink = screen.getByRole('link', { name: /quest selection/i });
  expect(questSelectionLink).toBeInTheDocument();
  
  // Check that main content loads
  const welcomeHeading = screen.getByText(/Welcome to FGOCanItFarmReactApp/i);
  expect(welcomeHeading).toBeInTheDocument();
});
