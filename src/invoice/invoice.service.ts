import { Injectable } from '@nestjs/common';
import invoices from './examples/people';
import { PrismaService } from 'src/prisma/prisma.service';
import { InvoiceCallbackService } from 'src/invoice-callback/invoice-callback.service';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';
import { Invoice } from 'starkbank';

@Injectable()
export class InvoiceService {
  private readonly starkbankConfig: StarkbankConfig = new StarkbankConfig();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly invoiceCallback: InvoiceCallbackService,
  ) {}
  async creatingInvoices() {
    console.log('Invoices to be created: ', invoices);
    if (invoices.length === 0) {
      return;
    }
    const batchsNums = Math.ceil(invoices.length / 100);

    if (batchsNums > 1) {
      for (let i = 0; i < batchsNums; i++) {
        const batch = invoices.slice(i * 100, (i + 1) * 100);
        await this.emitInvoice(batch);
      }
    }
  }
  async emitInvoice(invoices: any[]) {
    console.log('Emitting invoices: ', invoices);
    const invoicesList = invoices.map((invoice) => {
      return new Invoice({
        amount: invoice.amount,
        taxId: invoice.taxId,
        name: invoice.name,
      });
    });
    const invoicesCreated =
      await this.starkbankConfig.starkbank.invoice.create(invoicesList);
    console.log('Invoices created: ', invoicesCreated);
    await this.prismaService.invoice.createMany({
      data: invoicesCreated.map((invoice) => ({
        id: invoice.id,
        amount: invoice.amount,
        status: 'WAITING_PAYMENT',
        createdAt: new Date(),
        updatedAt: new Date(),
        brcode: invoice.brcode,
        discountAmount: invoice.discountAmount,
        fee: invoice.fee,
        due: invoice.due,
        expiration: invoice.expiration,
        fine: invoice.fine,
        interest: invoice.interest,
        fineAmount: invoice.fineAmount,
        interestAmount: invoice.interestAmount,
        nominalAmount: invoice.nominalAmount,
        name: invoice.name,
        linkUrl: '',
        pdfUrl: '',
        taxId: invoice.taxId,
      })),
    });

    console.log('Invoices sent successfully.');
  }

  async checkPendingInvoices() {
    const invoices = await this.prismaService.invoice.findMany({
      where: {
        status: 'WAITING_PAYMENT',
      },
    });

    if (invoices.length === 0) {
      return;
    }

    for (const invoice of invoices) {
      const checkInvoice = await this.starkbankConfig.starkbank.invoice.get(
        invoice.id,
      );

      if (!checkInvoice) {
        console.error('Error to get invoice.');
        console.error('Invoice: ', invoice);
        continue;
      }

      if (checkInvoice.status === 'paid') {
        await this.invoiceCallback.handleInvoiceCallback(checkInvoice);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('Invoices checked successfully.');
  }
}
