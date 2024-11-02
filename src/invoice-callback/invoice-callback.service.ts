import { Injectable } from '@nestjs/common';
import { TransferService } from 'src/transfer/transfer.service';
import { InvoiceDto } from './dto/event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as elliptic from 'elliptic';
import * as crypto from 'crypto';

@Injectable()
export class InvoiceCallbackService {
  private ec = new elliptic.ec('secp256k1');

  constructor(
    private readonly transferService: TransferService,
    private readonly prismaService: PrismaService,
  ) {}
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
      const response = await fetch(process.env.STARK_API + 'v2/public-key');
      const publicKey = (await response.json()).publicKeys[0].content;
      let messageFormat = null;

      if (typeof message === 'object') {
        messageFormat = JSON.stringify(message);
      } else {
        messageFormat = message;
      }

      const bodyHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(messageFormat))
        .digest();
      const key = this.ec.keyFromPublic(publicKey, 'hex');
      const signatureBuffer = Buffer.from(signature, 'base64');

      if (!key.verify(bodyHash, signatureBuffer)) {
        throw new Error('Invalid signature');
      }
    } catch (error: any) {
      console.error('Error to verify signature');
      console.error('Message: ', error);
      throw new Error('Error to verify signature');
    }
  }
}
