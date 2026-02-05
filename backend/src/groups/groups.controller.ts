import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

interface JwtRequest extends Request {
  user: {
    sub: string;
    role: Role;
  };
}

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  list(@Req() req: JwtRequest) {
    return this.groups.list(req.user.sub);
  }

  @Get('free-students')
  free(@Req() req: JwtRequest) {
    return this.groups.studentsWithoutGroup(req.user.sub);
  }

  @Post()
  create(@Req() req: JwtRequest, @Body() body: { name: string }) {
    return this.groups.create(req.user.sub, body.name);
  }

  @Post('add')
  add(
    @Req() req: JwtRequest,
    @Body() body: { groupId: string; userId: string },
  ) {
    return this.groups.addStudent(body.groupId, body.userId, req.user.sub);
  }

  @Post('remove')
  remove(
    @Req() req: JwtRequest,
    @Body() body: { groupId: string; userId: string },
  ) {
    return this.groups.removeStudent(body.groupId, body.userId, req.user.sub);
  }

  @Post('move')
  move(
    @Req() req: JwtRequest,
    @Body()
    body: { fromGroupId: string; toGroupId: string; userId: string },
  ) {
    return this.groups.moveStudent(
      body.fromGroupId,
      body.toGroupId,
      body.userId,
      req.user.sub,
    );
  }
}
