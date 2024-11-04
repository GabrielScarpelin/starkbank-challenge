import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransferService } from './transfer.service';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';

@Module({
  providers: [TransferService, PrismaService, StarkbankConfig],
  exports: [TransferService],
})
export class TransferModule {}
