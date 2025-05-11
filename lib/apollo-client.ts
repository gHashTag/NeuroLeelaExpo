import { ApolloClient, InMemoryCache, makeVar, NormalizedCacheObject } from '@apollo/client';

// Реактивные переменные (reactive variables)
export const currentPlayerPositionVar = makeVar<number>(1); // Позиция игрока по умолчанию
export const loadingStateVar = makeVar<boolean>(true); // Состояние загрузки
export const reportCreationSuccessVar = makeVar<boolean>(false); // Успешное создание отчета
export const reportFormErrorsVar = makeVar<string | null>(null); // Ошибки в форме отчета

// Создаем кэш Apollo
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Привязываем реактивные переменные к полям кэша
        currentPlayerPosition: {
          read() {
            return currentPlayerPositionVar();
          }
        },
        loadingState: {
          read() {
            return loadingStateVar();
          }
        },
        reportCreationSuccess: {
          read() {
            return reportCreationSuccessVar();
          }
        },
        reportFormErrors: {
          read() {
            return reportFormErrorsVar();
          }
        }
      }
    }
  }
});

// Глобальная переменная для клиента Apollo
let _client: ApolloClient<NormalizedCacheObject> | null = null;

// Функция для инициализации клиента Apollo (ленивая инициализация)
export function initializeApolloClient() {
  const newClient = new ApolloClient({
    cache,
    // Не используем URI в локальном хранилище, но нужен для конфигурации
    uri: 'http://localhost:4000/graphql', // Фиктивный URL
    // Отключаем предупреждения в консоли для локального состояния
    connectToDevTools: process.env.NODE_ENV === 'development',
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      }
    }
  });

  // Сохраняем клиент в глобальную переменную
  _client = newClient;
  return newClient;
}

// Получение экземпляра клиента (создание, если не существует)
export function getApolloClient() {
  if (!_client) {
    _client = initializeApolloClient();
  }
  return _client;
}

// Экспортируем инициализированный клиент для упрощения импорта
export const client = getApolloClient(); 