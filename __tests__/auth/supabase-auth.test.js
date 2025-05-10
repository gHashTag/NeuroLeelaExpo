import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мок для Supabase Auth
const supabaseAuthMock = {
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resend: vi.fn(),
};

// Имитация реального кода аутентификации
async function signInWithEmail(email, password) {
  try {
    const { error } = await supabaseAuthMock.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Успешный вход' };
  } catch (error) {
    return { success: false, message: 'Произошла неожиданная ошибка' };
  }
}

async function signUpWithEmail(email, password) {
  try {
    const { data, error } = await supabaseAuthMock.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        const { error: resendError } = await supabaseAuthMock.resend({
          type: 'signup',
          email: email,
        });

        if (resendError) {
          if (resendError.message.includes('Email already confirmed')) {
            return { success: false, message: 'Email уже подтвержден' };
          }
          return { success: false, message: 'Ошибка при повторной отправке письма' };
        }

        return { success: true, message: 'Письмо отправлено повторно' };
      }
      
      return { success: false, message: error.message };
    }

    if (data?.user) {
      return { success: true, message: 'Добро пожаловать в NeuroLeela!' };
    }
    
    return { success: false, message: 'Не удалось создать пользователя' };
  } catch (error) {
    return { success: false, message: 'Произошла неожиданная ошибка' };
  }
}

describe('Supabase Auth Functions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Sign In', () => {
    it('успешный вход', async () => {
      supabaseAuthMock.signInWithPassword.mockResolvedValue({ error: null });
      const result = await signInWithEmail('test@example.com', 'password');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Успешный вход');
    });

    it('ошибка входа (неверный пароль)', async () => {
      supabaseAuthMock.signInWithPassword.mockResolvedValue({ error: { message: 'Неверный пароль' } });
      const result = await signInWithEmail('test@example.com', 'wrongpass');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Неверный пароль');
    });

    it('неожиданная ошибка', async () => {
      supabaseAuthMock.signInWithPassword.mockRejectedValue(new Error('Network error'));
      const result = await signInWithEmail('test@example.com', 'password');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Произошла неожиданная ошибка');
    });
  });

  describe('Sign Up', () => {
    it('успешная регистрация', async () => {
      supabaseAuthMock.signUp.mockResolvedValue({ 
        data: { user: { id: '1', email: 'test@example.com' } }, 
        error: null 
      });
      const result = await signUpWithEmail('test@example.com', 'password123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Добро пожаловать в NeuroLeela!');
    });

    it('повторная регистрация (email уже зарегистрирован)', async () => {
      supabaseAuthMock.signUp.mockResolvedValue({ 
        data: null, 
        error: { message: 'already registered' } 
      });
      supabaseAuthMock.resend.mockResolvedValue({ error: null });
      const result = await signUpWithEmail('test@example.com', 'password123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Письмо отправлено повторно');
    });

    it('email уже подтвержден', async () => {
      supabaseAuthMock.signUp.mockResolvedValue({ 
        data: null, 
        error: { message: 'already registered' } 
      });
      supabaseAuthMock.resend.mockResolvedValue({ 
        error: { message: 'Email already confirmed' } 
      });
      const result = await signUpWithEmail('test@example.com', 'password123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Email уже подтвержден');
    });
  });
}); 