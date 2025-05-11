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
});

// Define types for the players table
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert; 