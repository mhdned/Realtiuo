import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { ResponseHomeDTO } from 'src/dtos/home.dto';
import { PrismaService } from 'src/prisma/prisma.service';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filters: GetHomesParam): Promise<ResponseHomeDTO[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        land_size: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filters,
    });

    if (!homes.length) throw new NotFoundException();

    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0]?.url };
      delete fetchHome.images;
      return new ResponseHomeDTO(fetchHome);
    });
  }

  async getHomeByID(id: number): Promise<ResponseHomeDTO> {
    const home = await this.prismaService.home.findUnique({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bedrooms: true,
        number_of_bathrooms: true,
        land_size: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
        realtor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      where: {
        id,
      },
    });

    if (!home) throw new NotFoundException();

    return new ResponseHomeDTO(home);
  }
}
