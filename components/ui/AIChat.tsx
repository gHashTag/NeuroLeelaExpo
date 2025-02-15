import React, { useState } from 'react'
import { sendAIResponse } from '@/services/sendAIResponse'

const AIChat = () => {
  const [messages, setMessages] = useState<{ user: string; ai: string }[]>([])
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return

    // Добавляем сообщение пользователя в чат
    setMessages((prevMessages) => [...prevMessages, { user: input, ai: '' }])

    // Отправляем запрос к AI
    const response = await sendAIResponse(
      'telegram_id', // замените на актуальный telegram_id
      'assistant_id', // замените на актуальный assistant_id
      input,
      'en', // замените на актуальный language_code
      'full_name' // замените на актуальное full_name
    )

    // Обновляем чат с ответом AI
    setMessages((prevMessages) =>
      prevMessages.map((msg, index) =>
        index === prevMessages.length - 1 ? { ...msg, ai: response?.ai_response || 'Ошибка AI' } : msg
      )
    )

    // Очищаем поле ввода
    setInput('')
  }

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p><strong>Вы:</strong> {msg.user}</p>
            <p><strong>AI:</strong> {msg.ai}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Введите ваше сообщение"
      />
      <button onClick={handleSend}>Отправить</button>
    </div>
  )
}

export default AIChat 