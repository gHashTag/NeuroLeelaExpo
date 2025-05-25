import { pgTable, text, integer, timestamp, serial, boolean } from 'drizzle-orm/pg-core';

// Define the players table schema
export const players = pgTable('players', {
  id: text('id').primaryKey(),
  plan: integer('plan').notNull().default(1),
  previous_plan: integer('previous_plan').default(0),
  updated_at: timestamp('updated_at').defaultNow(),
  created_at: timestamp('created_at').defaultNow(),
  message: text('message'),
  avatar: text('avatar'),
  fullName: text('full_name'),
  intention: text('intention'),
  isStart: boolean('is_start').default(false),
  isFinished: boolean('is_finished').default(false),
  consecutiveSixes: integer('consecutive_sixes').default(0),
  positionBeforeThreeSixes: integer('position_before_three_sixes').default(0),
  needsReport: boolean('needs_report').default(false),
});

// Define the reports table schema
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(),
  plan_number: integer('plan_number').notNull(),
  content: text('content').notNull(),
  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Define the chat_history table schema for storing user-AI conversations
export const chatHistory = pgTable('chat_history', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(),
  plan_number: integer('plan_number').notNull(),
  user_message: text('user_message').notNull(),
  ai_response: text('ai_response').notNull(),
  report_id: integer('report_id'), // Связь с отчетом, если это диалог об отчете
  message_type: text('message_type').notNull().default('report'), // 'report', 'question', 'general'
  created_at: timestamp('created_at').defaultNow(),
});

// Define types for the players table
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

// Define types for the reports table
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

// Define types for the chat_history table
export type ChatHistory = typeof chatHistory.$inferSelect;
export type NewChatHistory = typeof chatHistory.$inferInsert; 