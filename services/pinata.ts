import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const PINATA_API_KEY = process.env.EXPO_PUBLIC_PINATA_API_KEY;
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export const uploadImageToPinata = async (imageUri: string): Promise<string> => {
  try {
    // Конвертируем изображение в base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    // Отправляем запрос на Pinata
    const response = await axios.post(PINATA_API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'pinata_api_key': PINATA_API_KEY,
      },
    });

    // Возвращаем IPFS хеш
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading to Pinata:', error);
    throw error;
  }
}; 