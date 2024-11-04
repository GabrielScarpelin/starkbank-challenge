import { Test, TestingModule } from '@nestjs/testing';
import { StarkbankCallbackService } from './starkbank-callback.service';
import { TransferService } from 'src/transfer/transfer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { mockTransfer } from './tests/mocks';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';

describe('StarkbankCallbackService', () => {
  let service: StarkbankCallbackService;
  let starkbankConfig: StarkbankConfig;

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
    transfer: {
      upsert: jest.fn().mockResolvedValue(mockTransfer),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
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
        {
          provide: StarkbankConfig,
          useValue: {
            starkbank: {
              event: {
                parse: jest.fn(),
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<StarkbankCallbackService>(StarkbankCallbackService);
    starkbankConfig = module.get<StarkbankConfig>(StarkbankConfig);
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
    const invoiceDtoMock = {
      ...mockInvoiceDto,
      status: 'overdue',
    };

    const returnInvoiceCallback = await service.handleInvoiceCallback(
      invoiceDtoMock as any,
    );

    expect(mockPrismaService.invoice.upsert).toHaveBeenCalled();
    expect(returnInvoiceCallback).toEqual({
      message: 'Invoice callback received and processed but not paid',
    });
    expect(mockPrismaService.invoice.update).not.toHaveBeenCalled();
    expect(mockTransferService.createTransfer).not.toHaveBeenCalled();
  });

  it('could not create a transfer', async () => {
    mockTransferService.createTransfer = jest.fn().mockRejectedValue('Error');
    const returnInvoiceCallback = await service.handleInvoiceCallback(
      mockInvoiceDto as any,
    );

    expect(mockPrismaService.invoice.upsert).not.toHaveBeenCalled();
    expect(mockPrismaService.invoice.update).toHaveBeenCalled();
    expect(returnInvoiceCallback).toEqual({
      message: 'Invoice callback received but transfer failed',
    });
  });

  it('should receive a transfer and update the transfer status', async () => {
    const transferMock = {
      id: '123',
      status: 'success',
      amount: 100,
    };

    const returnTransferCallback = await service.handleTransferCallback(
      transferMock as any,
    );

    expect(mockPrismaService.transfer.upsert).toHaveBeenCalled();
    expect(returnTransferCallback).toEqual(mockTransfer);
  });

  it('should not find an invoice', async () => {
    mockPrismaService.invoice.update = jest
      .fn()
      .mockRejectedValue(new Error('Invoice not found'));

    await expect(
      service.handleInvoiceCallback(mockInvoiceDto as any),
    ).rejects.toThrow('Invoice not found');
  });

  it('should validate the signature', async () => {
    const message = 'message';
    const signature = 'signature';

    (starkbankConfig.starkbank.event.parse as jest.Mock).mockResolvedValue({
      subscription: 'invoice',
    });

    await service.verifySignature(message, signature);

    expect(starkbankConfig.starkbank.event.parse).toHaveBeenCalledWith({
      content: message,
      signature,
    });
  });

  it('should handle invalid signature', async () => {
    const message = 'invalid message';
    const signature = 'invalid signature';

    (starkbankConfig.starkbank.event.parse as jest.Mock).mockRejectedValue(
      new Error('Invalid signature'),
    );

    await service.verifySignature(message, signature);

    expect(starkbankConfig.starkbank.event.parse).toHaveBeenCalledWith({
      content: message,
      signature,
    });
  });

  it('should handle invalid event', async () => {
    const message = 'event message';
    const signature = 'event signature';

    (starkbankConfig.starkbank.event.parse as jest.Mock).mockResolvedValue({
      subscription: 'invalid',
    });

    const signatureResponse = await service.verifySignature(message, signature);

    expect(signatureResponse).toEqual(false);
  });
});
