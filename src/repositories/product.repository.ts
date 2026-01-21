import PrismaAdapter from "../config/prisma";
import { ProductByName, ProductCreate, ProductUpdate } from "../interfaces";

class ProductRepository {
  async createProduct(product: ProductCreate) {
    const create = await PrismaAdapter.service.create({
      data: {
        name: product.name,
        description: product.description,
        duration: product.duration,
        currentPrice: product.currentPrice,
        promotionalPrice: product.promotionalPrice,
        servicePromotional: product.servicePromotional,
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

  async getByProductId(productId: string) {
    const getById = await PrismaAdapter.service.findFirst({
      where: { id: productId },
    });

    return getById;
  }

  async getAllProduct() {
    const getAll = await PrismaAdapter.service.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        currentPrice: true,
        servicePromotional: true,
        promotionalPrice: true,
      }
    })

    return getAll;
  }

  async updateProduct(productId: string, product: ProductUpdate) {
    const update = await PrismaAdapter.service.update({
      where: { id: productId },
      data: product,
    });

    return update;
  }

  async deleteProduct(productId: string) {
    const deleteProduct = await PrismaAdapter.service.delete({
      where: { id: productId },
    });

    return deleteProduct;
  }
}

export default new ProductRepository();
