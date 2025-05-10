import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import { View, TouchableOpacity, Image, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { PinataService } from '../services/pinata';
import { PINATA } from '../constants';

interface AvatarUploadProps {
  updateUserAvatar: (url: string) => Promise<void>;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ updateUserAvatar }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  const createBlob = async (uri: string): Promise<Blob> => {
    console.log('🔄 Создаем Blob из файла...');
    
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      console.log('✅ Blob создан (web):', { size: blob.size, type: blob.type });
      return blob;
    } else {
      // Для мобильных платформ читаем файл как base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Конвертируем base64 в Blob
      const byteCharacters = atob(base64);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/jpeg' });
      console.log('✅ Blob создан (mobile):', { size: blob.size, type: blob.type });
      return blob;
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        setError('Необходимо разрешение на доступ к галерее');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await handleImagePicked(result);
      }
    } catch (error) {
      console.error('❌ Ошибка при выборе изображения:', error);
      setError('Не удалось выбрать изображение');
    }
  };

  const handleImagePicked = async (pickerResult: ImagePicker.ImagePickerResult) => {
    try {
      if (pickerResult.canceled) {
        console.log('🚫 Пользователь отменил выбор изображения');
        return;
      }

      const selectedAsset = pickerResult.assets[0];
      console.log('🖼️ Выбрано изображение:', selectedAsset.uri);

      setUploading(true);
      setError(null);

      // Обрабатываем изображение перед загрузкой
      console.log('🔄 Обрабатываем изображение...');
      const processedImage = await ImageManipulator.manipulateAsync(
        selectedAsset.uri,
        [{ resize: { width: Platform.OS === 'web' ? 800 : 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      console.log('✅ Изображение обработано:', processedImage.uri);

      // Создаем Blob из обработанного изображения
      const blob = await createBlob(processedImage.uri);

      // Загружаем в Pinata
      const pinataService = PinataService.getInstance();
      const ipfsHash = await pinataService.uploadFile(blob);
      console.log('📍 Получен IPFS хеш:', ipfsHash);

      // Формируем URL для аватара
      const avatarUrl = pinataService.getFileUrl(ipfsHash);
      if (!avatarUrl) {
        throw new Error('Не удалось сформировать URL аватара');
      }
      console.log('🔗 URL аватара:', avatarUrl);

      // Обновляем аватар пользователя
      await updateUserAvatar(avatarUrl);
      console.log('✅ Аватар пользователя обновлен');

      setImage(avatarUrl);
    } catch (error) {
      console.error('❌ Ошибка при обработке изображения:', error);
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.uploadButton}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <Text style={styles.uploadText}>Загрузить фото</Text>
        )}
      </TouchableOpacity>
      
      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      )}
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  uploadButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  uploadText: {
    color: '#666',
    textAlign: 'center',
    padding: 10,
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    marginTop: 20,
    color: 'red',
    textAlign: 'center',
  },
}); 