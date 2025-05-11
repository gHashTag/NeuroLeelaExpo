import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CreateReportModal } from '@/components/modals/CreateReportModal';
import { supabase } from '@/config/supabase';
import { Alert } from 'react-native';

// Мокаем модуль supabase
jest.mock('@/config/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn(),
  },
}));

// Мокаем useSupabase хук
jest.mock('@/context/supabase-provider', () => ({
  useSupabase: jest.fn(),
}));

describe('CreateReportModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockUser = { id: 'test-user-id' };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSupabase as jest.Mock).mockReturnValue({ user: mockUser });
    (supabase.from as jest.Mock).mockReturnThis();
    (supabase.insert as jest.Mock).mockReturnThis();
  });

  it('renders correctly with current plan data', () => {
    const { getByText } = render(
      <CreateReportModal 
        isVisible={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        currentPlanNumber={1} 
      />
    );
    
    // Проверяем, что модальное окно показывает информацию о чакре Муладхара (для плана 1)
    expect(getByText('Муладхара')).toBeTruthy();
    expect(getByText('Физический план')).toBeTruthy();
    expect(getByText('Муладхара чакра - корневой центр, отвечающий за выживание, стабильность и безопасность.')).toBeTruthy();
  });
  
  it('submits report data and calls onSuccess when successful', async () => {
    // Мокаем успешный ответ от API
    (supabase.from as jest.Mock).mockReturnThis();
    (supabase.insert as jest.Mock).mockResolvedValueOnce({ error: null });
    
    const { getByText, getByPlaceholderText } = render(
      <CreateReportModal 
        isVisible={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        currentPlanNumber={1} 
      />
    );
    
    // Находим поле ввода и вводим текст
    const textInput = getByPlaceholderText(/введите текст/i) || getByPlaceholderText(/опишите свои мысли/i);
    fireEvent.changeText(textInput, 'Тестовый отчет о моем опыте');
    
    // Находим и нажимаем кнопку сохранения
    const saveButton = getByText('Сохранить');
    fireEvent.press(saveButton);
    
    // Проверяем, что данные отправлены в supabase
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('reports');
      expect(supabase.insert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        plan_number: 1,
        content: 'Тестовый отчет о моем опыте',
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
  
  it('handles error during report submission', async () => {
    // Мокаем ошибку при отправке данных
    const mockError = { message: 'Database error' };
    (supabase.from as jest.Mock).mockReturnThis();
    (supabase.insert as jest.Mock).mockResolvedValueOnce({ error: mockError });
    
    // Мокаем Alert.alert для проверки показа ошибки
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    
    const { getByText, getByPlaceholderText } = render(
      <CreateReportModal 
        isVisible={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        currentPlanNumber={1} 
      />
    );
    
    // Находим поле ввода и вводим текст
    const textInput = getByPlaceholderText(/введите текст/i) || getByPlaceholderText(/опишите свои мысли/i);
    fireEvent.changeText(textInput, 'Тестовый отчет о моем опыте');
    
    // Находим и нажимаем кнопку сохранения
    const saveButton = getByText('Сохранить');
    fireEvent.press(saveButton);
    
    // Проверяем, что onSuccess не был вызван
    await waitFor(() => {
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  it('disables submit button when content is empty', () => {
    const { getByText } = render(
      <CreateReportModal 
        isVisible={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        currentPlanNumber={1} 
      />
    );
    
    // Находим кнопку сохранения и проверяем, что она неактивна
    const saveButton = getByText('Сохранить');
    expect(saveButton.props.disabled).toBeTruthy();
  });
  
  it('displays correct chakra information based on currentPlanNumber', () => {
    // Тестируем для разных планов, проверяя правильное отображение информации
    
    // План 15 (Свадхистана)
    const { getByText: getByText1, unmount: unmount1 } = render(
      <CreateReportModal 
        isVisible={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        currentPlanNumber={15} 
      />
    );
    
    expect(getByText1('Свадхистана')).toBeTruthy();
    expect(getByText1('Астральный план')).toBeTruthy();
    unmount1();
    
    // План 25 (Манипура)
    const { getByText: getByText2, unmount: unmount2 } = render(
      <CreateReportModal 
        isVisible={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        currentPlanNumber={25} 
      />
    );
    
    expect(getByText2('Манипура')).toBeTruthy();
    expect(getByText2('Небесный план')).toBeTruthy();
    unmount2();
    
    // План 72 (Нирвана)
    const { getByText: getByText3 } = render(
      <CreateReportModal 
        isVisible={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        currentPlanNumber={72} 
      />
    );
    
    expect(getByText3('Нирвана')).toBeTruthy();
    expect(getByText3('Абсолютный план')).toBeTruthy();
  });
}); 