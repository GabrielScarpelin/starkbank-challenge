import { Module } from '@nestjs/common';
import { StarkbankCallbackModule } from 'src/starkbank-callback/starkbank-callback.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [StarkbankCallbackModule, InvoiceModule],
  providers: [PrismaService],
})
export class TasksModule {}
