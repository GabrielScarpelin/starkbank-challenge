import { Test, TestingModule } from '@nestjs/testing';
import { StarkbankCallbackService } from './starkbank-callback.service';
import { TransferService } from 'src/transfer/transfer.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('StarkbankCallbackService', () => {
  let service: StarkbankCallbackService;

  const mockTransferService = {
    createTransfer: jest.fn(),
  };

  const mockInvoiceDto = {
    id: '123',
    status: 'paid',
  };

  const mockPrismaService = {
    invoice: {
      upsert: jest.fn(),
      update: jest.fn().mockReturnValue(mockInvoiceDto),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarkbankCallbackService,
        {
          provide: TransferService,
          useValue: mockTransferService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StarkbankCallbackService>(StarkbankCallbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should receive an invoice with status paid and update the invoice status', async () => {
    const returnInvoiceCallback = await service.handleInvoiceCallback(
      mockInvoiceDto as any,
    );

    expect(mockPrismaService.invoice.upsert).not.toHaveBeenCalled();
    expect(mockPrismaService.invoice.update).toHaveBeenCalledWith({
      where: {
        id: mockInvoiceDto.id,
      },
      data: {
        status: 'TRANSFER_SOLICITED',
      },
    });
    expect(mockTransferService.createTransfer).toHaveBeenCalled();
    expect(returnInvoiceCallback).toEqual({
      message: 'Invoice callback received and processed',
    });
  });

  it('should receive an invoice with status different than paid', async () => {
    const mockInvoiceDto = {
      id: '123',
      status: 'canceled',
    };

    const returnInvoiceCallback = await service.handleInvoiceCallback(
      mockInvoiceDto as any,
    );

    expect(mockPrismaService.invoice.upsert).toHaveBeenCalledWith({
      where: {
        id: mockInvoiceDto.id,
      },
      update: {
        status: 'CANCELED',
      },
      create: {
        id: mockInvoiceDto.id,
        status: 'CANCELED',
      },
    });
    expect(returnInvoiceCallback).toEqual({
      message: 'Invoice callback received and processed but not paid',
    });
    expect(mockPrismaService.invoice.update).not.toHaveBeenCalled();
  });
});
