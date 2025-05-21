import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateTestimonyDto } from '../src/testimony/dto/create-testimony.dto';

describe('TestimonyController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/testimonies/public (POST)', () => {
    it('should create a new public testimony', () => {
      const createDto: CreateTestimonyDto = {
        fullName: 'fullName',
        phone: 'phone',
        topic: 'topic',
      };

      return request(app.getHttpServer())
        .post('/testimonies/public')
        .send(createDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.fullName).toBe(createDto.fullName);
          expect(res.body.topic).toBe(createDto.topic);
          expect(res.body.status).toBe('NEW');
        });
    });
  });
});
