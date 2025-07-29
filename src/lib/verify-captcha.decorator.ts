import { UseGuards, applyDecorators } from "@nestjs/common";

import { HcaptchaGuard } from "./hcaptcha.guard";

export const VerifyCaptcha = (): ReturnType<typeof applyDecorators> =>
  applyDecorators(UseGuards(HcaptchaGuard));
