import { Test, TestingModule } from '@nestjs/testing';
import { StarkbankCallbackController } from './starkbank-callback.controller';
import { StarkbankCallbackService } from './starkbank-callback.service';
import { invoiceEventMock, transferEventMock } from './tests/mocks';

describe('StarkbankCallbackController', () => {
  let starkbankCallbackController: StarkbankCallbackController;

  const mockStarkbankCallbackService = {
    verifySignature: jest.fn(),
    handleInvoiceCallback: jest.fn().mockResolvedValue('Invoice processed'),
    handleTransferCallback: jest.fn().mockResolvedValue('Transfer processed'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StarkbankCallbackController],
      providers: [
        {
          provide: StarkbankCallbackService,
          useValue: mockStarkbankCallbackService,
        },
      ],
    }).compile();

    starkbankCallbackController = module.get<StarkbankCallbackController>(
      StarkbankCallbackController,
    );
  });

  it('should be defined', () => {
    expect(starkbankCallbackController).toBeDefined();
  });

  it('should call verifySignature and handleTransferCallback', async () => {
    const transferMock = transferEventMock;
    await starkbankCallbackController.handleInvoiceCallback(
      transferMock,
      'signature',
      {
        rawBody: Buffer.from(''),
      } as any,
    );

    expect(mockStarkbankCallbackService.verifySignature).toHaveBeenCalled();
    expect(
      mockStarkbankCallbackService.handleTransferCallback,
    ).toHaveBeenCalledWith(transferMock.event.log.transfer);
    expect(
      mockStarkbankCallbackService.handleInvoiceCallback,
    ).not.toHaveBeenCalled();
  });
  it('should call verifySignature and handleInvoiceCallback', async () => {
    const invoiceMock = invoiceEventMock;
    await starkbankCallbackController.handleInvoiceCallback(
      invoiceMock,
      'signature',
      {
        rawBody: Buffer.from(''),
      } as any,
    );

    expect(mockStarkbankCallbackService.verifySignature).toHaveBeenCalled();
    expect(
      mockStarkbankCallbackService.handleInvoiceCallback,
    ).toHaveBeenCalledWith(invoiceMock.event.log.invoice);
    expect(
      mockStarkbankCallbackService.handleTransferCallback,
    ).not.toHaveBeenCalled();
  });
});
