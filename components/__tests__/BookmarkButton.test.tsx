import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookmarkButton from '../BookmarkButton';

jest.mock('@/lib/auth', () => ({ getCurrentUser: jest.fn() }));
jest.mock('@/lib/savedJobs', () => ({
  isJobSaved: jest.fn(),
  toggleSaveJob: jest.fn(),
}));

const mockGetCurrentUser = require('@/lib/auth').getCurrentUser as jest.Mock;
const mockIsJobSaved = require('@/lib/savedJobs').isJobSaved as jest.Mock;
const mockToggleSaveJob = require('@/lib/savedJobs').toggleSaveJob as jest.Mock;

describe('BookmarkButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ user: { id: 'u1' } });
  });

  it('loads saved state on mount', async () => {
    mockIsJobSaved.mockResolvedValue(true);
    const { getByLabelText } = render(
      <BookmarkButton jobId="job-1" onToggle={jest.fn()} />
    );

    await waitFor(() => getByLabelText('bookmark icon'));
    expect(mockIsJobSaved).toHaveBeenCalledWith('u1', 'job-1');
  });

  it('toggles save state and calls callback', async () => {
    mockIsJobSaved.mockResolvedValue(false);
    mockToggleSaveJob.mockResolvedValue(true);
    const onToggle = jest.fn();

    const { getByLabelText } = render(<BookmarkButton jobId="job-2" onToggle={onToggle} />);

    await waitFor(() => getByLabelText('bookmark icon'));
    fireEvent.press(getByLabelText('bookmark icon'));

    expect(mockToggleSaveJob).toHaveBeenCalledWith('u1', 'job-2');
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
