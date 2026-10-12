import express from 'express';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'identity-access-service',
    timestamp: new Date().toISOString(),
  });
});

export default app;