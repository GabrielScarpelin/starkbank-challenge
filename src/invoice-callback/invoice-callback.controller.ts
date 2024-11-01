import { Body, Controller, Headers, Post } from '@nestjs/common';
import { InvoiceCallbackService } from './invoice-callback.service';
import { EventDto } from './dto/event.dto';

@Controller('invoice-callback')
export class InvoiceCallbackController {
  constructor(
    private readonly invoiceCallbackService: InvoiceCallbackService,
  ) {}

  @Post()
  async handleInvoiceCallback(
    @Body() body: EventDto,
    @Headers('Digital-Signature') signature: string,
  ) {
    console.log('Digital Signature: ', signature);
    await this.invoiceCallbackService.verifySignature(signature);
    console.log('Invoice callback received: ', body);
    return this.invoiceCallbackService.handleInvoiceCallback(body.log.invoice);
  }
}
