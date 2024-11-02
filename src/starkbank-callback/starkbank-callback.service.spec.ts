import { Test, TestingModule } from '@nestjs/testing';
import { StarkbankCallbackService } from './starkbank-callback.service';

describe('StarkbankCallbackService', () => {
  let service: StarkbankCallbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StarkbankCallbackService],
    }).compile();

    service = module.get<StarkbankCallbackService>(StarkbankCallbackService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
