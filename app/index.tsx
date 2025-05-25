import React from 'react';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useSupabase } from '@/context/supabase-provider';

// Временный флаг для режима разработки - можно установить true для пропуска аутентификации
const DEV_MODE = true; 

export default function Index() {
  const router = useRouter();
  const { session, userData, initialized } = useSupabase();
  const didMount = useRef(false);

  // Диагностика состояния
  console.log('Index.tsx: initialized', initialized);
  console.log('Index.tsx: session', session);
  console.log('Index.tsx: userData', userData);

  useEffect(() => {
    didMount.current = true;
  }, []);

  useEffect(() => {
    // Режим разработки для быстрого доступа к игровому экрану
    if (DEV_MODE) {
      console.log('Index.tsx: DEV_MODE - redirect to gamescreen');
      // Добавляем небольшую задержку для монтирования Root Layout
      setTimeout(() => {
        router.replace('/(app)/(protected)/gamescreen');
      }, 100);
      return;
    }

    if (!didMount.current) return;
    if (!initialized) return;
    if (session === undefined || userData === undefined) return;

    if (!session || !session.user) {
      console.log('Index.tsx: redirect to sign-in');
      router.replace('/(app)/sign-in');
      return;
    }
    if (!userData?.username) {
      console.log('Index.tsx: redirect to username');
      router.replace('/(app)/username');
      return;
    }
    if (!userData?.pinata_avatar_id) {
      console.log('Index.tsx: redirect to avatar');
      router.replace('/(app)/avatar');
      return;
    }
    if (!userData?.designation) {
      console.log('Index.tsx: redirect to designation');
      router.replace('/(app)/designation');
      return;
    }
    // Всё заполнено — на главный игровой экран
    console.log('Index.tsx: redirect to gamescreen');
    router.replace('/(app)/(protected)/gamescreen');
  }, [session, userData, initialized]);

  if (!initialized) {
    return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Загрузка...</div>;
  }

  return <></>;
}
