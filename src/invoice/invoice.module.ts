import { Module } from '@nestjs/common';
import { InvoiceCallbackModule } from 'src/invoice-callback/invoice-callback.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [InvoiceCallbackModule],
  providers: [PrismaService],
})
export class InvoiceModule {}
