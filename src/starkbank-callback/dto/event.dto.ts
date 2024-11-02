import {
  IsString,
  IsBoolean,
  IsDateString,
  IsArray,
  IsNumber,
  ValidateNested,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Transfer } from 'starkbank';

class DescriptionDto {
  @IsString()
  key: string;

  @IsString()
  @IsOptional()
  value?: string;
}

class DiscountDto {
  @IsNumber()
  percentage: number;

  @IsDateString()
  due: string;
}

export class InvoiceDto {
  @IsString()
  status: string;

  @IsDateString()
  updated: string;

  @IsString()
  taxId: string;

  @IsNumber()
  interest: number;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsArray()
  @IsString({ each: true })
  transactionIds: string[];

  @IsNumber()
  interestAmount: number;

  @IsDateString()
  created: string;

  @IsDateString()
  due: string;

  @ValidateNested({ each: true })
  @Type(() => DescriptionDto)
  descriptions: DescriptionDto[];

  @IsNumber()
  nominalAmount: number;

  @ValidateNested({ each: true })
  @Type(() => DiscountDto)
  discounts: DiscountDto[];

  @IsNumber()
  amount: number;

  @IsString()
  brcode: string;

  @IsNumber()
  expiration: number;

  @IsNumber()
  fineAmount: number;

  @IsNumber()
  discountAmount: number;

  @IsNumber()
  fee: number;

  @IsUrl()
  pdf: string;

  @IsUrl()
  link: string;

  @IsNumber()
  fine: number;

  @IsString()
  id: string;

  @IsString()
  name: string;
}

class LogDto {
  @IsString()
  id: string;

  @IsDateString()
  created: string;

  @IsArray()
  @IsString({ each: true })
  errors: string[];

  @IsString()
  type: string;

  @ValidateNested()
  @Type(() => InvoiceDto)
  invoice?: InvoiceDto;

  @ValidateNested()
  @Type(() => Transfer)
  transfer?: Transfer;
}

export class EventDto {
  @IsString()
  id: string;

  @IsString()
  subscription: string;

  @IsBoolean()
  isDelivered: boolean;

  @IsDateString()
  created: string;

  @ValidateNested()
  @Type(() => LogDto)
  log: LogDto;
}
