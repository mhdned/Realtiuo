import { Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { HomeService } from './home.service';
import { ResponseHomeDTO } from 'src/dtos/home.dto';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHomes(
    @Query('city') city: string,
    @Query('minPrice') minPrice: string,
    @Query('maxPrice') maxPrice: string,
    @Query('propertyType') propertyType: string,
  ): Promise<ResponseHomeDTO[]> {
    return this.homeService.getHomes();
  }

  @Get(':id')
  getHome() {
    return {};
  }

  @Post()
  createHome() {
    return {};
  }

  @Put()
  updateHome() {
    return {};
  }

  @Delete()
  deleteHome() {}
}
