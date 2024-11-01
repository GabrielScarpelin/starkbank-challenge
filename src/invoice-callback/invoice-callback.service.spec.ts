import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceCallbackService } from './invoice-callback.service';

describe('InvoiceCallbackService', () => {
  let service: InvoiceCallbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvoiceCallbackService],
    }).compile();

    service = module.get<InvoiceCallbackService>(InvoiceCallbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
