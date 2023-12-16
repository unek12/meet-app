import {
  Body,
  Controller, Get, Param, ParseIntPipe,
  Post, Query, Req, UseGuards,
} from '@nestjs/common';
import {MeetService} from "./meet.service";
import {accessTokenGuard} from "../../guards/accessToken.guard";

@Controller('api/meet')
export class MeetController {
  constructor(
    private meetService: MeetService
  ) {
  }

  @Get('/stats')
  getMeetingsStatistics(@Query('interval') interval = 'month') {
    if (!["month", "day", "week"].includes(interval)) {
      return ''
    }
    return this.meetService.getMeetingsStatistics({
      interval: interval as 'day' | 'week' | 'month'
    })
  }

  // @UseGuards(accessTokenGuard)
  @Get()
  getMeetings(@Query('page') page = 0, @Query('take') take = 10) {
    return this.meetService.getMeetings({
      page,
      take: +take
    });
  }

  // @UseGuards(accessTokenGuard)
  @Get('/user/:userId')
  getMeetingsForUser(
    @Query('page') page = 0,
    @Query('take') take = 10,
    @Param('userId') userId: string = ''
  ) {
    return this.meetService.getMeetingsForUser({page, userId, take: +take})
  }

  @UseGuards(accessTokenGuard)
  @Post()
  createMeeting(@Req() req, @Body() createMeetDto: {
    title: string
  }) {
    return this.meetService.creatMeet(req.user.id, createMeetDto);
  }

  @UseGuards(accessTokenGuard)
  @Get('/:id')
  getMeeting(@Req() req, @Param('id') createMeetDto: string) {
    return this.meetService.getMeeting(req.user.id, createMeetDto);
  }

  @UseGuards(accessTokenGuard)
  @Post('/messages')
  getMessages(@Req() req, @Body() createMeetDto: {
    roomID: string
  }) {
    console.log(createMeetDto)
    return this.meetService.getMessages(req.user.id, createMeetDto.roomID);
  }
}
