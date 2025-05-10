import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

/**
 * Error types for the avatar upload process
 */
export enum AvatarUploadErrorType {
  CANCELED = 'CANCELED',
  AUTH_ERROR = 'AUTH_ERROR',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  PROCESSING_ERROR = 'PROCESSING_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Type for the avatar upload options
 */
export interface AvatarUploadOptions {
  /** Maximum width of the avatar image after resizing (default: 800 for web, 400 for native) */
  maxWidth?: number;
  /** Image quality (0-1) after compression (default: 0.8) */
  quality?: number;
  /** Whether to allow editing the image before upload (default: true) */
  allowsEditing?: boolean;
}

/**
 * Interface for Supabase functions required for avatar upload
 */
export interface SupabaseFunctions {
  uploadAvatar: (uri: string) => Promise<string>;
  updateUserData: (data: any) => Promise<void>;
  getAvatarUrl: (ipfsHash: string) => string | null;
}

/**
 * Pick, process, and upload an avatar image
 * 
 * @param supabaseFunctions - Required Supabase functions for uploading and processing avatar
 * @param onSuccess - Callback called with avatar URL on success
 * @param onError - Callback called with error on failure
 * @param options - Options for the avatar upload process
 * @returns Promise with the avatar URL or void if canceled
 */
export const pickImage = async (
  supabaseFunctions: SupabaseFunctions,
  onSuccess?: (avatarUrl: string) => void, 
  onError?: (error: Error) => void,
  options?: AvatarUploadOptions
): Promise<string | void> => {
  try {
    console.log('🚀 Начинаем процесс выбора и загрузки аватара');
    
    // Используем переданные функции вместо хука
    const { uploadAvatar, updateUserData, getAvatarUrl } = supabaseFunctions;
    console.log('✅ Получены методы Supabase:', { 
      uploadAvatarExists: !!uploadAvatar, 
      updateUserDataExists: !!updateUserData,
      getAvatarUrlExists: !!getAvatarUrl 
    });
    
    // Set default options
    const {
      maxWidth = Platform.OS === 'web' ? 800 : 400,
      quality = 0.8,
      allowsEditing = true
    } = options || {};
    
    console.log('📋 Параметры загрузки:', { maxWidth, quality, allowsEditing, platform: Platform.OS });
    
    // Launch the image picker
    console.log('📷 Запускаем выбор изображения...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect: [1, 1],
      quality,
    });
    console.log('📷 Результат выбора изображения:', { 
      canceled: result.canceled,
      assetsCount: result.assets?.length || 0
    });

    // Handle cancellation
    if (result.canceled) {
      console.log('❌ Выбор изображения отменен пользователем');
      return;
    }

    const imageUri = result.assets[0].uri;
    console.log('✅ Изображение выбрано:', imageUri.substring(0, 100) + (imageUri.length > 100 ? '...' : ''));

    // Process the image
    console.log('🔄 Обрабатываем изображение...');
    const processedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log('✅ Изображение обработано:', { 
      uri: processedImage.uri.substring(0, 100) + (processedImage.uri.length > 100 ? '...' : ''),
      width: processedImage.width,
      height: processedImage.height
    });

    // Upload to IPFS
    console.log('☁️ Загружаем изображение в IPFS...');
    const ipfsHash = await uploadAvatar(processedImage.uri);
    console.log('📤 Результат загрузки в IPFS:', { ipfsHash });
    
    if (!ipfsHash) {
      console.error('❌ Не удалось получить IPFS хеш после загрузки');
      const error = new Error('Failed to upload image. Please check your connection and try again.');
      error.name = AvatarUploadErrorType.UPLOAD_ERROR;
      throw error;
    }
    console.log('✅ Изображение успешно загружено в IPFS:', ipfsHash);

    // Get the avatar URL
    console.log('🔗 Получаем URL аватара...');
    const avatarUrl = getAvatarUrl(ipfsHash);
    console.log('🔗 Результат получения URL:', { avatarUrl });
    
    if (!avatarUrl) {
      console.error('❌ Не удалось сгенерировать URL аватара');
      const error = new Error('Failed to generate avatar URL');
      error.name = AvatarUploadErrorType.PROCESSING_ERROR;
      throw error;
    }

    // Update user data
    console.log('📝 Обновляем данные пользователя...');
    const userData = {
      pinata_avatar_id: ipfsHash,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };
    console.log('📝 Данные для обновления:', userData);
    
    try {
      await updateUserData(userData);
      console.log('✅ Данные пользователя успешно обновлены');
    } catch (updateError) {
      console.error('❌ Ошибка при обновлении данных пользователя:', updateError);
      console.log('⚠️ Продолжаем выполнение, так как аватар уже загружен');
    }
    
    // Call success callback
    if (onSuccess) {
      console.log('🎉 Вызываем callback успешного завершения');
      onSuccess(avatarUrl);
    }
    
    return avatarUrl;
  } catch (error) {
    console.error('❌ Ошибка при обновлении аватара:', error);
    
    // Enhance error with type information if possible
    let enhancedError: Error;
    
    if (error instanceof Error) {
      console.log('🔍 Анализируем ошибку:', { 
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 200)
      });
      
      if (error.message.includes('401') || error.message.includes('auth')) {
        error.name = AvatarUploadErrorType.AUTH_ERROR;
      } else if (!error.name || error.name === 'Error') {
        error.name = AvatarUploadErrorType.UNKNOWN_ERROR;
      }
      enhancedError = error;
    } else {
      console.log('🔍 Неизвестная ошибка:', error);
      enhancedError = new Error(
        typeof error === 'string' ? error : 'An unknown error occurred during avatar upload'
      );
      enhancedError.name = AvatarUploadErrorType.UNKNOWN_ERROR;
    }
    
    // Call error callback
    if (onError) {
      console.log('📛 Вызываем callback ошибки');
      onError(enhancedError);
    }
    
    throw enhancedError;
  }
}; 