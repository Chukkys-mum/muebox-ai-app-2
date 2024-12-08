// File Path: utils/redis.ts

import Redis from 'ioredis';

// Check and initialize Redis with proper error handling for missing environment variable
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is not defined.');
}

const redis = new Redis(redisUrl);

/**
 * Cache a response associated with a session ID.
 * @param sessionId - The unique session ID.
 * @param key - Cache key specific to the data being stored.
 * @param response - Data to be cached.
 * @param expiration - Expiration time in seconds (default: 3600 seconds / 1 hour).
 */
export async function cacheResponse(
  sessionId: string,
  key: string,
  response: any,
  expiration = 3600 // Default to 1 hour
): Promise<void> {
  if (!sessionId) {
    console.warn('No session ID provided. Skipping Redis cache.');
    return;
  }

  const redisKey = `${sessionId}:${key}`;
  try {
    await redis.set(redisKey, JSON.stringify(response), 'EX', expiration);
    console.info(`Cached response for key: ${redisKey}`);
  } catch (error) {
    console.error(`Failed to cache response for key ${redisKey}:`, error);
  }
}

/**
 * Retrieve a cached response for a session ID.
 * @param sessionId - The unique session ID.
 * @param key - Cache key specific to the data being retrieved.
 * @returns The cached data or null if not found.
 */
export async function getCachedResponse(
  sessionId: string,
  key: string
): Promise<any | null> {
  if (!sessionId) {
    console.warn('No session ID provided. Returning null for Redis cache.');
    return null;
  }

  const redisKey = `${sessionId}:${key}`;
  try {
    const cachedData = await redis.get(redisKey);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error(`Failed to retrieve cached response for key ${redisKey}:`, error);
    return null;
  }
}

/**
 * Delete a cached response for a session ID.
 * @param sessionId - The unique session ID.
 * @param key - Cache key specific to the data being deleted.
 */
export async function deleteCachedResponse(
  sessionId: string,
  key: string
): Promise<void> {
  if (!sessionId) {
    console.warn('No session ID provided. Skipping Redis deletion.');
    return;
  }

  const redisKey = `${sessionId}:${key}`;
  try {
    await redis.del(redisKey);
    console.info(`Deleted cached response for key: ${redisKey}`);
  } catch (error) {
    console.error(`Failed to delete cached response for key ${redisKey}:`, error);
  }
}

export default redis;
