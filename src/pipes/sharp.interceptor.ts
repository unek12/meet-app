import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';
import sharp from 'sharp';

@Injectable()
export class SharpInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const file = request.file;
    if (file) {
      const sharpStream = sharp(file.path).resize(50, 50); // Создаем поток sharp для обработки файла
      request.file = sharpStream; // Перезаписываем файл в запросе с потоком sharp

      // Применяем sharpPipe к потоку sharp и возвращаем обработанный файл
      return next.handle().pipe(
        map((data) => {
          sharpStream.end(); // Завершаем поток sharp
          return data;
        }),
      );
    }

    return next.handle();
  }
}