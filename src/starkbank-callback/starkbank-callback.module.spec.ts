import { Test, TestingModule } from '@nestjs/testing';
import { StarkbankCallbackModule } from './starkbank-callback.module';
import { StarkbankCallbackService } from './starkbank-callback.service';

describe('StarkbankCallbackModule', () => {
  let service: StarkbankCallbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [StarkbankCallbackModule],
    }).compile();

    service = module.get<StarkbankCallbackService>(StarkbankCallbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
