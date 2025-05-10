import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useSupabase } from "@/context/supabase-provider";
import { Stack } from "expo-router";

export default function Username() {
  const { updateUserData } = useSupabase();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateUsername = (value: string) => {
    if (!value) return "Введите username";
    if (value.length < 3) return "Username должен быть не менее 3 символов";
    if (value.length > 20) return "Username должен быть не более 20 символов";
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username может содержать только буквы, цифры и _";
    return null;
  };

  const onSubmit = async () => {
    try {
      setError(null);
      setIsLoading(true);

      const validationError = validateUsername(username);
      if (validationError) {
        setError(validationError);
        return;
      }

      console.log('🔍 Начинаем проверку username:', username);
      await updateUserData({ username });
      console.log('✅ Username успешно установлен:', username);
    } catch (error: any) {
      console.error('❌ Ошибка при установке username:', error);
      setError(error.message || "Произошла ошибка при установке username");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Text style={styles.title}>Выберите Username</Text>
      <Text style={styles.description}>
        Выберите username для вашего аккаунта. Вы сможете изменить его позже.
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>Произошла ошибка.</Text>
          <Text style={styles.errorDescription}>{error}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Введите username"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setError(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Проверяем..." : "ПРОДОЛЖИТЬ"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  errorDescription: {
    color: "#DC2626",
    fontSize: 14,
  },
});
