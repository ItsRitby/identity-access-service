import couchbase from 'couchbase';
import { getUsersCollection, getIdentityScope } from '../config/database.js';
import { buildUserKey } from '../models/userModel.js';

const { QueryScanConsistency } = couchbase;

export async function insertUser(userDocument) {
  const collection = getUsersCollection();
  const key = buildUserKey(userDocument.id);
  await collection.insert(key, userDocument);
  return userDocument;
}

export async function replaceUser(userDocument) {
  const collection = getUsersCollection();
  const key = buildUserKey(userDocument.id);
  await collection.replace(key, userDocument);
  return userDocument;
}

export async function findById(id) {
  const collection = getUsersCollection();
  const key = buildUserKey(id);
  try {
    const result = await collection.get(key);
    return result.content;
  } catch (error) {
    if (error.constructor.name === 'DocumentNotFoundError') {
      return null;
    }
    throw error;
  }
}

export async function findByUsername(username) {
  const scope = getIdentityScope();
  const statement = 'SELECT u.* FROM users AS u WHERE u.username = $1 LIMIT 1';
  const result = await scope.query(statement, {
    parameters: [username],
    scanConsistency: QueryScanConsistency.RequestPlus,
  });
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function findByNickname(nickname) {
  const scope = getIdentityScope();
  const statement = 'SELECT u.* FROM users AS u WHERE u.nickname = $1 LIMIT 1';
  const result = await scope.query(statement, {
    parameters: [nickname],
    scanConsistency: QueryScanConsistency.RequestPlus,
  });
  return result.rows.length > 0 ? result.rows[0] : null;
}