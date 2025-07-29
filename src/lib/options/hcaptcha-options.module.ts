import {
  ConfigurableModuleBuilder,
  Module,
  type ConfigurableModuleHost,
} from "@nestjs/common";

import { defaultGetCaptchaData } from "../get-captcha-data";
import type {
  HcaptchaOptions,
  NormalizedHcaptchaOptions,
} from "./hcaptcha-options.types";

const PROVIDED_HCAPTCHA_OPTIONS = Symbol("PROVIDED_HCAPTCHA_OPTIONS");

export const NORMALIZED_HCAPTCHA_OPTIONS: symbol = Symbol(
  "NORMALIZED_HCAPTCHA_OPTIONS",
);

const normalizeOptions = (
  options: HcaptchaOptions,
): NormalizedHcaptchaOptions => ({
  getCaptchaData: defaultGetCaptchaData,
  ...options,
});

const host: ConfigurableModuleHost<HcaptchaOptions, "forRoot", "create"> =
  new ConfigurableModuleBuilder<HcaptchaOptions>({
    optionsInjectionToken: PROVIDED_HCAPTCHA_OPTIONS,
  })
    .setClassMethodName("forRoot")
    .setExtras({}, (def) => ({
      ...def,
      global: true,
      providers: [
        ...(def.providers ?? []),
        {
          provide: NORMALIZED_HCAPTCHA_OPTIONS,
          useFactory: normalizeOptions,
          inject: [PROVIDED_HCAPTCHA_OPTIONS],
        },
      ],
      exports: [NORMALIZED_HCAPTCHA_OPTIONS],
    }))
    .build();

@Module({})
export class HcaptchaOptionsModule extends host.ConfigurableModuleClass {}

export type AsyncHcaptchaOptions = typeof host.ASYNC_OPTIONS_TYPE;
