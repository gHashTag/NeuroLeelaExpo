import { PINATA } from '@/constants';
import * as FileSystem from 'expo-file-system';

// Тип для объекта файла, который может принять FormData в React Native
type ReactNativeFile = {
  uri: string;
  name?: string; // Сделаем имя и тип опциональными, чтобы их можно было генерировать
  type?: string;
};

export class PinataService {
  private static instance: PinataService;
  private readonly baseUrl = 'https://api.pinata.cloud';

  private constructor() {}

  public static getInstance(): PinataService {
    if (!PinataService.instance) {
      PinataService.instance = new PinataService();
    }
    return PinataService.instance;
  }

  private validateJWT(token: string): boolean {
    console.log('🔍 Проверяем JWT токен...');
    
    // Проверяем базовую структуру
    if (!token || typeof token !== 'string') {
      console.error('❌ JWT токен отсутствует или имеет неверный тип');
      return false;
    }

    // Проверяем формат JWT
    const parts = token.split('.');
    console.log('🔍 Части токена:', parts);
    console.log('🔍 Количество частей:', parts.length);

    if (parts.length !== 3) {
      console.error('❌ JWT токен должен содержать 3 части, разделенные точками');
      return false;
    }

    // Проверяем, что каждая часть не пустая и является валидным base64
    for (let i = 0; i < parts.length; i++) {
      if (!parts[i]) {
        console.error(`❌ Часть ${i + 1} JWT токена пустая`);
        return false;
      }
      try {
        const decoded = atob(parts[i].replace(/-/g, '+').replace(/_/g, '/'));
        console.log(`✅ Часть ${i + 1} успешно декодирована`);
        if (i === 1) { // Проверяем payload
          const payload = JSON.parse(decoded);
          console.log('✅ Payload декодирован:', payload);
        }
      } catch (error) {
        console.error(`❌ Ошибка при декодировании части ${i + 1}:`, error);
        return false;
      }
    }

    return true;
  }

  public async uploadFile(fileInput: Blob | ReactNativeFile): Promise<string> {
    console.log('🚀 Начало загрузки файла в Pinata');

    if (!PINATA.JWT) {
      console.error('❌ Отсутствует JWT токен Pinata');
      throw new Error('Отсутствует JWT токен Pinata');
    }

    const formData = new FormData();
    let fileName: string;
    let fileToAppend: any; // FormData.append может принимать разные типы

    if (fileInput instanceof Blob) {
      console.log('📦 Обработка Blob файла');
      const blob = fileInput as Blob;
      // Пытаемся получить имя из Blob, если оно есть, иначе генерируем
      fileName = (blob as any).name || `avatar_blob_${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
      fileToAppend = blob;
    } else if (fileInput && typeof fileInput.uri === 'string') {
      console.log('📦 Обработка ReactNativeFile (uri)');
      const reactNativeFile = fileInput as ReactNativeFile;
      const uriParts = reactNativeFile.uri.split('/');
      const originalNameFromUri = uriParts[uriParts.length - 1];
      // Используем предоставленное имя или генерируем на основе URI
      fileName = reactNativeFile.name || `avatar_uri_${Date.now()}_${originalNameFromUri}`;
      // Используем предоставленный тип или пытаемся определить из имени, иначе по умолчанию
      const fileExtension = originalNameFromUri.includes('.') ? originalNameFromUri.split('.').pop() : 'jpg';
      const fileMimeType = reactNativeFile.type || `image/${fileExtension}`;

      fileToAppend = {
        uri: reactNativeFile.uri,
        name: fileName,
        type: fileMimeType,
      };
    } else {
      console.error('❌ Неверный формат файла для загрузки:', fileInput);
      throw new Error('Неверный формат файла для загрузки');
    }
    
    console.log('📦 Информация о файле для FormData:', { fileToAppend, fileName });

    formData.append('file', fileToAppend, fileName);

    // Добавляем метаданные
    const metadata = JSON.stringify({
      name: fileName,
      keyvalues: {
        type: 'avatar',
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    // Добавляем опции
    const options = JSON.stringify({
      cidVersion: 0
    });
    formData.append('pinataOptions', options);

    try {
      console.log('📤 Отправка запроса в Pinata');
      console.log('🔑 Используем JWT токен:', PINATA.JWT.substring(0, 50) + '...');
      
      const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA.JWT}`,
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log('📥 Ответ от Pinata:', responseText);

      if (!response.ok) {
        console.error('❌ Ошибка от Pinata API:', response.status, responseText);
        throw new Error(`Ошибка загрузки файла: ${response.status} ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error('❌ Ошибка при парсинге ответа:', error);
        throw new Error('Некорректный ответ от Pinata API');
      }

      console.log('✅ Файл успешно загружен в Pinata:', data);

      if (!data.IpfsHash) {
        console.error('❌ Отсутствует IPFS хеш в ответе');
        throw new Error('Некорректный ответ от Pinata API');
      }

      return data.IpfsHash;
    } catch (error) {
      console.error('❌ Ошибка при загрузке файла:', error);
      throw error;
    }
  }

  public getFileUrl(ipfsHash: string): string | null {
    try {
      if (!PINATA.GATEWAY_URL) {
        console.error('❌ Отсутствует PINATA_GATEWAY_URL');
        return null;
      }
      
      console.log('🔗 Формируем URL файла...');
      const url = `${PINATA.GATEWAY_URL}${ipfsHash}`;
      console.log('✅ URL файла сформирован:', url);
      return url;
    } catch (error) {
      console.error('❌ Ошибка при формировании URL файла:', error);
      return null;
    }
  }
}

export const pinataService = PinataService.getInstance();
