# Drizzle ORM Integration for NeuroLeelaExpo

This directory contains the Drizzle ORM implementation for the NeuroLeelaExpo project.

## Overview

Drizzle ORM is a TypeScript ORM that prioritizes type safety and developer experience. It's used in this project to interact with the PostgreSQL database provided by Supabase.

## Files

- `schema.ts` - Defines database tables and relationships
- `index.ts` - Provides the client connection and helper functions

## How to Use

### 1. Get the Drizzle Client

```typescript
import { getDrizzle } from '@/db';
import { players } from '@/db/schema';

// Inside async function
const db = await getDrizzle();
```

### 2. Query Data

```typescript
// Select all players
const allPlayers = await db.select().from(players);

// Select a player by ID
import { eq } from 'drizzle-orm';
const playerData = await db.select().from(players).where(eq(players.id, userId));
```

### 3. Insert Data

```typescript
// Insert a new player
await db.insert(players).values({
  id: user.id,
  plan: 1,
  previous_plan: 0,
  message: 'Starting journey'
});
```

### 4. Update Data

```typescript
// Update a player's position
await db.update(players)
  .set({
    plan: newPosition,
    previous_plan: oldPosition,
    updated_at: new Date()
  })
  .where(eq(players.id, userId));
```

### 5. Delete Data

```typescript
// Delete a player
await db.delete(players).where(eq(players.id, userId));
```

## Development Commands

- `bun run db:generate` - Generate migration files based on schema changes
- `bun run db:migrate` - Apply migrations to the database
- `bun run db:studio` - Open Drizzle Studio for visual database management

## Schema Management

When making changes to the database schema:

1. Update the schema in `db/schema.ts`
2. Run `bun run db:generate` to create migration files
3. Run `bun run db:migrate` to apply changes to the database

## Type Safety

Drizzle provides full type safety for your database operations. Use the provided types:

```typescript
import { Player, NewPlayer } from '@/db/schema';

// Type for existing players from the database
const player: Player = playerData[0];

// Type for creating new players
const newPlayer: NewPlayer = {
  id: 'user-id',
  plan: 1
};
``` 