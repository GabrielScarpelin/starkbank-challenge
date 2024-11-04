import { Test, TestingModule } from '@nestjs/testing';
import { StarkbankConfig } from './starkbank.config';
import * as starkbank from 'starkbank';

jest.mock('starkbank', () => ({
  Project: jest.fn().mockImplementation(() => ({
    environment: 'sandbox',
    id: 'mock-project-id',
    privateKey: 'mock-private-key',
  })),
  setUser: jest.fn(),
  setLanguage: jest.fn(),
}));

describe('StarkbankConfig', () => {
  let starkbankConfig: StarkbankConfig;
  const mockPrivateKey = 'mock-private-key';
  const mockEnvironment = 'sandbox';
  const mockProjectID = 'mock-project-id';

  // Configura as variáveis de ambiente antes dos testes
  beforeAll(() => {
    process.env.PRIVATE_KEY = mockPrivateKey;
    process.env.ENVIRONMENT = mockEnvironment;
    process.env.PROJECT_ID = mockProjectID;
  });

  // Configura o módulo de teste do NestJS
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [StarkbankConfig],
    }).compile();

    starkbankConfig = module.get<StarkbankConfig>(StarkbankConfig);
  });

  it('should initialize StarkbankConfig with correct values', () => {
    expect(starkbankConfig.starkbankProject).toBeDefined();
    expect(starkbank.Project).toHaveBeenCalledWith({
      environment: mockEnvironment,
      id: mockProjectID,
      privateKey: mockPrivateKey,
      name: 'Starkbank NestJS',
    });
    expect(starkbank.setUser).toHaveBeenCalledWith(
      starkbankConfig.starkbankProject,
    );
    expect(starkbank.setLanguage).toHaveBeenCalledWith('pt-BR');
  });

  it('should throw an error if environment variables are missing', async () => {
    delete process.env.PRIVATE_KEY;

    await expect(
      Test.createTestingModule({
        providers: [StarkbankConfig],
      }).compile(),
    ).rejects.toThrow(
      'Missing environment variables for Starkbank integration',
    );
  });
});
