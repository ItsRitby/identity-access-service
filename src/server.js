import 'dotenv/config';
import app from './app.js';
import { connectToCouchbase } from './config/database.js';
import { ensureIndexes } from './config/indexes.js';
import { startEurekaClient, stopEurekaClient } from './config/eureka.js';

const PORT = process.env.PORT || 3001;

async function start() {
  await connectToCouchbase();
  await ensureIndexes();

  app.listen(PORT, () => {
    console.log(`identity-access-service listening on port ${PORT}`);
    startEurekaClient();
  });
}

function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  stopEurekaClient();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start().catch((error) => {
  console.error('Failed to start service:', error);
  process.exit(1);
});