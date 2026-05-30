import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { DeviceRepository } from './infrastructure/prisma/device.repository';

describe('DevicesService', () => {
  let service: DevicesService;
  let mockDeviceRepository: any;

  beforeEach(async () => {
    mockDeviceRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: DeviceRepository,
          useValue: mockDeviceRepository,
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
