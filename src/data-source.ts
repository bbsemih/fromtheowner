import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'postgres',
  synchronize: true,
  logging: true,
  //dont import entities here, add them by using *entity* property
  entities: ['**/*.entity.js'],
  migrations: [],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Database connection established!');
  })
  .catch(error => console.log(error));
