import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { InvoiceCallbackService } from './invoice-callback.service';
import { EventDto } from './dto/event.dto';

@Controller('invoice-callback')
export class InvoiceCallbackController {
  constructor(
    private readonly invoiceCallbackService: InvoiceCallbackService,
  ) {}

  @Post()
  async handleInvoiceCallback(
    @Body()
    body: {
      event: EventDto;
    },
    @Headers('Digital-Signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    console.log('Digital Signature: ', signature);
    await this.invoiceCallbackService.verifySignature(
      req.rawBody.toString(),
      signature,
    );
    console.log('Invoice callback received: ', body);
    return this.invoiceCallbackService.handleInvoiceCallback(
      body.event.log.invoice,
    );
  }
}
