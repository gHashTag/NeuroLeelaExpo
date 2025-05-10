import React, { useState } from 'react';
import { View, Image, Platform, useWindowDimensions, Modal, Pressable, ScrollView } from 'react-native';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { H1 } from '@/components/ui/typography';

const LOGO_SIZE = 180;

function ClassicCardSignIn() {
  const { width, height } = useWindowDimensions();
  return (
    <View className="flex-1 items-center justify-center bg-background" style={{ minHeight: height }}>
      <Card className="w-full max-w-sm mx-auto flex flex-col items-center justify-center gap-6 p-8">
        <Image
          source={require('@/assets/icon.jpg')}
          style={{ width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: 48, marginBottom: 8 }}
          resizeMode="cover"
        />
        <H1 className="text-center text-2xl font-light tracking-wide text-foreground mb-2">Вход</H1>
        <View className="space-y-4 w-full mb-2">
          <Input placeholder="Email" />
          <Input placeholder="Пароль" secureTextEntry />
        </View>
        <Button className="w-full min-w-[200px] mb-2">Войти</Button>
        <Button variant="secondary" className="w-full min-w-[200px]">Регистрация</Button>
      </Card>
    </View>
  );
}

function DialogSignIn({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60">
        <Card className="w-full max-w-sm mx-auto flex flex-col items-center justify-center gap-6 p-8">
          <Image
            source={require('@/assets/icon.jpg')}
            style={{ width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: 48, marginBottom: 8 }}
            resizeMode="cover"
          />
          <H1 className="text-center text-2xl font-light tracking-wide text-foreground mb-2">Вход (Диалог)</H1>
          <View className="space-y-4 w-full mb-2">
            <Input placeholder="Email" />
            <Input placeholder="Пароль" secureTextEntry />
          </View>
          <Button className="w-full min-w-[200px] mb-2">Войти</Button>
          <Button variant="secondary" className="w-full min-w-[200px]">Регистрация</Button>
          <Button variant="ghost" className="mt-2" onPress={onClose}>Закрыть</Button>
        </Card>
      </View>
    </Modal>
  );
}

function NoCardSignIn() {
  const { width, height } = useWindowDimensions();
  return (
    <View className="flex-1 items-center justify-center bg-background" style={{ minHeight: height }}>
      <Image
        source={require('@/assets/icon.jpg')}
        style={{ width: LOGO_SIZE * 1.3, height: LOGO_SIZE * 1.3, borderRadius: 64, marginBottom: 16 }}
        resizeMode="cover"
      />
      <H1 className="text-center text-2xl font-light tracking-wide text-foreground mb-2">Вход (Без карточки)</H1>
      <View className="space-y-4 w-full max-w-sm mb-2">
        <Input placeholder="Email" />
        <Input placeholder="Пароль" secureTextEntry />
      </View>
      <Button className="w-full max-w-sm min-w-[200px] mb-2">Войти</Button>
      <Button variant="secondary" className="w-full max-w-sm min-w-[200px]">Регистрация</Button>
    </View>
  );
}

function Card21stSignIn() {
  const { width, height } = useWindowDimensions();
  return (
    <View className="flex-1 items-center justify-center bg-background" style={{ minHeight: height }}>
      <Card className="w-full max-w-sm mx-auto flex flex-col items-center justify-center gap-6 p-8">
        <Image
          source={require('@/assets/icon.jpg')}
          style={{ width: 200, height: 200, borderRadius: 56, marginBottom: 8 }}
          resizeMode="cover"
        />
        <H1 className="text-center text-2xl font-light tracking-wide text-foreground mb-2">Вход в NeuroLeela</H1>
        <View className="flex-row w-full gap-2 mb-2">
          <Button variant="outline" className="flex-1">Google</Button>
          <Button variant="outline" className="flex-1">GitHub</Button>
        </View>
        <Text className="text-muted-foreground text-xs mb-2">или</Text>
        <View className="space-y-4 w-full mb-2">
          <Input placeholder="Email" />
          <Input placeholder="Пароль" secureTextEntry />
        </View>
        <Button className="w-full min-w-[200px] mb-2">Войти</Button>
        <Button variant="link" className="w-full min-w-[200px]">Нет аккаунта? Зарегистрироваться</Button>
      </Card>
    </View>
  );
}

export default function SignInShowcase() {
  const [variant, setVariant] = useState<'classic' | 'dialog' | 'nocard' | 'card21st'>('card21st');
  const [dialogVisible, setDialogVisible] = useState(false);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-row justify-center gap-4 mt-8">
        <Button variant={variant === 'card21st' ? 'default' : 'secondary'} onPress={() => setVariant('card21st')}>21st Card</Button>
        <Button variant={variant === 'classic' ? 'default' : 'secondary'} onPress={() => setVariant('classic')}>Карточка</Button>
        <Button variant={variant === 'dialog' ? 'default' : 'secondary'} onPress={() => { setDialogVisible(true); setVariant('dialog'); }}>Диалог</Button>
        <Button variant={variant === 'nocard' ? 'default' : 'secondary'} onPress={() => setVariant('nocard')}>Без карточки</Button>
      </View>
      {variant === 'card21st' && <Card21stSignIn />}
      {variant === 'classic' && <ClassicCardSignIn />}
      {variant === 'nocard' && <NoCardSignIn />}
      <DialogSignIn visible={dialogVisible} onClose={() => setDialogVisible(false)} />
    </ScrollView>
  );
} 