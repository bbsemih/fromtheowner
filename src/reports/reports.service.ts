import { Report } from './report.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from 'src/users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class ReportsService {
    constructor(@InjectRepository(Report) private repo:Repository<Report>) {}

    async create(reportDto: CreateReportDto, user: User) {
        const report = this.repo.create(reportDto);
        report.user = user;
        try {
            Logger.log(`Report created by user with email: '${user.email}'`);
            const newReport = await this.repo.save(report);
            Logger.log(`Report with id: '${newReport.id}' has been created by user with email: ${user.email}`);
            return newReport;
        } catch (err) {
            Logger.error(`Failed to create report by user with email: '${user.email}'`,err.stack);
            throw err;
        };
    };

    async changeApproval(id: string, approved: boolean) {
        const report = await this.repo.findOne( { where:{ id:parseInt(id) } });
        if(!report) {
            Logger.error(`Failed to find the report with id: '${id}'`);
            throw new NotFoundException("report not found!");
        };
        report.approved = approved;
        try {
            const updatedReport = await this.repo.save(report);
            Logger.log(`Report with id: '${id}' has been updated ${approved ? 'approved' : 'unapproved'}`);
            return updatedReport;
        } catch(err) {
            Logger.error(`Failed to update report with id: '${id}'`,err.stack);
            throw err;
        };
    };

    //Implementing query builder to build filtering to get estimate from given data
    async createEstimate({make, model, lng, lat, year, mileage}: GetEstimateDto) {
        try {
            const result = await this.repo.createQueryBuilder()
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
        Logger.log(`Estimate created with make: '${make}', model: '${model}', year: '${year}', mileage: '${mileage}' has been created`);
        return result;
        } catch(err) {
            Logger.error(`Failed to create estimate with for: '${make}', model: '${model}', year: '${year}', mileage: '${mileage}'`,err.stack);
            throw err;
        }
    };
};
