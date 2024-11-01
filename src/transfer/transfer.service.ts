import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransferService {
  constructor(private readonly prismaService: PrismaService) {}
  async createTransfer(
    name: string,
    amount: number,
    taxId: string,
    bankCode: string,
    branchCode: string,
    accountNumber: string,
    accountType: string,
    invoiceId: string,
  ) {
    const response = await fetch(process.env.STARK_API + 'v2/transfer', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        name,
        amount,
        taxId,
        bankCode,
        branchCode,
        accountNumber,
        accountType,
      }),
    });
    if (!response.ok) {
      throw new Error('Failed to create transfer');
    }

    const transferResponse = await response.json();

    const transfer = await this.prismaService.transfer.create({
      data: {
        id: transferResponse.id,
        invoiceId,
        amount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return transfer;
  }
}
