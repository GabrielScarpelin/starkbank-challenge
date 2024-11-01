import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransferService } from './transfer.service';

@Module({
  providers: [TransferService, PrismaService],
  exports: [TransferService],
})
export class TransferModule {}
