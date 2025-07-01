import { Test, TestingModule } from '@nestjs/testing';
import { ContractorsController } from './contractors.controller';
import { ContractorsService } from './contractors.service';

describe('ContractorsController', () => {
  let controller: ContractorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractorsController],
      providers: [ContractorsService],
    }).compile();

    controller = module.get<ContractorsController>(ContractorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
