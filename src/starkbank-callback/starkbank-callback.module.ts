import { Module } from '@nestjs/common';
import { StarkbankCallbackService } from './starkbank-callback.service';
import { StarkbankCallbackController } from './starkbank-callback.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransferModule } from 'src/transfer/transfer.module';

@Module({
  imports: [TransferModule],
  controllers: [StarkbankCallbackController],
  providers: [StarkbankCallbackService, PrismaService],
})
export class StarkbankCallbackModule {}
