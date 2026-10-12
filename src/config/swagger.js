import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 3001;

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'identity-access-service API',
      version: '1.0.0',
      description:
        'Identity and Access microservice for the muCARD platform. Covers user stories US-1 to US-6.',
      contact: {
        name: 'muCARD Team',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local development server',
      },
      {
        url: 'http://identity-access-service:3001',
        description: 'Docker network (internal)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterUserRequest: {
          type: 'object',
          required: ['username', 'nickname', 'password'],
          properties: {
            username: { type: 'string', example: 'playerone', minLength: 3 },
            nickname: { type: 'string', example: 'TheChosen', minLength: 3 },
            password: { type: 'string', example: 'secret123', minLength: 6 },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'playerone' },
            password: { type: 'string', example: 'secret123' },
          },
        },
        RecoverPasswordRequest: {
          type: 'object',
          required: ['username', 'recoveryCode', 'newPassword'],
          properties: {
            username: { type: 'string', example: 'playerone' },
            recoveryCode: { type: 'string', example: 'AB12-CD34-EF56' },
            newPassword: { type: 'string', example: 'newpass456', minLength: 6 },
          },
        },
        ChangeNicknameRequest: {
          type: 'object',
          required: ['newNickname'],
          properties: {
            newNickname: { type: 'string', example: 'NewNickname', minLength: 3 },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            username: { type: 'string', example: 'playerone' },
            nickname: { type: 'string', example: 'TheChosen' },
            gamesPlayed: { type: 'integer', example: 0 },
            wins: { type: 'integer', example: 0 },
            currentStreak: { type: 'integer', example: 0 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        RegisterUserResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            recoveryCode: { type: 'string', example: 'AB12-CD34-EF56' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        RecoverPasswordResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Password changed successfully' },
            recoveryCode: { type: 'string', example: 'XX11-YY22-ZZ33' },
          },
        },
        LogoutResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Logged out successfully' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'ConflictError' },
            message: { type: 'string', example: 'Username is already taken' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);