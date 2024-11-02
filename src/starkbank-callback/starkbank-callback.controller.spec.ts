import { Test, TestingModule } from '@nestjs/testing';
import { StarkbankCallbackController } from './starkbank-callback.controller';
import { StarkbankCallbackService } from './starkbank-callback.service';

describe('StarkbankCallbackController', () => {
  let controller: StarkbankCallbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StarkbankCallbackController],
      providers: [StarkbankCallbackService],
    }).compile();

    controller = module.get<StarkbankCallbackController>(
      StarkbankCallbackController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
