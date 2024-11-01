import { Injectable } from '@nestjs/common';
import { createVerify } from 'crypto';
import { TransferService } from 'src/transfer/transfer.service';
import { InvoiceDto } from './dto/event.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InvoiceCallbackService {
  constructor(
    private readonly transferService: TransferService,
    private readonly prismaService: PrismaService,
  ) {}
  async handleInvoiceCallback(invoiceDto: InvoiceDto) {
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

  async verifySignature(signature: string) {
    const response = await fetch(process.env.STARK_API + 'v2/public-key');
    const publicKey = (await response.json()).content;

    const verifier = createVerify('SHA256');
    verifier.update(signature);
    const test = verifier.verify(publicKey, signature, 'base64');

    if (!test) {
      throw new Error('Invalid signature');
    }
  }
}
