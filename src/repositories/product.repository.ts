import PrismaAdapter from "../config/prisma";
import { ProductByName, ProductCreate } from "../interfaces";

class ProductRepository {
  async createProduct(product: ProductCreate) {
    const create = await PrismaAdapter.service.create({
      data: {
        name: product.name,
        description: product.description,
        duration: product.duration,
        currentPrice: product.currentPrice,
        promotionalPrice: product.promotionalPrice,
      },
    });

    return create;
  }

  async getByProductName(productName: ProductByName) {
    const getByName = await PrismaAdapter.service.findFirst({
      where: { name: productName },
    });

    return getByName;
  }
}

export default new ProductRepository();
