import {Controller, HttpStatus, ParseFilePipeBuilder, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from "multer";
import {SharpPipe} from "./pipes/sharp.pipe";
import {SharpInterceptor} from "./pipes/sharp.interceptor";

@Controller('api')
export class AppController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'
  ))
  uploadFile(@UploadedFile(SharpPipe) file: Express.Multer.File) {
    console.log(file)
    return {
      path: file
    };
  }
}
