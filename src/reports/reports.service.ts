import { Report } from './report.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from 'src/users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
    constructor(@InjectRepository(Report) private repo:Repository<Report>) {}

    create(reportDto: CreateReportDto, user: User) {
        const report = this.repo.create(reportDto);
        report.user = user;
        return this.repo.save(report);
    };

    async changeApproval(id: string, approved:boolean) {
        const report = await this.repo.findOne({where:{id:parseInt(id)}});
        if(!report) {
            throw new NotFoundException("report not found!");
        }
        report.approved = approved;
        return this.repo.save(report);
    };

    //Implementing query builder to build filtering
    createEstimate({make, model, lng, lat, year, mileage}: GetEstimateDto) {
        return this.repo.createQueryBuilder()
            .select("AVG(price)",'price')
            //to secure the app from the sql injection, syntax is like this -> :make
            .where('make = :make', {make})
            //second .where statement would overwrite previous one so we have to use --> .andWhere()
            .andWhere('model = :model', {model})
            .andWhere('lng - :lng BETWEEN -5 AND 5', {lng})
            .andWhere('lat - :lat BETWEEN -5 AND 5', {lat})
            .andWhere('year - :year BETWEEN -3 AND 3', {year})
            .andWhere('approved IS TRUE')
            //orderBy doesnt take paramater object as second argument
            .orderBy('ABS(milage - :mileage)', 'DESC')
            .setParameters({mileage})
            .getRawOne()
    };
};
