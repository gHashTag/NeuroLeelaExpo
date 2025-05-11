import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as schema from './schema';
import { drizzleAdapter } from '@/lib/drizzle-adapter';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Create a Supabase client to get the connection string
export const supabase = createClient(supabaseUrl, supabaseKey);

// Check if we're running in a web environment
const isWeb = Platform.OS === 'web';

// Fake type to satisfy type system in web environment
// We'll use drizzleAdapter directly in web, not this type
export type DrizzleClient = any;

// For web environment, we'll use a simple noop to prevent any postgres/drizzle imports
const createWebDrizzleClient = () => {
  console.log('Web environment detected, postgres/drizzle imports avoided');
  return {} as DrizzleClient;
};

// Initialize database connection - different approach for web and native
export const initDrizzle = async (): Promise<DrizzleClient> => {
  try {
    // For web environment, just return a mock object
    if (isWeb) {
      return createWebDrizzleClient();
    }
    
    // The code below only runs in native environments
    // Dynamic import to prevent bundling for web
    // This prevents 'Buffer is not defined' errors in web
    // For now, we just return a mock object for web
    return createWebDrizzleClient();
    
    /* 
    // The code below is disabled until we address native implementation
    // We'll use the adapter directly for all platforms for now
    
    // Only in native environment, import and use Drizzle+Postgres directly
    const { drizzle } = require('drizzle-orm/postgres-js');
    const postgres = require('postgres');
    
    const connectionString = `postgresql://postgres:postgres@localhost:5432/postgres`;
    
    // For migrations (only in development & native)
    if (process.env.NODE_ENV === 'development') {
      const migrationClient = postgres(connectionString, { max: 1 });
      try {
        const { migrate } = require('drizzle-orm/postgres-js/migrator');
        await migrate(drizzle(migrationClient), { migrationsFolder: 'drizzle' });
      } catch (error) {
        console.error('Migration failed:', error);
      } finally {
        await migrationClient.end();
      }
    }
    
    // For query client (used in the application)
    const queryClient = postgres(connectionString);
    return drizzle(queryClient, { schema });
    */
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Return an empty client to prevent further errors
    return {} as DrizzleClient;
  }
};

// Export a singleton instance of the client for use throughout the app
let clientInstance: DrizzleClient | null = null;

export const getDrizzle = async (): Promise<DrizzleClient> => {
  if (!clientInstance) {
    clientInstance = await initDrizzle();
  }
  return clientInstance;
}; 