import { Invoice } from 'starkbank';
import { EventDto } from '../dto/event.dto';

export const transferEventMock = JSON.parse(`{
    "event": {
        "id": "5344245984526336",
        "isDelivered": false,
        "subscription": "transfer",
        "created": "2020-03-11T00:14:23.201602+00:00",
        "log": {
            "id": "5344245984526336",
            "errors": [],
            "type": "success",
            "created": "2020-03-11T00:14:22.104676+00:00",
            "transfer": {
                "id": "5907195937947648",
                "status": "success",
                "amount": 10000000,
                "name": "Jon Snow",
                "bankCode": "001",
                "branchCode": "5897",
                "accountNumber": "10000-0",
                "taxId": "580.822.679-17",
                "tags": ["jon", "snow", "knows-nothing"],
                "created": "2020-03-11T00:14:21.548876+00:00",
                "updated": "2020-03-11T00:14:22.104702+00:00",
                "transactionIds": ["6671637889941504"],
                "fee": 200
            }
        }
    }
}`) as {
  event: EventDto;
};

export const invoiceEventMock = JSON.parse(`{
    "event": {
        "id": "5344245984526336",
        "isDelivered": false,
        "subscription": "invoice",
        "created": "2020-03-11T00:14:23.201602+00:00",
        "log": {
            "id": "5344245984526336",
            "errors": [],
            "type": "success",
            "created": "2020-03-11T00:14:22.104676+00:00",
            "invoice": {
                "id": "5907195937947648",
                "status": "success",
                "amount": 10000000,
                "name": "Jon Snow",
                "bankCode": "001",
                "branchCode": "5897",
                "accountNumber": "10000-0",
                "taxId": "580.822.679-17",
                "tags": ["jon", "snow", "knows-nothing"],
                "created": "2020-03-11T00:14:21.548876+00:00",
                "updated": "2020-03-11T00:14:22.104702+00:00",
                "transactionIds": ["6671637889941504"],
                "fee": 200
            }
        }
    }
}`) as {
  event: EventDto;
};

export const invoiceMock = JSON.parse(`
{
    "id": "5907195937947648",
    "status": "success",
    "amount": 10000000,
    "name": "Jon Snow",
    "bankCode": "001",
    "branchCode": "5897",
    "accountNumber": "10000-0",
    "taxId": "580.822.679-17",
    "tags": ["jon", "snow", "knows-nothing"],
    "created": "2020-03-11T00:14:21.548876+00:00",
    "updated": "2020-03-11T00:14:22.104702+00:00",
    "transactionIds": ["6671637889941504"],
    "fee": 200
}`) as Invoice;
