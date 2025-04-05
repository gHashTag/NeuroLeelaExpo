import { Session, User } from "@supabase/supabase-js";
import { useRouter, useSegments, SplashScreen } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PINATA_JWT, PINATA_GATEWAY_URL } from '@/constants';

import { supabase } from "@/config/supabase";

SplashScreen.preventAutoHideAsync();

type UserData = {
  user_id: string;
  username: string | null;
  pinata_avatar_id: string | null;
  designation: string | null;
  avatar_url?: string;
  updated_at?: string;
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
  getAvatarUrl: (pinataId: string | null) => string | null;
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
  const router = useRouter();
  const segments = useSegments();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  const createUserRecord = async (userId: string) => {
    const { error } = await supabase.from("users").insert([{ user_id: userId }]);

    if (error) {
      console.error("Error creating user record:", error);
    }
  };

  const checkUserData = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("user_id, username, pinata_avatar_id, designation")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        await supabase.auth.signOut();
        router.replace("/(app)/welcome");
        return null;
      }
      console.error("Error fetching user data:", error);
      return null;
    }

    return data as UserData;
  };

  const uploadAvatar = async (imageUri: string): Promise<string> => {
    try {
      console.log('🚀 Начинаем загрузку аватара в Pinata...');
      console.log('📸 URI изображения:', imageUri);

      // Создаем FormData для загрузки
      const formData = new FormData();
      const timestamp = Date.now();
      
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: `avatar-${timestamp}.jpg`,
      } as any);

      console.log('📦 Отправляем файл в IPFS через Pinata...');

      // Загружаем файл в IPFS через Pinata
      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Ошибка ответа от Pinata:', errorData);
        throw new Error('Ошибка при загрузке файла в Pinata');
      }

      const data = await response.json();
      console.log('📥 Получен ответ от Pinata:', data);
      
      if (data.IpfsHash) {
        console.log('🔗 IPFS хеш получен:', data.IpfsHash);
        console.log('💾 Обновляем профиль пользователя...');
        
        await updateUserData({
          pinata_avatar_id: data.IpfsHash,
          avatar_url: `${PINATA_GATEWAY_URL}${data.IpfsHash}`,
          updated_at: new Date().toISOString(),
        });

        console.log('✅ Аватар успешно загружен в IPFS!');
        return data.IpfsHash;
      }

      throw new Error("❌ Не удалось получить IPFS хеш от Pinata");
    } catch (error) {
      console.error("❌ Ошибка загрузки в Pinata:", error);
      throw error;
    }
  };

  const getAvatarUrl = (pinataId: string | null): string | null => {
    if (!pinataId || !PINATA_GATEWAY_URL) return null;
    return `https://${PINATA_GATEWAY_URL}/ipfs/${pinataId}`;
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!session?.user?.id) return;

    // Проверяем, если обновляется username
    if (data.username) {
      // Проверяем, не занят ли username другим пользователем
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("user_id")
        .eq("username", data.username)
        .neq("user_id", session.user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking username:", checkError);
        throw new Error("Ошибка при проверке username");
      }

      if (existingUser) {
        throw new Error("Этот username уже занят");
      }
    }

    const { error } = await supabase.from("users").update(data).eq("user_id", session.user.id);

    if (error) {
      console.error("Error updating user data:", error);
      throw error;
    }

    // Обновляем локальное состояние
    const updatedUserData = await checkUserData(session.user.id);
    setUserData(updatedUserData);
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

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const userData = await checkUserData(currentSession.user.id);
        setUserData(userData);
      }

      setInitialized(true);
      await SplashScreen.hideAsync();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const currentSegment = segments[segments.length - 1];
    const inProtectedGroup = segments[1] === "(protected)";
    const inAuthGroup = ["sign-in", "sign-up", "welcome"].includes(
      segments[segments.length - 1] || ""
    );
    const inRegistrationFlow = ["username", "avatar", "designation"].includes(
      segments[segments.length - 1] || ""
    );

    if (session) {
      if (!userData?.username && currentSegment !== "username") {
        router.replace("/(app)/username");
        return;
      }

      if (userData?.username && !userData?.pinata_avatar_id && currentSegment !== "avatar") {
        router.replace("/(app)/avatar");
        return;
      }

      if (
        userData?.username &&
        userData?.pinata_avatar_id &&
        !userData?.designation &&
        currentSegment !== "designation"
      ) {
        router.replace("/(app)/designation");
        return;
      }

      if (
        userData?.username &&
        userData?.pinata_avatar_id &&
        userData?.designation &&
        !inProtectedGroup
      ) {
        router.replace("/(app)/(protected)/gamescreen");
      }
    } else if (!inAuthGroup) {
      router.replace("/(app)/welcome");
    }

    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
  }, [initialized, session, userData]);

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
