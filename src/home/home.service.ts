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

interface CreateHomeParam {
  city: string;
  price: number;
  address: string;
  landSize: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  propertyType: PropertyType;
  images: { url: string }[];
}

interface UpdateHomeParam {
  city?: string;
  price?: number;
  address?: string;
  landSize?: number;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  propertyType?: PropertyType;
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

  async createHome({
    address,
    city,
    price,
    landSize,
    images,
    numberOfBathrooms,
    numberOfBedrooms,
    propertyType,
  }: CreateHomeParam) {
    const newHome = await this.prismaService.home.create({
      data: {
        address,
        city,
        price,
        land_size: landSize,
        number_of_bathrooms: numberOfBathrooms,
        number_of_bedrooms: numberOfBedrooms,
        propertyType: propertyType,
        realtor_id: 10,
      },
    });

    const homeImages = images.map((image) => {
      return { ...image, home_id: newHome.id };
    });

    await this.prismaService.image.createMany({ data: homeImages });

    return new ResponseHomeDTO({ ...newHome, images });
  }

  async updateHomeByID(id: number, data: UpdateHomeParam) {
    const home = await this.getHomeByID(id);
    const updatedHome = await this.prismaService.home.update({
      where: {
        id: home.id,
      },
      data,
    });

    return new ResponseHomeDTO(updatedHome);
  }

  async deleteHomeByID(id: number) {
    const home = await this.getHomeByID(id);
    if (!home) throw new NotFoundException();
    await this.prismaService.image.deleteMany({
      where: {
        home_id: home.id,
      },
    });

    await this.prismaService.home.delete({
      where: {
        id: home.id,
      },
    });
  }
}
