import { Test, TestingModule } from '@nestjs/testing';
import { TransferService } from './transfer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';

describe('TransferService', () => {
  let service: TransferService;
  let prismaService: PrismaService;
  let starkbankConfig: StarkbankConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        {
          provide: PrismaService,
          useValue: { transfer: { create: jest.fn() } },
        },
        {
          provide: StarkbankConfig,
          useValue: {
            starkbank: {
              transfer: {
                create: jest.fn(),
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
    prismaService = module.get<PrismaService>(PrismaService);
    starkbankConfig = module.get<StarkbankConfig>(StarkbankConfig);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a transfer', async () => {
    (starkbankConfig.starkbank.transfer.create as jest.Mock).mockResolvedValue([
      {
        id: '123',
        name: 'John Doe',
        taxId: '01234567890',
        bankCode: '341',
        branchCode: '1234',
        accountNumber: '12345-6',
        amount: 1000,
        accountType: 'checking',
        invoiceId: '123',
      },
    ]);

    (prismaService.transfer.create as jest.Mock).mockResolvedValue({
      id: '123',
      invoiceId: '123',
      amount: 1000,
      status: 'CREATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const name = 'John Doe';
    const taxId = '01234567890';
    const bankCode = '341';
    const branchCode = '1234';
    const accountNumber = '12345-6';
    const amount = 1000;
    const accountType = 'checking';
    const invoiceId = '123';

    const createdTransfer = await service.createTransfer(
      name,
      amount,
      taxId,
      bankCode,
      branchCode,
      accountNumber,
      accountType,
      invoiceId,
    );

    expect(createdTransfer).toEqual({
      id: '123',
      invoiceId: '123',
      amount: 1000,
      status: 'CREATED',
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});
