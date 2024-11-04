import { Injectable } from '@nestjs/common';
import invoices from './examples/people';
import { PrismaService } from 'src/prisma/prisma.service';
import { StarkbankCallbackService } from 'src/starkbank-callback/starkbank-callback.service';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';
import { Invoice } from 'starkbank';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly starkbankCallbackService: StarkbankCallbackService,
    private readonly starkbankConfig: StarkbankConfig,
  ) {}
  async creatingInvoices() {
    if (invoices.length === 0) {
      return;
    }
    const batchsNums = Math.ceil(invoices.length / 100);

    if (batchsNums > 0) {
      for (let i = 0; i < batchsNums; i++) {
        const batch = invoices.slice(i * 100, (i + 1) * 100);
        await this.emitInvoice(batch);
      }
    }
  }
  async emitInvoice(invoices: any[]) {
    const invoicesList = invoices.map((invoice) => {
      return new Invoice({
        amount: invoice.amount + (Math.round(Math.random() * 4000) + 1000),
        taxId: invoice.taxId,
        name: invoice.name,
      });
    });
    const invoicesCreated =
      await this.starkbankConfig.starkbank.invoice.create(invoicesList);
    await this.prismaService.invoice.createMany({
      data: invoicesCreated.map((invoice) => ({
        id: invoice.id,
        amount: invoice.amount,
        status: 'CREATED',
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
        OR: [
          {
            status: 'CREATED',
          },
          {
            status: 'OVERDUE',
          },
        ],
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
        await this.starkbankCallbackService.handleInvoiceCallback(checkInvoice);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('Invoices checked successfully.');
  }
}
