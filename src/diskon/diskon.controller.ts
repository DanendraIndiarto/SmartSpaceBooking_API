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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DiskonService } from './diskon.service';
import { CreateDiskonDto } from './dto/create-diskon.dto';
import { UpdateDiskonDto } from './dto/update-diskon.dto';
import { MakerKeyGuard, JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';

@ApiTags('Diskon')
@Controller('diskon')
@UseGuards(MakerKeyGuard)
export class DiskonController {
  constructor(private readonly diskonService: DiskonService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  create(
    @Body() dto: CreateDiskonDto,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.diskonService.create(dto, makerKey);
  }

  @Get()
  findAll(@Headers('x-maker-key') makerKey: string) {
    return this.diskonService.findAll(makerKey);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-maker-key') makerKey: string) {
    return this.diskonService.findOne(+id, makerKey);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDiskonDto,
    @Headers('x-maker-key') makerKey: string,
  ) {
    return this.diskonService.update(+id, dto, makerKey);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_space')
  remove(@Param('id') id: string, @Headers('x-maker-key') makerKey: string) {
    return this.diskonService.remove(+id, makerKey);
  }
}
