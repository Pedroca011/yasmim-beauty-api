import { ProductCreate } from "../interfaces";
import { productRepository } from "../repositories";
import { HttpError } from "../utils";

class ProductService {
  async createProduct(product: ProductCreate) {
    const verifyProductExist = await productRepository.getByProductName(
      product.name
    );

    if (verifyProductExist)
      throw new HttpError({
        title: "CONFLIT",
        detail: "Name existente",
        code: 409,
      });

    const repository = await productRepository.createProduct(product);

    if (!repository)
      throw new HttpError({
        title: "INTERNAL_SERVER_ERROR",
        detail: "Algo deu errado do lado servidor.",
        code: 500,
      });

      return repository;
  }
}

export default new ProductService();
