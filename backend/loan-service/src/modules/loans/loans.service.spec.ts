import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { LoanRepository } from './infrastructure/prisma/loan.repository';

describe('LoansService', () => {
  let service: LoansService;
  let mockLoanRepository: any;
  let mockDeviceClient: any;

  beforeEach(async () => {
    mockLoanRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    mockDeviceClient = {
      send: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        {
          provide: LoanRepository,
          useValue: mockLoanRepository,
        },
        {
          provide: 'DEVICE_SERVICE',
          useValue: mockDeviceClient,
        },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
