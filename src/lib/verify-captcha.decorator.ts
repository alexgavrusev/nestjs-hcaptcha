import { UseGuards, applyDecorators } from '@nestjs/common';

import { HcaptchaGuard } from './hcaptcha.guard';

export const VerifyCaptcha = () => applyDecorators(UseGuards(HcaptchaGuard));
