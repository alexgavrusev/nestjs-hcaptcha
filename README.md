# @gvrs/nestjs-hcaptcha

A NestJS module for adding hCaptcha validation

## Installation

```bash
npm i @gvrs/nestjs-hcaptcha
```

## Usage

First, provide the options in the root `AppModule`:

```ts
@Module({
  imports: [
    HcaptchaModule.forRoot({
      secret: 'YOUR_HCAPTCHA_SECRET',
    }),
  ],
})
export class AppModule {}
```

Afterward, import the `HcaptchaModule` in the module where you need to use captcha validation:

```ts
@Module({
  imports: [HcaptchaModule],
  controllers: [UsersController],
})
export class UsersModule {}
```

Finally, decorate the controller method with `@VerifyCaptcha()`:

```ts
@Controller('users')
class UsersController {
  @Post('register')
  @VerifyCaptcha()
  register() {}
}
```

By default, the hCaptcha token will be extracted from the `h-captcha-response` request body field

### Setting the sitekey you expect to see

Provide the `sitekey` option in the root `HcaptchaModule`:

```ts
@Module({
  imports: [
    HcaptchaModule.forRoot({
      secret: 'YOUR_HCAPTCHA_SECRET',
      sitekey: 'YOUR_SITEKEY',
    }),
  ],
})
export class AppModule {}
```

### Customizing the captcha data extraction

If you want to customize the retrieval of the hCaptcha token and/or the user's IP address, provide an implementation of `getCaptchaData` in the root `HcaptchaModule`:

```ts
@Module({
  imports: [
    HcaptchaModule.forRoot({
      secret: 'YOUR_HCAPTCHA_SECRET',
      getCaptchaData: (ctx) => {
        const request = ctx.switchToHttp().getRequest();

        const token = request.body['token'];
        const remoteip = request.headers['x-forwarded-for'];

        return { token, remoteip };
      },
    }),
  ],
})
export class AppModule {}
```

### Customizing the error response

By default, when the captcha is invalid, or cannot be validated, a 403 error will be sent to the client. To customize that response, use an [exception filter](https://docs.nestjs.com/exception-filters):

```ts
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
```

### Imperative captcha verification

If you don't want to, or cannot use the `@VerifyCaptha()` decorator or the `HcaptchaGuard`, you can verify the captcha by using the `HcaptchaService`:

```ts
@Controller('users')
class UsersController {
  constructor(private readonly hcaptchaService: HcaptchaService) {}

  @Post('register')
  async register(@Req() request: Request) {
    try {
      const token = request.body['h-captcha-response'];

      // returns the hCaptcha JSON response, or throws a HcaptchaException
      const verifyResponse = await this.hcaptchaService.verifyCaptcha(token);
    } catch {
      throw new BadRequestException();
    }
  }
}
```

## License

MIT © Aliaksandr Haurusiou.
