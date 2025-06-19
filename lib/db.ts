import { openDB, IDBPDatabase } from 'idb';
import { WeiDB } from '../app/types/database';
import { DATABASE_NAME, DATABASE_VERSION } from './config';

export function initDB(): Promise<IDBPDatabase<WeiDB>> {
  return openDB<WeiDB>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db, oldVersion) {
      console.log(`↑ IndexedDB upgrade ${oldVersion} → ${DATABASE_VERSION}`);

      if (!db.objectStoreNames.contains('habits')) {
        const s = db.createObjectStore('habits', { keyPath: 'id' });
        s.createIndex('by-category', 'category');
      }
      if (!db.objectStoreNames.contains('completions')) {
        const s = db.createObjectStore('completions', { keyPath: 'id' });
        s.createIndex('by-habit', 'habitId');
        s.createIndex('by-date', 'completedAt');
      }
      if (!db.objectStoreNames.contains('rewards')) {
        db.createObjectStore('rewards', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('rewardRedemptions')) {
        db.createObjectStore('rewardRedemptions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('user')) {
        const s = db.createObjectStore('user', { keyPath: 'id' });
        s.add({ id: 'default', name: 'User', points: 0, streakDays: 0, lastActive: new Date() });
      }
      if (!db.objectStoreNames.contains('conversations')) {
        db.createObjectStore('conversations', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('userProfile')) {
        const s = db.createObjectStore('userProfile', { keyPath: 'id' });
        s.add({
          id: 'default',
          name: 'User',
          email: 'user@example.com',
          bio: 'No bio yet',
          avatarUrl: '',
          joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
      }
    },
    blocked() { console.warn('DB blocked by an older tab'); },
    blocking() { console.warn('A newer tab wants to upgrade the DB'); },
    terminated() { console.warn('DB connection was unexpectedly closed'); }
  });
} 