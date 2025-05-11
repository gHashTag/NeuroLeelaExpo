import { Session, User } from "@supabase/supabase-js";
import { useRouter, useSegments, SplashScreen } from "expo-router";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import * as FileSystem from "expo-file-system";
import { pinataService } from '@/services/pinata';
import { supabase } from "@/config/supabase";

SplashScreen.preventAutoHideAsync();

type UserData = {
  user_id: string;
  username: string | null;
  pinata_avatar_id: string | null;
  designation: string | null;
  avatar_url: string | null;
  updated_at: string | null;
};

type SupabaseContextProps = {
  user: User | null;
  session: Session | null;
  userData: UserData | null;
  initialized?: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  uploadAvatar: (imageUri: string) => Promise<string>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  getAvatarUrl: (ipfsHash: string) => string | null;
  resendConfirmationEmail: (email: string) => Promise<void>;
};

type SupabaseProviderProps = {
  children: React.ReactNode;
};

const defaultContext: SupabaseContextProps = {
  user: null,
  session: null,
  userData: null,
  initialized: false,
  signUp: async () => {},
  signInWithPassword: async () => {},
  signOut: async () => {},
  deleteAccount: async () => {},
  uploadAvatar: async () => "",
  updateUserData: async () => {},
  getAvatarUrl: () => null,
  resendConfirmationEmail: async () => {},
};

export const SupabaseContext = createContext<SupabaseContextProps>(defaultContext);

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({ children }: SupabaseProviderProps) => {
  const isMountedRef = useRef(false);
  const authListenerRef = useRef<{subscription: {unsubscribe: () => void}} | null>(null);
  
  if (!isMountedRef.current) {
    console.log('SupabaseProvider mounted');
    isMountedRef.current = true;
  }
  
  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);
  const prevSession = useRef<Session | null>(null);
  const prevUserData = useRef<UserData | null>(null);

  const createUserRecord = async (userId: string) => {
    const { error } = await supabase.from("users").insert([{ user_id: userId }]);

    if (error) {
      console.error("Error creating user record:", error);
    }
  };

  const checkUserData = async (userId: string) => {
    try {
      console.log('🔍 Проверяем данные пользователя:', userId);
      
      // Проверяем текущую сессию
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('❌ Ошибка получения сессии:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.error('❌ Нет активной сессии');
        router.replace("/(app)/welcome");
        return null;
      }

      // Получаем данные пользователя
      const { data, error } = await supabase
        .from("users")
        .select("user_id, username, pinata_avatar_id, avatar_url, designation, updated_at")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          console.log('⚠️ Пользователь не найден, создаем новую запись...');
          await createUserRecord(userId);
          return {
            user_id: userId,
            username: null,
            pinata_avatar_id: null,
            avatar_url: null,
            designation: null,
            updated_at: new Date().toISOString()
          } as UserData;
        }
        console.error("❌ Ошибка получения данных пользователя:", error);
        return null;
      }

      console.log('✅ Данные пользователя получены:', data);
      return data as UserData;
    } catch (error) {
      console.error('❌ Критическая ошибка в checkUserData:', error);
      return null;
    }
  };

  const getAvatarUrl = (ipfsHash: string): string | null => {
    return pinataService.getFileUrl(ipfsHash);
  };

  // Функция для кэширования аватара локально
  const cacheAvatar = async (url: string): Promise<string> => {
    try {
      console.log('📥 Начинаем кэширование аватара...');
      
      const filename = url.split('/').pop() || 'avatar.jpg';
      const cacheDir = `${FileSystem.cacheDirectory}avatars/`;
      const filePath = `${cacheDir}${filename}`;

      // Создаем директорию для кэша, если её нет
      await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true }).catch(() => {});

      // Проверяем, есть ли файл уже в кэше
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        console.log('✅ Аватар найден в кэше');
        return filePath;
      }

      // Скачиваем файл
      console.log('⬇️ Скачиваем аватар...');
      await FileSystem.downloadAsync(url, filePath);
      console.log('✅ Аватар успешно кэширован');
      
      return filePath;
    } catch (error) {
      console.error('❌ Ошибка при кэшировании аватара:', error);
      throw error;
    }
  };

  const uploadAvatar = async (imageUri: string): Promise<string> => {
    try {
      console.log('🎯 Начинаем процесс загрузки аватара URI:', imageUri);
      
      const uriParts = imageUri.split('/');
      const originalFileName = uriParts[uriParts.length - 1];
      const extensionParts = originalFileName.split('.');
      const fileExtension = extensionParts.length > 1 ? extensionParts.pop() : 'jpg'; // по умолчанию jpg, если нет расширения
      const defaultName = `avatar_${Date.now()}.${fileExtension}`;

      const fileInput = {
        uri: imageUri,
        name: defaultName, // pinata.ts сможет использовать это или сгенерировать свое, если name опционально
        type: `image/${fileExtension}`, 
      };
      
      const ipfsHash = await pinataService.uploadFile(fileInput);
      console.log('✅ Аватар успешно загружен в IPFS');
      
      return ipfsHash;
    } catch (error) {
      console.error('❌ Ошибка при загрузке аватара:', error);
      throw error;
    }
  };

  const updateUserData = async (data: Partial<UserData>): Promise<void> => {
    try {
      console.log('🔄 Обновляем данные пользователя:', data);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('❌ Нет активной сессии');
        throw new Error('Требуется авторизация');
      }

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('❌ Ошибка при обновлении данных:', error);
        throw error;
      }

      console.log('✅ Данные успешно обновлены');
      
      // Обновляем локальное состояние
      if (userData) {
        setUserData({
          ...userData,
          ...data,
        });
      }
    } catch (error) {
      console.error('❌ Ошибка при обновлении данных пользователя:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      throw error;
    }
    if (data.user) {
      await createUserRecord(data.user.id);
    }
    router.replace("/(app)/sign-in?verifyEmail=true");
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      const userData = await checkUserData(data.user.id);
      if (!userData?.username) {
        router.replace("/(app)/username");
      } else {
        router.replace("/(app)/(protected)/gamescreen");
      }
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    router.replace("/(app)/welcome");
  };

  const deleteAccount = async () => {
    if (!session?.user?.id) return;

    // Сначала удаляем запись из таблицы users
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("user_id", session.user.id);

    if (deleteError) {
      console.error("Error deleting user data:", deleteError);
      throw deleteError;
    }

    // Затем удаляем аккаунт из auth
    const { error: authError } = await supabase.auth.admin.deleteUser(session.user.id);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      throw authError;
    }

    // Выходим из системы
    await signOut();
  };

  const resendConfirmationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
    });
    if (error) {
      throw error;
    }
  };

  // Initial session check - runs only once during component mount
  useEffect(() => {
    let isMounted = true;
    
    const checkSession = async () => {
      try {
        console.log('SupabaseProvider: Начальная проверка сессии...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ SupabaseProvider: Ошибка при получении сессии:', error);
        } else if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            const profileData = await checkUserData(currentSession.user.id);
            setUserData(profileData);
          }
        }
      } catch (err) {
        console.error('❌ Критическая ошибка SupabaseProvider:', err);
      } finally {
        if (isMounted) {
          console.log('SupabaseProvider: Инициализация завершена');
          setInitialized(true);
          SplashScreen.hideAsync();
        }
      }
    };

    checkSession();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Auth state listener - separate from initial check
  useEffect(() => {
    let isMounted = true;
    
    // Clear previous listener if it exists
    if (authListenerRef.current) {
      console.log('SupabaseProvider: Отписываемся от предыдущего auth listener');
      authListenerRef.current.subscription.unsubscribe();
      authListenerRef.current = null;
    }
    
    // Set up new auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('SupabaseProvider: onAuthStateChange', event, newSession ? 'Got session' : 'No session');
      
      if (!isMounted) return;
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        const profileData = await checkUserData(newSession.user.id);
        setUserData(profileData);
      } else {
        setUserData(null);
      }
    });

    // Store listener reference for cleanup
    authListenerRef.current = authListener;

    // Cleanup function
    return () => {
      isMounted = false;
      if (authListenerRef.current) {
        console.log('SupabaseProvider: Отписываемся от auth listener при размонтировании');
        authListenerRef.current.subscription.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, []);

  // Session change logging
  useEffect(() => {
    if (prevSession.current !== session) {
      console.log('SupabaseProvider: session changed', session);
      if (session) {
        console.log('SupabaseProvider: user id', session.user?.id, 'expires at', session.expires_at);
      } else {
        console.log('SupabaseProvider: session is null (not authenticated)');
      }
      
      prevSession.current = session;
    }
    
    if (JSON.stringify(prevUserData.current) !== JSON.stringify(userData)) {
      console.log('SupabaseProvider: userData changed', userData);
      prevUserData.current = userData;
    }
  }, [session, userData]);

  return (
    <SupabaseContext.Provider
      value={{
        user,
        session,
        userData,
        initialized,
        signUp,
        signInWithPassword,
        signOut,
        deleteAccount,
        uploadAvatar,
        updateUserData,
        getAvatarUrl,
        resendConfirmationEmail,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};
