import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useSupabase } from '@/context/supabase-provider';
import { getDrizzle } from '@/db';
import { players } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const PlayerStats = () => {
  const { user } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ 
    gamesPlayed: number, 
    highestPosition: number,
    currentPosition: number 
  }>({
    gamesPlayed: 0,
    highestPosition: 0,
    currentPosition: 0
  });

  useEffect(() => {
    if (user) {
      fetchPlayerStats();
    }
  }, [user]);

  const fetchPlayerStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const db = await getDrizzle();
      
      // Get player data using Drizzle ORM
      const playerData = await db.select().from(players).where(eq(players.id, user.id));
      
      if (playerData.length > 0) {
        const player = playerData[0];
        
        setStats({
          gamesPlayed: 1, // This would be calculated differently in a real app
          highestPosition: player.plan > (player.previous_plan || 0) ? player.plan : (player.previous_plan || 0),
          currentPosition: player.plan
        });
      }
    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="bg-white rounded-xl p-4 shadow-md">
        <ActivityIndicator size="small" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-4 shadow-md">
      <Text className="text-lg font-bold text-sky-700 mb-2">Статистика игрока</Text>
      
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Текущая позиция:</Text>
          <Text className="font-semibold">{stats.currentPosition}</Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Лучшая позиция:</Text>
          <Text className="font-semibold">{stats.highestPosition}</Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Игр сыграно:</Text>
          <Text className="font-semibold">{stats.gamesPlayed}</Text>
        </View>
      </View>
    </View>
  );
}; 