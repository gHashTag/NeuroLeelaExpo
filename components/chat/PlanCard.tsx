import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface PlanInfo {
  name: string;
  description: string;
  element: string;
  color: string;
}

interface PlanCardProps {
  planNumber: number;
  planInfo: PlanInfo;
  isCurrentPosition?: boolean;
}

const colors = {
  green: { text: '#166534', divider: '#86efac' },
  purple: { text: '#6b21a8', divider: '#d8b4fe' },
  blue: { text: '#1e40af', divider: '#93c5fd' },
  gold: { text: '#a16207', divider: '#fde047' },
  violet: { text: '#5b21b6', divider: '#c4b5fd' },
  red: { text: '#991b1b', divider: '#fca5a5' },
  brown: { text: '#854d0e', divider: '#fbbf24' },
  gray: { text: '#374151', divider: '#d1d5db' },
  pink: { text: '#9d174d', divider: '#f9a8d4' },
  orange: { text: '#c2410c', divider: '#fdba74' },
  yellow: { text: '#a16207', divider: '#fde047' },
  black: { text: '#f9fafb', divider: '#4b5563' },
  white: { text: '#1f2937', divider: '#e5e7eb' },
  clear: { text: '#1d4ed8', divider: '#bfdbfe' },
};

const getColorStyle = (color: string) => {
  return colors[color as keyof typeof colors] || colors.gray;
};

export const PlanCard: React.FC<PlanCardProps> = ({ 
  planNumber, 
  planInfo, 
  isCurrentPosition = false 
}) => {
  const { text: textColor, divider: dividerColor } = getColorStyle(planInfo.color);

  return (
    <View>
      {/* Заголовок карточки */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.element}>{planInfo.element}</Text>
          <Text style={[styles.planNumberText, { color: textColor }]}>
            План {planNumber}
          </Text>
        </View>
        {isCurrentPosition && (
          <View style={styles.currentPositionBadge}>
            <Text style={styles.currentPositionText}>Вы здесь</Text>
          </View>
        )}
      </View>

      {/* Название плана */}
      <Text style={[styles.planName, { color: textColor }]}>
        {planInfo.name}
      </Text>

      {/* Описание */}
      <Text style={[styles.description, { color: textColor }]}>
        {planInfo.description}
      </Text>

      {/* Декоративная линия */}
      <View style={[styles.divider, { backgroundColor: dividerColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  element: {
    fontSize: 28,
    marginRight: 10,
  },
  planNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  currentPositionBadge: {
    backgroundColor: 'rgba(255, 120, 0, 0.9)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  currentPositionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.85,
  },
  divider: {
    height: 3,
    borderRadius: 2,
    marginTop: 16,
  },
}); 