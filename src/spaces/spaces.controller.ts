import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { MakerKeyGuard, JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles, CurrentUser } from '../common/decorators';
import { AuthUser } from '../common/interfaces/auth-user.interface';

@ApiTags('Spaces')
@Controller('spaces')
@UseGuards(MakerKeyGuard)
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  create(
    @Body() dto: CreateSpaceDto,
    @Headers('x-maker-key') makerKey: string,
    @CurrentUser() user: AuthUser,
  ) {
    const ownerId = user?.ownerId;
    if (!ownerId) {
      throw new UnauthorizedException('Profil Space Owner tidak ditemukan');
    }
    return this.spacesService.create(dto, ownerId, makerKey);
  }

  @Get()
  findAll(@Headers('x-maker-key') makerKey: string) {
    return this.spacesService.findAll(makerKey);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-maker-key') makerKey: string) {
    return this.spacesService.findOne(+id, makerKey);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSpaceDto,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.spacesService.update(+id, dto, makerKey);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  remove(@Param('id') id: string, @Headers('x-maker-key') makerKey: string) {
    return this.spacesService.remove(+id, makerKey);
  }
}
