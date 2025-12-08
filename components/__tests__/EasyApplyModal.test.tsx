import React from 'react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import EasyApplyModal from '../EasyApplyModal';

jest.mock('@/contexts/ThemeContext', () => ({ useTheme: () => ({ isDark: false }) }));
jest.mock('@/lib/auth', () => ({ getCurrentUser: jest.fn() }));
jest.mock('@/lib/storage', () => ({ pickDocument: jest.fn(), uploadCV: jest.fn() }));
jest.mock('@/lib/supabase', () => ({ supabase: { from: jest.fn() } }));

const mockGetCurrentUser = require('@/lib/auth').getCurrentUser as any;

describe('EasyApplyModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('calls onApply with default CV on quick apply', async () => {
    mockGetCurrentUser.mockResolvedValue({
      user: { id: 'u1' },
      profile: { default_cv_url: 'https://cv-default', cv_url: 'https://cv' },
    });

    const onApply = jest.fn();
    const onClose = jest.fn();

    const { getByText } = render(
      <EasyApplyModal visible onClose={onClose} onApply={onApply} jobTitle="Dev" />
    );

    await waitFor(() => getByText('⚡ Easy Apply (1-Klik)'));
    fireEvent.press(getByText('⚡ Easy Apply (1-Klik)'));

    expect(onApply).toHaveBeenCalledWith('https://cv-default', true);
    expect(onClose).toHaveBeenCalled();
  });

  it('applies with profile only when selected', async () => {
    mockGetCurrentUser.mockResolvedValue({ user: { id: 'u1' }, profile: {} });

    const onApply = jest.fn();
    const onClose = jest.fn();

    const { getByText } = render(
      <EasyApplyModal visible onClose={onClose} onApply={onApply} jobTitle="Dev" />
    );

    await waitFor(() => getByText('Vetëm me Profil'));
    fireEvent.press(getByText('Vetëm me Profil'));

    expect(onApply).toHaveBeenCalledWith(null);
    expect(onClose).toHaveBeenCalled();
  });
});
