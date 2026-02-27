import PrismaAdapter from "../config/prisma";
import { ProductByName, ProductCreate, ProductUpdate, Product } from "../interfaces";

class ProductRepository {
  private prisma = PrismaAdapter
  async createProduct(product: ProductCreate): Promise<Product> {
    const created = await this.prisma.service.create({
      data: {
        name: product.name,
        description: product.description,
        duration: product.duration,
        currentPrice: product.currentPrice,
        promotionalPrice: product.promotionalPrice,
        servicePromotional: product.servicePromotional,
      },
    });

    return created;
  }

  async getByProductName(productName: ProductByName): Promise<Product | null> {
    const found = await this.prisma.service.findFirst({
      where: { name: productName },
    });

    return found;
  }

  async getByProductId(productId: string): Promise<Product | null> {
    const found = await this.prisma.service.findUnique({  
      where: { id: productId },
    });

    return found;
  }

  async getAllProduct(): Promise<Product[]> {
    const allProducts = await this.prisma.service.findMany();

    return allProducts;
  }

  async updateProduct(productId: string, product: ProductUpdate): Promise<Product> {
    const updated = await this.prisma.service.update({
      where: { id: productId },
      data: {
        name: product.name,
        description: product.description,
        duration: product.duration,
        currentPrice: product.currentPrice,
        promotionalPrice: product.promotionalPrice,
        servicePromotional: product.servicePromotional,
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        currentPrice: true,
        promotionalPrice: true,
        servicePromotional: true,
      },
    });

    return updated;
  }

  async deleteProduct(productId: string): Promise<Product> {
    const deleted = await this.prisma.service.delete({
      where: { id: productId },
    });

    return deleted;
  }
}

export default new ProductRepository();