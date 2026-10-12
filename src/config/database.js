import couchbase from 'couchbase';

const { Cluster } = couchbase;

let usersCollection = null;
let identityScope = null;

export async function connectToCouchbase() {
  const connectionString = process.env.COUCHBASE_CONNECTION_STRING;
  const username = process.env.COUCHBASE_USERNAME;
  const password = process.env.COUCHBASE_PASSWORD;
  const bucketName = process.env.COUCHBASE_BUCKET;
  const scopeName = process.env.COUCHBASE_SCOPE;
  const collectionName = process.env.COUCHBASE_COLLECTION;

  const cluster = await Cluster.connect(connectionString, {
    username,
    password,
  });

  const bucket = cluster.bucket(bucketName);
  await bucket.waitUntilReady(10000);

  identityScope = bucket.scope(scopeName);
  usersCollection = identityScope.collection(collectionName);

  console.log(
    `Couchbase connected -> bucket '${bucketName}', scope '${scopeName}', collection '${collectionName}'`
  );

  return { cluster, bucket, scope: identityScope, usersCollection };
}

export function getUsersCollection() {
  if (!usersCollection) {
    throw new Error(
      'Couchbase not initialized. Call connectToCouchbase() before using getUsersCollection().'
    );
  }
  return usersCollection;
}

export function getIdentityScope() {
  if (!identityScope) {
    throw new Error(
      'Couchbase not initialized. Call connectToCouchbase() before using getIdentityScope().'
    );
  }
  return identityScope;
}