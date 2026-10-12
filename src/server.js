import 'dotenv/config';
import app from './app.js';
import { connectToCouchbase } from './config/database.js';

const PORT = process.env.PORT || 3001;

async function start() {
  await connectToCouchbase();

  app.listen(PORT, () => {
    console.log(`identity-access-service listening on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Failed to start service:', error);
  process.exit(1);
});