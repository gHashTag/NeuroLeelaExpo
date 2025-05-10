import { PINATA } from '@/constants';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

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

    console.log('🔑 JWT токен существует, длина:', PINATA.JWT.length);
    console.log('🔍 Первые 20 символов JWT:', PINATA.JWT.substring(0, 20) + '...');

    const formData = new FormData();
    let fileName: string;

    if (fileInput instanceof Blob) {
      console.log('📦 Обработка Blob файла');
      const blob = fileInput as Blob;
      // Пытаемся получить имя из Blob, если оно есть, иначе генерируем
      fileName = (blob as any).name || `avatar_blob_${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`;
      
      console.log('📦 Данные файла (Blob):', {
        name: fileName,
        type: blob.type,
        size: blob.size
      });
      
      // Прямое добавление Blob в FormData
      formData.append('file', blob, fileName);
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

      console.log('📦 Данные файла (ReactNativeFile):', {
        uri: reactNativeFile.uri.substring(0, 50) + '...',
        name: fileName,
        type: fileMimeType
      });

      // В веб-окружении, нам нужно загрузить файл как блоб
      if (Platform.OS === 'web') {
        try {
          console.log('🌐 Веб-окружение: загружаем файл как blob...');
          
          // Если URI - это base64, преобразуем его в Blob
          if (reactNativeFile.uri.startsWith('data:')) {
            console.log('📄 Обрабатываем base64 URI...');
            const base64Data = reactNativeFile.uri.split(',')[1];
            const mimeType = reactNativeFile.uri.split(';')[0].split(':')[1];
            
            // Создаем Blob из base64
            const byteCharacters = atob(base64Data);
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
            
            const blob = new Blob(byteArrays, { type: mimeType });
            console.log('✅ Blob создан из base64');
            formData.append('file', blob, fileName);
          } else {
            // Если это URL, загружаем как Blob
            console.log('📄 Загружаем файл по URL...');
            const response = await fetch(reactNativeFile.uri);
            const blob = await response.blob();
            console.log('✅ Blob получен из URL');
            formData.append('file', blob, fileName);
          }
        } catch (error) {
          console.error('❌ Ошибка при обработке файла в веб-окружении:', error);
          throw new Error(`Ошибка при обработке файла: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        // В нативном окружении используем обычный подход
        console.log('📱 Нативное окружение: добавляем файл с URI...');
        
        // В нативной среде, мы должны добавить объект с uri, type и name
        formData.append('file', {
          uri: reactNativeFile.uri,
          type: fileMimeType,
          name: fileName
        } as any);
      }
    } else {
      console.error('❌ Неверный формат файла для загрузки:', fileInput);
      throw new Error('Неверный формат файла для загрузки');
    }

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

    const maxRetries = 3;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < maxRetries) {
      attempt++;
      try {
        console.log(`📤 Попытка загрузки #${attempt} из ${maxRetries}`);
        console.log('🔑 Используем JWT токен (первые 20 символов):', PINATA.JWT.substring(0, 20) + '...');
        
        const response = await fetch(`${this.baseUrl}/pinning/pinFileToIPFS`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PINATA.JWT}`,
          },
          body: formData,
        });

        const responseText = await response.text();
        console.log(`📥 Ответ от Pinata (статус ${response.status}):`, 
          responseText.length > 200 ? responseText.substring(0, 200) + '...' : responseText
        );

        if (!response.ok) {
          console.error(`❌ Ошибка от Pinata API (попытка ${attempt}):`, response.status, responseText);
          
          if (response.status === 401) {
            throw new Error(`Ошибка авторизации: 401 Unauthorized`);
          }
          
          // Если это последняя попытка, выбрасываем ошибку
          if (attempt === maxRetries) {
            throw new Error(`Ошибка загрузки файла: ${response.status} ${responseText}`);
          }
          
          // Ждем перед повторной попыткой
          console.log(`⏳ Ожидание перед повторной попыткой (${attempt} из ${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue; // Переходим к следующей попытке
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
        console.error(`❌ Ошибка при загрузке файла (попытка ${attempt}):`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Если это последняя попытка или критическая ошибка, прекращаем
        if (attempt === maxRetries || error instanceof Error && error.message.includes('401')) {
          break;
        }
        
        // Ждем перед повторной попыткой
        console.log(`⏳ Ожидание перед повторной попыткой (${attempt} из ${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    throw lastError || new Error('Не удалось загрузить файл после нескольких попыток');
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
