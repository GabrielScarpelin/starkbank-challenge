import { Module } from '@nestjs/common';
import { StarkbankCallbackService } from './starkbank-callback.service';
import { StarkbankCallbackController } from './starkbank-callback.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransferModule } from 'src/transfer/transfer.module';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';

@Module({
  imports: [TransferModule],
  controllers: [StarkbankCallbackController],
  providers: [StarkbankCallbackService, PrismaService, StarkbankConfig],
})
export class StarkbankCallbackModule {}
