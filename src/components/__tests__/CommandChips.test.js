/**
 * FR-6: command sequence rendered as deletable chips.
 *
 * Pins the small contract CommandChips exposes:
 *  - one chip per token, labelled via humanizeToken (with index prefix);
 *  - syntactically invalid tokens render with the "Invalid: …" label;
 *  - deleting a chip calls setCommands with that index removed.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommandChips from '../CommandChips';

const team = [
  { collectionNo: 11 },
  { collectionNo: 268 },
  { collectionNo: 314 },
];
const servants = [
  { collectionNo: 11, name: 'Emiya' },
  { collectionNo: 268, name: 'Space Ishtar' },
  { collectionNo: 314, name: 'Koyanskaya of Light' },
];

describe('CommandChips', () => {
  test('renders one chip per token with humanised labels', () => {
    render(<CommandChips commands={['a', 'b1', '4', '#']} team={team} servants={servants} />);
    expect(screen.getByRole('list', { name: 'Command sequence' })).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent('1. S1 · Skill 1');
    expect(items[1]).toHaveTextContent('2. S1 · Skill 2 → ally Emiya');
    expect(items[2]).toHaveTextContent('3. S1 NP');
    expect(items[3]).toHaveTextContent('4. End turn');
  });

  test('empty state shows a hint instead of an empty chip row', () => {
    render(<CommandChips commands={[]} team={team} servants={servants} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByText(/No commands yet/i)).toBeInTheDocument();
  });

  test('syntactically invalid tokens render with an "Invalid:" label', () => {
    render(<CommandChips commands={['a', 'Swap Servants', 'c']} team={team} servants={servants} />);
    const items = screen.getAllByRole('listitem');
    expect(items[1]).toHaveTextContent('Invalid: Swap Servants');
  });

  test('deleting a chip drops that token from the command list', async () => {
    const user = userEvent.setup();
    const setCommands = jest.fn();
    render(<CommandChips commands={['a', 'b', 'c']} team={team} servants={servants} setCommands={setCommands} />);
    // MUI Chip wires its delete button as a CancelIcon with aria-label="delete".
    const deleteButtons = screen.getAllByTestId('CancelIcon');
    await user.click(deleteButtons[1]);
    expect(setCommands).toHaveBeenCalledWith(['a', 'c']);
  });

  test('failedIndex marks the failing token "failed" and subsequent tokens "invalidated"', () => {
    render(
      <CommandChips
        commands={['a', 'b', 'c', '4']}
        team={team}
        servants={servants}
        failedIndex={1}
      />,
    );
    const items = screen.getAllByRole('listitem');
    // Index 0 is fine.
    expect(items[0].getAttribute('aria-label')).not.toMatch(/failed|invalidated/);
    // Index 1 is the failure.
    expect(items[1].getAttribute('aria-label')).toMatch(/failed/);
    // Indices 2 & 3 are invalidated (after the failure).
    expect(items[2].getAttribute('aria-label')).toMatch(/invalidated/);
    expect(items[3].getAttribute('aria-label')).toMatch(/invalidated/);
  });

  test('failedIndex = -1 leaves every chip in the normal state', () => {
    render(
      <CommandChips
        commands={['a', 'b', 'c']}
        team={team}
        servants={servants}
        failedIndex={-1}
      />,
    );
    const items = screen.getAllByRole('listitem');
    for (const it of items) {
      expect(it.getAttribute('aria-label')).not.toMatch(/failed|invalidated/);
    }
  });
});
