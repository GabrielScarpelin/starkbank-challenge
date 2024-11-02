import { Module } from '@nestjs/common';
import { StarkbankCallbackModule } from 'src/starkbank-callback/starkbank-callback.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [StarkbankCallbackModule],
  providers: [PrismaService],
})
export class InvoiceModule {}
