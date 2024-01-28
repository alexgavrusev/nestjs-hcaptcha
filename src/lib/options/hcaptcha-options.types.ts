import { GetCaptchaData } from '../get-captcha-data';

export type HcaptchaOptions = {
  secret: string;
  sitekey?: string;
  getCaptchaData?: GetCaptchaData;
};

export type NormalizedHcaptchaOptions = Required<
  Pick<HcaptchaOptions, 'getCaptchaData'>
> &
  HcaptchaOptions;
