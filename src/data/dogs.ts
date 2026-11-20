import type { Dog } from '@/types';

/**
 * Offline fallback only. Intentionally empty: if Supabase is unreachable the
 * site shows "no puppies" rather than placeholder dogs with stock photos.
 * Manage real puppies from /admin.
 */
export const dogs: Dog[] = [];
