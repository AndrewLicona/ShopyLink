import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Response } from 'express';

jest.mock('./app.service');

describe('AppController', () => {
  let appController: AppController;
  const mockHealthResponse = {
    status: 'ok' as const,
    database: 'up' as const,
    redis: 'up' as const,
    timestamp: new Date().toISOString(),
  };

  beforeEach(async () => {
    const mockAppService = {
      getHealth: jest.fn().mockResolvedValue(mockHealthResponse),
      getHello: jest.fn().mockReturnValue('Hello World!'),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return health status', async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
      } as unknown as Response;

      const result = await appController.getHealth(mockRes);
      expect(result).toEqual(mockHealthResponse);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
