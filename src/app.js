import express from 'express';
import { getUsersCollection } from './config/database.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'identity-access-service',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/db', async (req, res) => {
  try {
    const collection = getUsersCollection();
    await collection.exists('healthcheck::probe');
    res.status(200).json({ database: 'UP' });
  } catch (error) {
    res.status(503).json({ database: 'DOWN', error: error.message });
  }
});

export default app;