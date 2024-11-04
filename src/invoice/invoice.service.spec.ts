import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from './invoice.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';
import { StarkbankCallbackService } from 'src/starkbank-callback/starkbank-callback.service';
import { Invoice } from 'starkbank';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prismaService: PrismaService;
  let starkbankConfig: StarkbankConfig;
  let starkbankCallbackService: StarkbankCallbackService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        {
          provide: PrismaService,
          useValue: {
            invoice: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              createMany: jest.fn(),
            },
          },
        },
        {
          provide: StarkbankConfig,
          useValue: {
            starkbank: {
              invoice: {
                create: jest.fn(),
                get: jest.fn(),
              },
            },
          },
        },
        {
          provide: StarkbankCallbackService,
          useValue: {
            handleInvoiceCallback: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    prismaService = module.get<PrismaService>(PrismaService);
    starkbankConfig = module.get<StarkbankConfig>(StarkbankConfig);
    starkbankCallbackService = module.get<StarkbankCallbackService>(
      StarkbankCallbackService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an invoice group', async () => {
    (prismaService.invoice.create as jest.Mock).mockResolvedValue({
      id: '123',
      status: 'CREATED',
      amount: 1000,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    (starkbankConfig.starkbank.invoice.create as jest.Mock).mockResolvedValue([
      new Invoice({
        amount: 1000,
        name: 'John Doe',
        taxId: '01234567890',
      }),
    ]);

    await service.creatingInvoices();

    expect(prismaService.invoice.createMany).toHaveBeenCalledTimes(1);
    expect(starkbankConfig.starkbank.invoice.create).toHaveBeenCalledTimes(1);
  });

  it('should check pending invoices with pending payments', async () => {
    (prismaService.invoice.findMany as jest.Mock).mockResolvedValue([
      { id: '123', status: 'CREATED' },
    ]);

    (starkbankConfig.starkbank.invoice.get as jest.Mock).mockResolvedValue({
      id: '123',
      status: 'paid',
    });

    await service.checkPendingInvoices();

    expect(prismaService.invoice.findMany).toHaveBeenCalledTimes(1);
    expect(starkbankConfig.starkbank.invoice.get).toHaveBeenCalledTimes(1);
    expect(
      starkbankCallbackService.handleInvoiceCallback,
    ).toHaveBeenCalledTimes(1);
  });

  it('should check pending invoices without pending payments', async () => {
    (prismaService.invoice.findMany as jest.Mock).mockResolvedValue([
      { id: '123', status: 'CREATED' },
    ]);

    (starkbankConfig.starkbank.invoice.get as jest.Mock).mockResolvedValue({
      id: '123',
      status: 'created',
    });

    await service.checkPendingInvoices();

    expect(prismaService.invoice.findMany).toHaveBeenCalledTimes(1);
    expect(starkbankConfig.starkbank.invoice.get).toHaveBeenCalledTimes(1);
    expect(
      starkbankCallbackService.handleInvoiceCallback,
    ).not.toHaveBeenCalled();
  });
});
