// Этот файл является примером с использованием Apollo реактивных переменных
// вместо React контекста GameStateProvider
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/config/supabase';
import { useSupabase } from '@/context/supabase-provider';

// Импорт хуков для Apollo реактивных переменных
import { 
  useCurrentPlayerPositionDirect, 
  useLoadingStateDirect,
  useReportCreationSuccessDirect,
  useReportFormErrorsDirect 
} from '@/hooks/useApolloState';

// Данные о чакрах и их уровнях для отображения в форме
const chakraData = {
  // Уровень 1: Муладхара (выживание)
  1: {
    name: 'Муладхара',
    description: 'Базовые потребности, безопасность, стабильность и выживание',
    prompt: 'Опишите свой опыт с ощущением безопасности и стабильности'
  },
  // Уровень 2: Свадхистана (творчество)
  2: {
    name: 'Свадхистана',
    description: 'Творчество, эмоции, отношения и удовольствие',
    prompt: 'Опишите свой творческий или эмоциональный опыт'
  },
  // И так далее для других уровней (3-7)
  3: {
    name: 'Манипура',
    description: 'Сила воли, самоуважение и преобразование',
    prompt: 'Опишите свой опыт с личной силой и решительностью'
  },
  // ...добавьте другие чакры по аналогии
};

interface CreateReportModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const CreateReportModalApollo: React.FC<CreateReportModalProps> = ({ isVisible, onClose }) => {
  // Используем Apollo реактивные переменные вместо контекста
  const { currentPosition } = useCurrentPlayerPositionDirect();
  const { loading, setLoading } = useLoadingStateDirect();
  const { success, setSuccess } = useReportCreationSuccessDirect();
  const { errors, setErrors } = useReportFormErrorsDirect();
  
  const { user } = useSupabase();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Получаем данные текущей чакры на основе позиции игрока
  const currentChakra = chakraData[currentPosition as keyof typeof chakraData] || {
    name: 'Неизвестно',
    description: 'Описание недоступно',
    prompt: 'Опишите свой духовный опыт'
  };

  const handleSubmit = async () => {
    // Сбрасываем предыдущие ошибки и статусы
    setErrors(null);
    setSuccess(false);
    
    // Валидация формы
    if (!title.trim() || !description.trim()) {
      setErrors('Пожалуйста, заполните все поля');
      return;
    }

    // Проверяем авторизацию
    if (!user) {
      setErrors('Необходимо авторизоваться');
      return;
    }

    try {
      setLoading(true);
      
      // Сохраняем отчет в Supabase
      const { data, error } = await supabase
        .from('spiritual_reports')
        .insert({
          user_id: user.id,
          plan_position: currentPosition,
          title: title,
          description: description,
          chakra_name: currentChakra.name
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Успешное сохранение
      setSuccess(true);
      setTitle('');
      setDescription('');
      
      // Закрываем модальное окно после успешного сохранения
      setTimeout(() => {
        onClose();
        // Сбрасываем флаг успеха через некоторое время
        setTimeout(() => setSuccess(false), 500);
      }, 1000);
      
    } catch (error: any) {
      console.error('Ошибка при сохранении отчета:', error);
      setErrors(error.message || 'Произошла ошибка при сохранении отчета');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Духовный опыт: {currentChakra.name}
          </Text>
          
          <Text style={styles.chakraDescription}>
            {currentChakra.description}
          </Text>
          
          <Text style={styles.promptText}>
            {currentChakra.prompt}
          </Text>
          
          {errors ? (
            <Text style={styles.errorText}>{errors}</Text>
          ) : success ? (
            <Text style={styles.successText}>Отчет успешно сохранен!</Text>
          ) : null}
          
          <TextInput
            style={styles.input}
            placeholder="Название опыта"
            value={title}
            onChangeText={setTitle}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Подробное описание"
            multiline
            numberOfLines={5}
            value={description}
            onChangeText={setDescription}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Отмена</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  chakraDescription: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    color: '#666',
  },
  promptText: {
    fontSize: 16,
    marginBottom: 20,
    fontStyle: 'italic',
    color: '#555',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
}); 