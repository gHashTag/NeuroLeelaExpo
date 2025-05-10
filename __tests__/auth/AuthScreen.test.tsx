import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Auth from '../../app/screens/Auth';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import '@testing-library/jest-native/extend-expect';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

vi.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: {
    show: vi.fn(),
  },
}));

const { supabase } = require('../../lib/supabase');
const Toast = require('react-native-toast-message').default;

describe('AuthScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('успешный вход', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null });
    const { getByPlaceholderText, getByText } = render(<Auth />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Пароль'), 'password');
    fireEvent.press(getByText('Войти'));
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' })
      );
    });
  });

  it('ошибка входа (неверный пароль)', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: { message: 'Неверный пароль' } });
    const { getByPlaceholderText, getByText } = render(<Auth />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Пароль'), 'wrongpass');
    fireEvent.press(getByText('Войти'));
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text1: 'Ошибка входа' })
      );
    });
  });

  it('неожиданная ошибка', async () => {
    supabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));
    const { getByPlaceholderText, getByText } = render(<Auth />);
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Пароль'), 'password');
    fireEvent.press(getByText('Войти'));
    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', text1: 'Ошибка' })
      );
    });
  });
}); 