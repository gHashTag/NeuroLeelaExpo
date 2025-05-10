import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpScreen from '../../app/(app)/sign-up';
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import '@testing-library/jest-native/extend-expect';

// Mock для LinearGradient и BlurView
vi.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient'
}));

vi.mock('expo-blur', () => ({
  BlurView: 'BlurView'
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      resend: vi.fn(),
    },
  },
}));

vi.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: (obj: any) => obj.web,
}));

const { supabase } = require('../../lib/supabase');

describe('SignUpScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('успешная регистрация', async () => {
    supabase.auth.signUp.mockResolvedValue({ data: { user: { id: '1', email: 'test@example.com', confirmed_at: null } }, error: null });
    const { getByPlaceholderText, getByText, queryByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText(/email/i), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText(/пароль/i), 'password123');
    fireEvent.changeText(getByPlaceholderText(/подтвердите пароль/i), 'password123');
    fireEvent.press(getByText(/зарегистрироваться/i));
    await waitFor(() => {
      expect(queryByText(/добро пожаловать/i)).toBeTruthy();
    });
  });

  it('повторная регистрация (email уже зарегистрирован, не подтверждён)', async () => {
    supabase.auth.signUp.mockResolvedValue({ data: null, error: { message: 'already registered' } });
    supabase.auth.resend.mockResolvedValue({ error: null });
    const { getByPlaceholderText, getByText, queryByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText(/email/i), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText(/пароль/i), 'password123');
    fireEvent.changeText(getByPlaceholderText(/подтвердите пароль/i), 'password123');
    fireEvent.press(getByText(/зарегистрироваться/i));
    await waitFor(() => {
      expect(queryByText(/отправлено повторно/i)).toBeTruthy();
    });
  });

  it('email уже подтверждён', async () => {
    supabase.auth.signUp.mockResolvedValue({ data: null, error: { message: 'already registered' } });
    supabase.auth.resend.mockResolvedValue({ error: { message: 'Email already confirmed' } });
    const { getByPlaceholderText, getByText, queryByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText(/email/i), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText(/пароль/i), 'password123');
    fireEvent.changeText(getByPlaceholderText(/подтвердите пароль/i), 'password123');
    fireEvent.press(getByText(/зарегистрироваться/i));
    await waitFor(() => {
      expect(queryByText(/уже зарегистрирован и подтвержден/i)).toBeTruthy();
    });
  });

  it('ошибка: некорректный email', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText(/email/i), 'not-an-email');
    fireEvent.changeText(getByPlaceholderText(/пароль/i), 'password123');
    fireEvent.changeText(getByPlaceholderText(/подтвердите пароль/i), 'password123');
    fireEvent.press(getByText(/зарегистрироваться/i));
    await waitFor(() => {
      expect(queryByText(/корректный email/i)).toBeTruthy();
    });
  });

  it('ошибка: короткий пароль', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText(/email/i), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText(/пароль/i), '123');
    fireEvent.changeText(getByPlaceholderText(/подтвердите пароль/i), '123');
    fireEvent.press(getByText(/зарегистрироваться/i));
    await waitFor(() => {
      expect(queryByText(/минимум 6 символов/i)).toBeTruthy();
    });
  });

  it('ошибка: пароли не совпадают', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText(/email/i), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText(/пароль/i), 'password123');
    fireEvent.changeText(getByPlaceholderText(/подтвердите пароль/i), 'password456');
    fireEvent.press(getByText(/зарегистрироваться/i));
    await waitFor(() => {
      expect(queryByText(/пароли не совпадают/i)).toBeTruthy();
    });
  });

  it('ошибка: пустые поля', async () => {
    const { getByText, queryByText } = render(<SignUpScreen />);
    fireEvent.press(getByText(/зарегистрироваться/i));
    await waitFor(() => {
      expect(queryByText(/введите email/i)).toBeTruthy();
    });
  });

  it('неожиданная ошибка', async () => {
    supabase.auth.signUp.mockRejectedValue(new Error('Network error'));
    const { getByPlaceholderText, getByText, queryByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText(/email/i), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText(/пароль/i), 'password123');
    fireEvent.changeText(getByPlaceholderText(/подтвердите пароль/i), 'password123');
    fireEvent.press(getByText(/зарегистрироваться/i));
    await waitFor(() => {
      expect(queryByText(/произошла ошибка/i)).toBeTruthy();
    });
  });
}); 