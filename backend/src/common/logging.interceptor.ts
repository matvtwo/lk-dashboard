import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest();
    const res = http.getResponse();

    const user = req.user;
    const rid = Math.random().toString(36).slice(2, 8); // request id
    const start = Date.now();

    // положим rid в req, чтобы было удобно искать
    req.rid = rid;

    console.log(
      `[HTTP IN] rid=${rid} ${req.method} ${req.originalUrl || req.url} ` +
        `user=${user?.sub ?? 'anon'} role=${user?.role ?? '-'}`
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          console.log(
            `[HTTP OUT] rid=${rid} status=${res.statusCode} ${ms}ms`
          );
        },
        error: (err) => {
          const ms = Date.now() - start;
          console.log(
            `[HTTP ERR] rid=${rid} ${ms}ms message=${err?.message ?? err}`
          );
        },
      }),
    );
  }
}
