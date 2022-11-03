import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

type Condtional<T> = (data: T) => boolean;
type DataConverter<T, R> = (data: T) => R;

@Injectable()
export class AutoStatusCodeInterceptor<T, R> implements NestInterceptor<T, T | R> {
    private conditional: Condtional<T>;
    private statusCode: HttpStatus;
    private dataConverter?: DataConverter<T, R>;

    constructor(callback: Condtional<T>, statusCode: HttpStatus, dataConverter?: DataConverter<T, R>) {
        this.conditional = callback;
        this.statusCode = statusCode;
        this.dataConverter = dataConverter;
    }
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T | R> | Promise<Observable<T | R>> {
        return next.handle().pipe(
            map((data) => {
                if (this.conditional(data)) {
                    context.switchToHttp().getResponse().status(this.statusCode);
                }
                if (this.dataConverter) {
                    return this.dataConverter(data);
                }
                return data;
            })
        );
    }
}
