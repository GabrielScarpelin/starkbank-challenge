import { Module } from '@nestjs/common';
import { InvoiceCallbackModule } from 'src/starkbank-callback/starkbank-callback.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [InvoiceCallbackModule],
  providers: [PrismaService],
})
export class InvoiceModule {}
