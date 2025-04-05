export * from "./colors";
export * from "./dimensions";

// Pinata configuration
export const PINATA_JWT = process.env.EXPO_PUBLIC_PINATA_JWT as string;
export const PINATA_GATEWAY_URL = process.env.EXPO_PUBLIC_PINATA_GATEWAY_URL as string;
export const PINATA_API_KEY = process.env.EXPO_PUBLIC_PINATA_API_KEY as string;
export const PINATA_SECRET_KEY = process.env.EXPO_PUBLIC_PINATA_SECRET_KEY as string;

if (!PINATA_JWT || !PINATA_GATEWAY_URL) {
  console.error('❌ Отсутствуют необходимые переменные окружения для Pinata');
}
