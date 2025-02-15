import React, { useState } from 'react'

import { Display, Dice, GameBoard, Space, Background } from '@components/ui/index'
import { router } from 'expo-router'
// import { useTranslation } from 'react-i18next'
// import { useAccount } from 'store'

const GameScreen: React.FC = () => {
  // const [isLoading, setLoading] = useState(false)
  // const { t } = useTranslation()
  // const [account] = useAccount()
  const [lastRoll, setLastRoll] = useState(1)

  const { currentPlayer, rollDice, message } = {
    currentPlayer: {
      id: '1',
      fullName: 'Player One',
      plan: 1,
      avatar: 'https://via.placeholder.com/150',
      intention: 'Win the game',
      previousPlan: 0,
      isStart: true,
      isFinished: false,
      consecutiveSixes: 0,
      positionBeforeThreeSixes: 0,
      message: 'Ready to play',
    },
    // lastRoll: 3,
    rollDice: () => {
      const roll = Math.floor(Math.random() * 6) + 1
      setLastRoll(roll)
      router.push("/(app)/report")
      return roll
    },
    message: 'Good day!',
  }

  return (
    <Background>
      <Space height={30} />
      <Display title={message} />
      <Space height={20} />
      <GameBoard players={[currentPlayer]} />
      <Space height={10} />
      <Dice rollDice={rollDice} lastRoll={lastRoll} size="medium" />
      <Space height={300} />
    </Background>
  )
}

export default GameScreen
