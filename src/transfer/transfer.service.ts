import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StarkbankConfig } from 'src/starkbank-integration/starkbank.config';
import { Transfer } from 'starkbank';

@Injectable()
export class TransferService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly starkbankConfig: StarkbankConfig,
  ) {}

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
    console.log('Creating transfer');
    const transferCreated =
      await this.starkbankConfig.starkbank.transfer.create([
        new Transfer({
          name,
          amount,
          accountNumber,
          bankCode,
          branchCode,
          taxId,
          accountType,
        }),
      ]);
    const transfer = await this.prismaService.transfer.create({
      data: {
        id: transferCreated[0].id,
        invoiceId,
        amount,
        status: 'CREATED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    console.log('Transfer created: ', transfer);
    return transfer;
  }
}
