import { describe, expect, it } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { Module } from "@nestjs/common";

import type {
  HcaptchaOptions,
  NormalizedHcaptchaOptions,
} from "./hcaptcha-options.types";
import {
  HcaptchaOptionsModule,
  NORMALIZED_HCAPTCHA_OPTIONS,
} from "./hcaptcha-options.module";
import { defaultGetCaptchaData } from "../get-captcha-data";

describe("HcaptchaOptionsModule", () => {
  const SECRET = "secret";
  const SITEKEY = "sitekey";

  const OPTIONS: HcaptchaOptions = {
    secret: SECRET,
    sitekey: SITEKEY,
  };

  const assertNormalizedOptions = (moduleRef: TestingModule) => {
    const options = moduleRef.get<NormalizedHcaptchaOptions>(
      NORMALIZED_HCAPTCHA_OPTIONS,
    );

    expect(options.secret).toBe(SECRET);
    expect(options.sitekey).toBe(SITEKEY);
    expect(options.getCaptchaData).toBe(defaultGetCaptchaData);
  };

  describe("forRoot", () => {
    it("should normalize options", async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [HcaptchaOptionsModule.forRoot(OPTIONS)],
      }).compile();

      assertNormalizedOptions(moduleRef);
    });
  });

  describe("forRootAsync", () => {
    class OptionsFactory {
      create(): HcaptchaOptions {
        return OPTIONS;
      }
    }

    describe("useClass", () => {
      it("should normalize options", async () => {
        const moduleRef = await Test.createTestingModule({
          imports: [
            HcaptchaOptionsModule.forRootAsync({
              useClass: OptionsFactory,
            }),
          ],
        }).compile();

        assertNormalizedOptions(moduleRef);
      });
    });

    describe("useExisting", () => {
      it("should normalize options", async () => {
        @Module({
          providers: [OptionsFactory],
          exports: [OptionsFactory],
        })
        class OptionsFactoryModule {}

        const moduleRef = await Test.createTestingModule({
          imports: [
            HcaptchaOptionsModule.forRootAsync({
              imports: [OptionsFactoryModule],
              useExisting: OptionsFactory,
            }),
          ],
        }).compile();

        assertNormalizedOptions(moduleRef);
      });
    });

    describe("useFactory", () => {
      it("should normalize options", async () => {
        const moduleRef = await Test.createTestingModule({
          imports: [
            HcaptchaOptionsModule.forRootAsync({
              useFactory: () => OPTIONS,
            }),
          ],
        }).compile();

        assertNormalizedOptions(moduleRef);
      });
    });
  });
});
