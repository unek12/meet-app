import { Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class SharpPipe implements PipeTransform<Express.Multer.File> {
  async transform(image: Express.Multer.File) {
    const originalName = path.parse(image.originalname).name;
    const filename = Date.now() + '-' + originalName + '.' + image.mimetype.split(`/`)[1];

    const res = await sharp(path.join(__dirname, '../..', image.path))
      .resize({
        width: 102,
        height: 102
      })
      .jpeg()
      .toFile(path.join(__dirname, '../../static/images', filename))

    return filename
  }
}