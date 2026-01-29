import PrismaAdapter from "../config/prisma";
import { ProductByName, ProductCreate, ProductUpdate, Product } from "../interfaces";

class ProductRepository {
  async createProduct(product: ProductCreate): Promise<Product> {
    const created = await PrismaAdapter.service.create({
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
    const found = await PrismaAdapter.service.findFirst({
      where: { name: productName },
    });

    return found;
  }

  async getByProductId(productId: string): Promise<Product | null> {
    const found = await PrismaAdapter.service.findUnique({  // Mudei para findUnique (melhor para id)
      where: { id: productId },
    });

    return found;
  }

  async getAllProduct(): Promise<Product[]> {
    const allProducts = await PrismaAdapter.service.findMany();

    return allProducts;
  }

  async updateProduct(productId: string, product: ProductUpdate): Promise<Product> {
    const updated = await PrismaAdapter.service.update({
      where: { id: productId },
      data: product,
    });

    return updated;
  }

  async deleteProduct(productId: string): Promise<Product> {
    const deleted = await PrismaAdapter.service.delete({
      where: { id: productId },
    });

    return deleted;
  }
}

export default new ProductRepository();