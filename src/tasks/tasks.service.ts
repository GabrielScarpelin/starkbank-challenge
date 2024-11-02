import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceService } from 'src/invoice/invoice.service';

@Injectable()
export class TasksService {
  constructor(private readonly invoiceService: InvoiceService) {}
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleEmitInvoice() {
    console.log('Creating invoices');
    await this.invoiceService.creatingInvoices();
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleCheckPendingTasks() {
    await this.invoiceService.checkPendingInvoices();
  }
}
