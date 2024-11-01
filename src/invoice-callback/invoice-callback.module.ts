import { Module } from '@nestjs/common';
import { InvoiceCallbackService } from './invoice-callback.service';
import { InvoiceCallbackController } from './invoice-callback.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransferModule } from 'src/transfer/transfer.module';

@Module({
  imports: [TransferModule],
  controllers: [InvoiceCallbackController],
  providers: [InvoiceCallbackService, PrismaService],
})
export class InvoiceCallbackModule {}
