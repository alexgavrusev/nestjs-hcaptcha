import { verify } from 'hcaptcha';

export type VerifyResponse = Awaited<ReturnType<typeof verify>>;
