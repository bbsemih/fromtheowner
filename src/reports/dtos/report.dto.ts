import { Expose, Transform } from "class-transformer";
import { User } from "src/users/user.entity";

export class ReportDto {
    @Expose()
    price:number;
    @Expose()
    year:number;
    @Expose()
    lng:number;
    @Expose()
    lat:number;
    @Expose()
    make:string;
    @Expose()
    model:string;
    @Expose()
    mileage:number;

    //To show the user id instead of the whole user object
    @Transform(({obj}) => obj.user.id)
    @Expose()
    userId:number;
};