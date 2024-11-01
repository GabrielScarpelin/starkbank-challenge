import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceCallbackController } from './invoice-callback.controller';
import { InvoiceCallbackService } from './invoice-callback.service';

describe('InvoiceCallbackController', () => {
  let controller: InvoiceCallbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceCallbackController],
      providers: [InvoiceCallbackService],
    }).compile();

    controller = module.get<InvoiceCallbackController>(InvoiceCallbackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
