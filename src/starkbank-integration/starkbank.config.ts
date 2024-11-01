import { Injectable } from '@nestjs/common';
import * as starkbank from 'starkbank';

@Injectable()
export class StarkbankConfig {
  private readonly privateKey = process.env.PRIVATE_KEY;
  private readonly environment = process.env.ENVIRONMENT;
  private readonly projectID = process.env.PROJECT_ID;

  public starkbankProject: starkbank.Project;
  public starkbank = starkbank;

  constructor() {
    if (!this.privateKey || !this.environment || !this.projectID) {
      throw new Error(
        'Missing environment variables for Starkbank integration',
      );
    }
    this.starkbankProject = new starkbank.Project({
      environment: this.environment,
      id: this.projectID,
      privateKey: this.privateKey,
      name: 'Starkbank NestJS',
    });
    this.starkbank.setUser(this.starkbankProject);
    this.starkbank.setLanguage('pt-BR');
  }
}
