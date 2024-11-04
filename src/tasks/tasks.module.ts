import { Module } from '@nestjs/common';
import { StarkbankCallbackModule } from 'src/starkbank-callback/starkbank-callback.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';

@Module({
  imports: [StarkbankCallbackModule, InvoiceModule],
  providers: [PrismaService, StarkbankConfig],
})
export class TasksModule {}
