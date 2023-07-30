import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { Report } from './report.entity';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let fakeReportsService: Partial<ReportsService>;

  beforeEach(async () => {
    fakeReportsService = {

      //TODO: implement this
      create: () => {
        Promise.resolve({id:1});
      },
    };


    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {provide: ReportsService, useValue: fakeReportsService},
      ]
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it("should get an estimate value based on a query", async () => {
    const estimateParams = {
      id: 1,
      make: 'honda',
      model: 'civic',
      lng: 22,
      lat: 32,
      year: 2000,
      mileage: 100,
    };

    const result = await controller.getEstimate(estimateParams);
    expect(result).toEqual({price: 1000});
  });
});
