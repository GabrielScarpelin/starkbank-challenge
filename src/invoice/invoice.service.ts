import { Injectable } from '@nestjs/common';
import invoices from './examples/people';
import { PrismaService } from 'src/prisma/prisma.service';
import { InvoiceCallbackService } from 'src/invoice-callback/invoice-callback.service';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly invoiceCallback: InvoiceCallbackService,
  ) {}
  async creatingInvoices() {
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
    const response = await fetch(process.env.STARK_API + 'v2/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoices,
      }),
    });
    const data = await response.json();

    if (response.status !== 201 && response.status !== 200) {
      console.error('Error to send invoices.');
      console.error('Invoices list: ', invoices);
      console.error('Response: ', data);
      throw new Error('Error to send invoices.');
    }
    const invoicesResponse = data.invoices;

    await this.prismaService.invoice.createMany({
      data: invoicesResponse.map((invoice) => ({
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
        linkUrl: invoice.linkUrl,
        name: invoice.name,
        pdfUrl: invoice.pdfUrl,
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
      const response = await fetch(
        process.env.STARK_API + 'v2/invoice/' + invoice.id,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await response.json();

      if (response.status !== 200) {
        console.error('Error to get invoice.');
        console.error('Invoice: ', invoice);
        console.error('Response: ', data);
        throw new Error('Error to get invoice.');
      }

      if (data.invoice.status === 'paid') {
        await this.invoiceCallback.handleInvoiceCallback(data.invoice);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('Invoices checked successfully.');
  }
}
