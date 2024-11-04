import { Module } from '@nestjs/common';
import { StarkbankCallbackModule } from 'src/starkbank-callback/starkbank-callback.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';
import { InvoiceService } from './invoice.service';
import { StarkbankCallbackService } from 'src/starkbank-callback/starkbank-callback.service';
import { TransferService } from 'src/transfer/transfer.service';

@Module({
  imports: [StarkbankCallbackModule],
  providers: [
    InvoiceService,
    PrismaService,
    StarkbankConfig,
    StarkbankCallbackService,
    TransferService,
  ],
})
export class InvoiceModule {}
