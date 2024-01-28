import { ExecutionContext } from '@nestjs/common';
import { HcaptchaException } from '../hcaptcha.exception';

export type CaptchaData = {
  token: string;
  remoteip?: string;
};

export type GetCaptchaData = (
  executionContext: ExecutionContext
) => CaptchaData;

export const defaultGetCaptchaData: GetCaptchaData = (context) => {
  const request = context.switchToHttp().getRequest();

  const token = request.body['h-captcha-response'];

  if (!token) {
    throw new HcaptchaException(
      new Error('No hCaptcha token present in request body')
    );
  }

  return {
    token,
  };
};
