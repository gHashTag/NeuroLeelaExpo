import axios, { isAxiosError } from 'axios'
import { GameStep } from '@/types'

export type Plan = {
  short_desc: string
  image: string
  name: string
}

export async function sendGameStep(
  roll: number,
  telegram_id: string,
): Promise<{ gameStep: GameStep; plan: Plan; direction: string } | null> {
  try {
    const url = `${process.env.EXPO_PUBLIC_ELESTIO_URL}/game/game-step`

    const { data } = await axios.post(
      url,
      {
        roll,
        telegram_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    console.log('sendGameStep data', data)
    return {
      gameStep: data.gameStep,
      plan: data.plan,
      direction: data.direction,
    }
  } catch (error) {
    if (isAxiosError(error)) {
      console.error('API Error:', error.response?.data || error.message)
    } else {
      console.error('Error sending game step:', error)
    }
    return null
  }
}