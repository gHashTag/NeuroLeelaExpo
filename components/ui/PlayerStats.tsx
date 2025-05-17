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
      <View className="bg-black/10 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-white/10">
        <ActivityIndicator size="small" color="#E0AAFF" />
      </View>
    );
  }

  return (
    <View className="bg-black/10 backdrop-blur-2xl rounded-2xl p-5 shadow-xl border border-white/10">
      <Text className="text-lg font-semibold text-white/90 mb-4">Статистика игрока</Text>
      
      <View className="space-y-4">
        <View className="flex-row justify-between items-center bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/5">
          <Text className="text-white/80">Текущая позиция:</Text>
          <View className="bg-gradient-to-r from-pink-600/30 to-purple-600/30 backdrop-blur-xl px-4 py-2 rounded-full">
            <Text className="font-semibold text-white">{stats.currentPosition}</Text>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/5">
          <Text className="text-white/80">Лучшая позиция:</Text>
          <View className="bg-gradient-to-r from-pink-600/30 to-purple-600/30 backdrop-blur-xl px-4 py-2 rounded-full">
            <Text className="font-semibold text-white">{stats.highestPosition}</Text>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/5">
          <Text className="text-white/80">Игр сыграно:</Text>
          <View className="bg-gradient-to-r from-indigo-600/30 to-blue-600/30 backdrop-blur-xl px-4 py-2 rounded-full">
            <Text className="font-semibold text-white">{stats.gamesPlayed}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}; 