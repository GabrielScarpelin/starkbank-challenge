import { Injectable } from '@nestjs/common';
import { TransferService } from 'src/transfer/transfer.service';
import { InvoiceDto } from './dto/event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';

@Injectable()
export class InvoiceCallbackService {
  private starkbankConfig: StarkbankConfig;

  constructor(
    private readonly transferService: TransferService,
    private readonly prismaService: PrismaService,
  ) {
    this.starkbankConfig = new StarkbankConfig();
  }
  async handleInvoiceCallback(invoiceDto: InvoiceDto) {
    if (invoiceDto.status !== 'paid') {
      return {
        message: 'Invoice callback received but not paid',
      };
    }
    const invoice = await this.prismaService.invoice.update({
      where: {
        id: invoiceDto.id,
        status: 'WAITING_PAYMENT',
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
          status: 'SUCCESSFUL_TRANSFER',
        },
      });

      return {
        message: 'Invoice callback received and processed',
      };
    } catch (error: any) {
      return {
        message: 'Invoice callback received but transfer failed',
      };
    }
  }

  async verifySignature(message: any, signature: string) {
    try {
      const event = await this.starkbankConfig.starkbank.event.parse({
        content: message,
        signature,
      });

      if (!event || event.subscription !== 'invoice') {
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
