import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCar1691334878376 implements MigrationInterface {
  name = 'AddCar1691334878376';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "car" ("id" SERIAL NOT NULL, "price" integer NOT NULL, "make" character varying NOT NULL, "model" character varying NOT NULL, "year" integer NOT NULL, "lng" integer NOT NULL, "lat" integer NOT NULL, "mileage" integer NOT NULL, "userId" integer, CONSTRAINT "PK_55bbdeb14e0b1d7ab417d11ee6d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "car" ADD CONSTRAINT "FK_a4f3cb1b950608959ba75e8df36" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "car" DROP CONSTRAINT "FK_a4f3cb1b950608959ba75e8df36"`);
    await queryRunner.query(`DROP TABLE "car"`);
  }
}
