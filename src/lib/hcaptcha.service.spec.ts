import { beforeEach, describe, expect, it } from "vitest";
import { Test } from "@nestjs/testing";
import nock from "nock";

import { HcaptchaService } from "./hcaptcha.service";
import { type HcaptchaOptions, NORMALIZED_HCAPTCHA_OPTIONS } from "./options";
import { HcaptchaException } from "./hcaptcha.exception";
import type { VerifyResponse } from "./typings";

nock.disableNetConnect();

describe("HcaptchaService", () => {
  let service: HcaptchaService;
  const options: HcaptchaOptions = {
    secret: "secret",
    sitekey: "sitekey",
  };

  beforeEach(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        HcaptchaService,
        {
          provide: NORMALIZED_HCAPTCHA_OPTIONS,
          useValue: options,
        },
      ],
    }).compile();

    service = mod.get(HcaptchaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should send all options with the request", async () => {
    const verifyResponse: VerifyResponse = {
      success: true,
      credit: false,
    };

    const token = "token";
    const remoteip = "remoteip";

    nock("https://hcaptcha.com")
      .post("/siteverify", {
        secret: options.secret,
        sitekey: options.sitekey,
        response: token,
        remoteip,
      })
      .reply(200, verifyResponse);

    // If not all options will be sent, a ERR_NOCK_NO_MATCH will be thrown by nock
    const result = await service.verifyCaptcha(token, remoteip);

    expect(result).toEqual(verifyResponse);
  });

  it("should return the hCaptcha response if success is true", async () => {
    const verifyResponse: VerifyResponse = {
      success: true,
      credit: false,
    };

    nock("https://hcaptcha.com").post("/siteverify").reply(200, verifyResponse);

    const result = await service.verifyCaptcha("token");

    expect(result).toEqual(verifyResponse);
  });

  it("should throw exception with cause set to verify response if success is false", async () => {
    const verifyResponse: VerifyResponse = {
      success: false,
      "error-codes": ["not-using-dummy-secret"],
    };

    nock("https://hcaptcha.com").post("/siteverify").reply(200, verifyResponse);

    const error = await service.verifyCaptcha("token").then(
      () => {
        throw new Error("should have rejected");
      },
      (e) => e,
    );

    expect(error).toBeInstanceOf(HcaptchaException);
    expect(error).toHaveProperty("cause");
    expect(error.cause).toEqual(verifyResponse);
  });

  it("should throw exception with cause set to request error if sending the hCaptcha request fails", async () => {
    const requestError = new Error("ECONNREFUSED");

    nock("https://hcaptcha.com")
      .post("/siteverify")
      .replyWithError(requestError);

    const error = await service.verifyCaptcha("token").then(
      () => {
        throw new Error("should have rejected");
      },
      (e) => e,
    );

    expect(error).toBeInstanceOf(HcaptchaException);
    expect(error).toHaveProperty("cause");
    expect(error.cause).toEqual(requestError);
  });
});
