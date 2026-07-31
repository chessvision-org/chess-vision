import { logger } from '@utils';
import { syncStorage } from './syncStorage';

const MIGRATION_LOCK_KEY = 'supabase_migration_complete';

export const dataMigration = {
  async migrate(): Promise<void> {
    try {
      const done = await syncStorage.get(MIGRATION_LOCK_KEY);
      if (done?.value === 'complete') return;
      await syncStorage.set(MIGRATION_LOCK_KEY, 'complete');
    } catch (err: unknown) {
      logger.error('Migration failed:', err);
    }
  }
};
