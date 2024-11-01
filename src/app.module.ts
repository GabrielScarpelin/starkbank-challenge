import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks/tasks.service';
import { InvoiceCallbackModule } from './invoice-callback/invoice-callback.module';
import { InvoiceService } from './invoice/invoice.service';
import { TasksModule } from './tasks/tasks.module';
import { TransferService } from './transfer/transfer.service';
import { PrismaService } from './prisma/prisma.service';
import { TransferModule } from './transfer/transfer.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ConfigModule } from '@nestjs/config';
import { InvoiceCallbackService } from './invoice-callback/invoice-callback.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    InvoiceCallbackModule,
    TasksModule,
    TransferModule,
    InvoiceModule,
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TasksService,
    InvoiceService,
    TransferService,
    PrismaService,
    InvoiceCallbackService,
  ],
})
export class AppModule {}
