import { Injectable } from '@nestjs/common';
import { TransferService } from 'src/transfer/transfer.service';
import { InvoiceDto } from './dto/event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';
import { Transfer } from 'starkbank';

@Injectable()
export class StarkbankCallbackService {
  private starkbankConfig: StarkbankConfig;

  constructor(
    private readonly transferService: TransferService,
    private readonly prismaService: PrismaService,
  ) {
    this.starkbankConfig = new StarkbankConfig();
  }
  async handleInvoiceCallback(invoiceDto: InvoiceDto) {
    if (invoiceDto.status !== 'paid') {
      const mappedStatus = {
        overdue: 'OVERDUE',
        canceled: 'CANCELED',
        voided: 'VOIDED',
        expired: 'EXPIRED',
        created: 'CREATED',
      };

      this.prismaService.invoice.upsert({
        where: {
          id: invoiceDto.id,
        },
        update: {
          status: mappedStatus[invoiceDto.status],
        },
        create: {
          id: invoiceDto.id,
          linkUrl: invoiceDto.link,
          pdfUrl: invoiceDto.pdf,
          taxId: invoiceDto.taxId,
          amount: invoiceDto.amount,
          status: mappedStatus[invoiceDto.status],
          createdAt: new Date(),
          updatedAt: new Date(),
          brcode: invoiceDto.brcode,
          discountAmount: invoiceDto.discountAmount,
          fee: invoiceDto.fee,
          due: invoiceDto.due,
          expiration: invoiceDto.expiration,
          fine: invoiceDto.fine,
          interest: invoiceDto.interest,
          fineAmount: invoiceDto.fineAmount,
          interestAmount: invoiceDto.interestAmount,
          nominalAmount: invoiceDto.nominalAmount,
          name: invoiceDto.name,
        },
      });
    }
    const invoice = await this.prismaService.invoice.update({
      where: {
        id: invoiceDto.id,
        status: 'CREATED',
      },
      data: {
        status: 'PAID',
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const bankCode = '20018183';
    const branch = '0001';
    const account = '6341320293482496';
    const name = 'Stark Bank S.A.';
    const taxId = '20.018.183/0001-80';
    const accountType = 'payment';

    const amount = invoiceDto.amount;
    const fee = invoiceDto.fee;
    const invoiceId = invoiceDto.id;

    const transferAmount = amount - fee;

    try {
      await this.transferService.createTransfer(
        name,
        transferAmount,
        taxId,
        bankCode,
        branch,
        account,
        accountType,
        invoiceId,
      );
      await this.prismaService.invoice.update({
        where: {
          id: invoiceDto.id,
        },
        data: {
          status: 'TRANSFER_SOLICITED',
        },
      });
      console.log('Transfer done');
      return {
        message: 'Invoice callback received and processed',
      };
    } catch (error: any) {
      console.error('Error to create transfer: ', error);
      return {
        message: 'Invoice callback received but transfer failed',
      };
    }
  }

  async handleTransferCallback(transfer: Transfer) {
    const mappedStatus = {
      processing: 'PROCESSING',
      canceled: 'CANCELED',
      failed: 'FAILED',
      success: 'SUCCESS',
      created: 'CREATED',
    };
    const transferUpdated = await this.prismaService.transfer.upsert({
      where: {
        id: transfer.id,
      },
      update: {
        status: mappedStatus[transfer.status],
      },
      create: {
        id: transfer.id,
        invoiceId: null,
        amount: transfer.amount,
        status: mappedStatus[transfer.status],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (!transferUpdated) {
      throw new Error('Error to update transfer');
    }

    return transferUpdated;
  }

  async verifySignature(message: any, signature: string) {
    try {
      const event = await this.starkbankConfig.starkbank.event.parse({
        content: message,
        signature,
      });

      if (
        !event ||
        (event.subscription !== 'invoice' && event.subscription !== 'transfer')
      ) {
        throw new Error('Invalid event');
      }
    } catch (error: any) {
      console.error('Error to verify signature: ', error);
      console.log('Error, but let it pass');
      console.log('Message to string: ', message.toString());
      console.log('Signature: ', signature);
    }
  }
}
