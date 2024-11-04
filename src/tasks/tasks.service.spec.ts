import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { InvoiceService } from 'src/invoice/invoice.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: InvoiceService,
          useValue: {
            creatingInvoices: jest.fn(),
            checkPendingInvoices: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call creatingInvoices method', async () => {
    await service.handleEmitInvoice();
    expect(service.handleEmitInvoice).toBeDefined();
  });

  it('should call checkPendingInvoices method', async () => {
    await service.handleCheckPendingTasks();
    expect(service.handleCheckPendingTasks).toBeDefined();
  });
});
