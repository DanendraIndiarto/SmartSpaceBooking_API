import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const res = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'status' in data &&
          'statusCode' in data &&
          'data' in data
        ) {
          return data;
        }

        let message = 'Berhasil memproses permintaan';
        let responseData = data;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if ('message' in data && 'data' in data) {
            message = (data as any).message;
            responseData = (data as any).data;
          } else if ('message' in data) {
            message = (data as any).message;
            const { message: _, ...rest } = data as any;
            responseData = Object.keys(rest).length > 0 ? rest : null;
          }
        }

        return {
          status: true,
          statusCode: res.statusCode,
          message,
          data: responseData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
