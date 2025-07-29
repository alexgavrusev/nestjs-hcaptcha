import { beforeEach, describe, it } from "vitest";
import {
  Controller,
  HttpCode,
  type INestApplication,
  Module,
  Post,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import nock from "nock";
import request from "supertest";

import { HcaptchaModule, VerifyCaptcha } from "../src";

nock.disableNetConnect();
// Allow localhost connections so that the nest app can be tested
nock.enableNetConnect("127.0.0.1");

describe("VerifyCaptcha e2e", () => {
  let app: INestApplication;

  @Controller("users")
  class UsersController {
    @Post("register")
    @HttpCode(200)
    @VerifyCaptcha()
    register() {
      return { success: true };
    }
  }

  @Module({
    controllers: [UsersController],
    imports: [HcaptchaModule],
  })
  class UsersModule {}

  @Module({
    imports: [HcaptchaModule.forRoot({ secret: "secret" }), UsersModule],
  })
  class AppModule {}

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it("should return 403 when no hCaptcha token is provided", async () => {
    await request(app.getHttpServer())
      .post("/users/register")
      .send({})
      .expect(403)
      .expect({
        message: "Forbidden",
        statusCode: 403,
      });
  });

  it("should return 403 when the token is invalid", async () => {
    nock("https://hcaptcha.com")
      .post("/siteverify")
      .reply(200, {
        success: false,
        credit: false,
        hostname: "dummy-key-pass",
        "error-codes": ["not-using-dummy-secret"],
        challenge_ts: "2024-01-01T00:00:00.000Z",
      });

    await request(app.getHttpServer())
      .post("/users/register")
      .send({ "h-captcha-response": "10000000-aaaa-bbbb-cccc-000000000001" })
      .expect(403)
      .expect({
        message: "Forbidden",
        statusCode: 403,
      });
  });

  it("should return 200 when the token is valid", async () => {
    nock("https://hcaptcha.com").post("/siteverify").reply(200, {
      success: true,
      credit: false,
      hostname: "dummy-key-pass",
      challenge_ts: "2024-01-01T00:00:00.000Z",
    });

    await request(app.getHttpServer())
      .post("/users/register")
      .send({ "h-captcha-response": "10000000-aaaa-bbbb-cccc-000000000001" })
      .expect(200)
      .expect({
        success: true,
      });
  });
});
