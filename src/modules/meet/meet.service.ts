import {Injectable} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {PrismaService} from "../prisma/prisma.service";
import * as moment from "moment";

@Injectable()
export class MeetService {
  constructor(
    private readonly usersService: UsersService,
    private prisma: PrismaService
  ) {
  }

  async getMeetingsStatistics(options: {
    interval: 'day' | 'week' | 'month';
  }) {
    const currentDate = moment();
    const {startDate, endDate} = this.getDateRange(options.interval, currentDate);
    const counts = {};

    let currentDateIter = moment(startDate);
    while (currentDateIter <= endDate) {
      const count = await this.getCountForInterval(options.interval, currentDateIter.toDate());
      const formattedDate = currentDateIter.format('YYYY-MM-DD');
      counts[formattedDate] = count || 0;

      currentDateIter = this.getNextIntervalDate(options.interval, currentDateIter);
    }

    return counts;
  }

  private getDateRange(interval: 'day' | 'week' | 'month', currentDate: moment.Moment) {
    let startDate: moment.Moment;
    let endDate: moment.Moment;

    if (interval === 'day') {
      startDate = currentDate.startOf('day');
      endDate = currentDate.startOf('day');
    } else if (interval === 'week') {
      startDate = currentDate.clone().add(-1, 'week');
      endDate = currentDate.clone();
    } else if (interval === 'month') {
      startDate = currentDate.clone().add(-1, 'month');
      endDate = currentDate.clone();
    }

    return {startDate, endDate};
  }

  private async getCountForInterval(interval: 'day' | 'week' | 'month', date: Date) {
    const count = await this.prisma.meeting.count({
      where: this.getWhereClauseForInterval(interval, date),
    });

    return count;
  }

  private getWhereClauseForInterval(interval: 'day' | 'week' | 'month', date: Date) {
    if (interval === 'day') {
      return {
        date: {
          gte: moment(date).startOf('day').toDate(),
          lt: moment(date).endOf('day').toDate(),
        },
      };
    } else if (interval === 'week') {
      return {
        date: {
          gte: moment(date).add(-1, 'day').toDate(),
          lt: moment(date).toDate(),
        },
      };
    } else if (interval === 'month') {
      return {
        date: {
          gte: moment(date).add(-1, 'day').toDate(),
          lt: moment(date).toDate(),
        },
      };
    }
  }

  private getNextIntervalDate(interval: 'day' | 'week' | 'month', date: moment.Moment) {
    if (interval === 'day') {
      return date.clone().add(1, 'day');
    } else if (interval === 'week') {
      return date.clone().add(1, 'day');
    } else if (interval === 'month') {
      return date.clone().add(1, 'day');
    }
  }

  async getMeetings({page, take = 10}: {
    page: number
    take: number
  }) {
    return {
      data: await this.prisma.meeting.findMany({
        skip: page * take,
        take,
        include: {
          organizer: true
        }
      }),
      pages: Math.ceil(await this.prisma.meeting.count() / take) - 1,
      currentPage: page
    }
  }

  async getMeetingsForUser({page, take = 10, userId = ''}: {
    page: number
    take: number
    userId: string
  }) {
    const data = (await Promise.all([
      // this.prisma.meeting.findMany({
      //   skip: page * take,
      //   take,
      //   where: {
      //     organizer: {
      //       id: userId
      //     }
      //   },
      //   include: {
      //     organizer: true
      //   }
      // }),
    ])).flat(1)
      // .sort((a, b) => a.createdAt.getMilliseconds() + b.createdAt.getMilliseconds())
    return {
      data: await this.prisma.meeting.findMany({
        skip: page * take,
        take,
        where: {
          participants: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          organizer: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      pages: Math.ceil((await this.prisma.meeting.count({
        where: {
          participants: {
            some: {
              userId: userId
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })) / take) - 1,
      currentPage: page
    }
  }

  async creatMeet(userId: string, {title}: { title: string }) {
    const user = await this.usersService.findById(userId)
    return this.prisma.meeting.create({
      data: {
        title: title,
        organizer: {
          connect: {id: user.id}
        },
      },
      include: {
        organizer: true,
        participants: true
      }
    })
  }

  async joinMeet({roomID, socketId, userId, options}:
                   {
                     roomID: string,
                     userId: string,
                     socketId: string,
                     options: {
                       isVideoOn: boolean,
                       isMicrophoneOn: boolean,
                     }
                   }
  ) {
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        id: roomID,
      },
      include: {
        participants: {
          where: {
            isPresent: true
          }
        }
      }
    })

    if (meeting.participants.length > 9) {
      return false
    }

    return this.prisma.meeting.update(
      {
        data: {
          participants: {
            create: {
              isPresent: true,
              isVideoOn: options.isVideoOn,
              isMicrophoneOn: options.isMicrophoneOn,
              socketId: socketId,
              userId: userId
              // where: {
              //   userId: userId,
              //   socketId: socketId,
              //   isPresent: true
              // }
            }
          }
        },
        where: {id: roomID},
        include: {
          organizer: true, participants: {
            include: {user: true}
          }
        }
      }
    )
  }

  getMeeting(userId: string, meetingId: string) {
    return this.prisma.meeting.findFirst({where: {id: meetingId}})
  }

  toggleOptions({roomID, socketId, userId, options}: {
    roomID: string,
    socketId: string,
    userId: string,
    options: {
      isVideoOn: boolean,
      isMicrophoneOn: boolean,
    }
  }) {
    return this.prisma.meeting.update(
      {
        data: {
          participants: {
            updateMany: {
              data: {
                isVideoOn: options.isVideoOn,
                isMicrophoneOn: options.isMicrophoneOn,
              },
              where: {
                userId: userId,
                socketId: socketId,
                isPresent: true
              }
            }
          }
        },
        where: {id: roomID},
        include: {organizer: true, participants: true}
      }
    )
  }

  leaveMeet({roomID, socketId, userId}: {
    roomID: string,
    socketId: string,
    userId: string
  }) {
    return this.prisma.meeting.update(
      {
        data: {
          participants: {
            updateMany: {
              data: {
                isPresent: false,
                isVideoOn: false,
                isMicrophoneOn: false,
              },
              where: {
                userId: userId,
                socketId: socketId,
                isPresent: true
              }
            }
          }
        },
        where: {id: roomID},
        include: {organizer: true, participants: true}
      }
    )
  }

  getMessages(userId: string, roomID: string) {
    return this.prisma.meeting.findFirst({
      where: {
        id: roomID
      },
      include: {
        messages: {
          include: {
            sender: true
          }
        }
      }
    })
  }

  saveMessage({roomID, message, userId}: {
    roomID: string,
    userId: string,
    message: string
  }) {
    return this.prisma.message.create({
      data: {
        meetingId: roomID,
        content: message,
        senderId: userId
      },
      include: {
        sender: true
      }
    })
  }
}
