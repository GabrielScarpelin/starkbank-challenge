import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { StarkbankCallbackService } from './starkbank-callback.service';
import { EventDto } from './dto/event.dto';

@Controller('starkbank-callback')
export class StarkbankCallbackController {
  constructor(
    private readonly starkbankCallbackService: StarkbankCallbackService,
  ) {}

  @Post()
  @HttpCode(200)
  async handleInvoiceCallback(
    @Body()
    body: {
      event: EventDto;
    },
    @Headers('Digital-Signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    console.log('Digital Signature: ', signature);
    await this.starkbankCallbackService.verifySignature(
      req.rawBody.toString(),
      signature,
    );
    if (body.event.subscription === 'invoice') {
      return this.starkbankCallbackService.handleInvoiceCallback(
        body.event.log.invoice,
      );
    }
    if (body.event.subscription === 'transfer') {
      return this.starkbankCallbackService.handleTransferCallback(
        body.event.log.transfer,
      );
    }
  }
}
