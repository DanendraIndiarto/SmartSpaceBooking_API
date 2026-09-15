import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class MakerKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const makerKey =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request.headers['x-maker-key'] || request.headers['x-app-key'];

    if (!makerKey) {
      throw new UnauthorizedException(
        'Header x-maker-key / x-app-key wajib disertakan!',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    request.makerKey = makerKey;
    return true;
  }
}
