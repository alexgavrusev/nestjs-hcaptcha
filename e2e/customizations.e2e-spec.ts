import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  Controller,
  ExceptionFilter,
  HttpCode,
  INestApplication,
  Module,
  Post,
  Req,
  UseFilters,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Request } from 'express';
import nock from 'nock';
import request from 'supertest';

import {
  GetCaptchaData,
  HcaptchaException,
  HcaptchaModule,
  HcaptchaService,
  VerifyCaptcha,
  VerifyResponse,
} from '../src';

nock.disableNetConnect();
// Allow localhost connections so that the nest app can be tested
nock.enableNetConnect('127.0.0.1');

describe('customizations e2e', () => {
  @Catch(HcaptchaException)
  class HcaptchaExceptionFilter implements ExceptionFilter {
    catch(exception: HcaptchaException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = 400;

      response.status(status).json({
        statusCode: status,
        message: 'Invalid captcha',
      });
    }
  }

  @Controller('users')
  class UsersController {
    constructor(private readonly hcaptchaService: HcaptchaService) {}

    @Post('extraction')
    @HttpCode(200)
    @VerifyCaptcha()
    async extraction() {
      return { success: true };
    }

    @Post('exception-filter')
    @VerifyCaptcha()
    @UseFilters(HcaptchaExceptionFilter)
    exceptionFilter() {
      return { success: true };
    }

    @Post('imperative')
    @HttpCode(200)
    async imperative(@Req() request: Request) {
      try {
        const token = request.body['h-captcha-response'];

        // returns the hCaptcha JSON response, or throws a HcaptchaException
        const verifyResponse = await this.hcaptchaService.verifyCaptcha(token);

        return verifyResponse;
      } catch {
        throw new BadRequestException();
      }
    }
  }

  @Module({
    imports: [HcaptchaModule],
    controllers: [UsersController],
  })
  class UsersModule {}

  const secret = 'YOUR_HCAPTCHA_SECRET';
  const sitekey = 'YOUR_SITEKEY';
  const getCaptchaData: GetCaptchaData = (ctx) => {
    const request = ctx.switchToHttp().getRequest();

    const token = request.body['token'];
    const remoteip = request.headers['x-forwarded-for'];

    return { token, remoteip };
  };

  @Module({
    imports: [
      HcaptchaModule.forRoot({
        secret,
        sitekey,
        getCaptchaData,
      }),
      UsersModule,
    ],
  })
  class AppModule {}

  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('should allow to set the sitekey and customize the captcha data extraction', async () => {
    const remoteip = '192.168.0.10';
    const token = 'token';

    nock('https://hcaptcha.com')
      .post('/siteverify', {
        secret,
        sitekey,
        response: token,
        remoteip,
      })
      .reply(200, {
        success: true,
      });

    // If extraction was not customized, a ERR_NOCK_NO_MATCH will be thrown by nock
    await request(app.getHttpServer())
      .post('/users/extraction')
      .set({ 'x-forwarded-for': remoteip })
      .send({ token })
      .expect(200);
  });

  it('should allow to customize the error response', async () => {
    nock('https://hcaptcha.com').post('/siteverify').reply(200, {
      success: false,
    });

    await request(app.getHttpServer())
      .post('/users/exception-filter')
      .send({ 'h-captcha-response': 'token' })
      .expect(400)
      .expect({
        statusCode: 400,
        message: 'Invalid captcha',
      });
  });

  it('should allow to use imperative hcaptcha validation', async () => {
    const verifyReponse: VerifyResponse = {
      success: true,
      credit: false,
      challenge_ts: '2024-01-01T00:00:00.000Z',
    };

    nock('https://hcaptcha.com').post('/siteverify').reply(200, verifyReponse);

    await request(app.getHttpServer())
      .post('/users/imperative')
      .send({ 'h-captcha-response': 'token' })
      .expect(200)
      .expect(verifyReponse);
  });
});
