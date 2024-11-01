import { Module } from '@nestjs/common';
import { InvoiceCallbackModule } from 'src/invoice-callback/invoice-callback.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [InvoiceCallbackModule, InvoiceModule],
  providers: [PrismaService],
})
export class TasksModule {}
