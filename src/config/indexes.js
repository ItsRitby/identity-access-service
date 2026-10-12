// src/config/indexes.js
import { getIdentityScope } from './database.js';

const INDEXES = [
  'CREATE INDEX idx_users_username IF NOT EXISTS ON users(username)',
  'CREATE INDEX idx_users_nickname IF NOT EXISTS ON users(nickname)',
];

export async function ensureIndexes() {
  const scope = getIdentityScope();
  for (const statement of INDEXES) {
    try {
      await scope.query(statement);
      console.log(`Index ensured: ${statement}`);
    } catch (error) {
      // Si el índice ya existe, Couchbase puede lanzar un error.
      // Podemos ignorarlo de forma segura.
      if (error.message.includes('index already exists')) {
        console.log(`Index already exists (skipped): ${statement}`);
        continue;
      }
      console.error(`Failed to create index: ${statement}`, error.message);
      throw error;
    }
  }
}