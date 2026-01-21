import { ProductCreate, ProductUpdate } from "../interfaces";
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

  async getAllProduct() {
    const repository = await productRepository.getAllProduct();

    if (!repository)
      throw new HttpError({
        title: "INTERNAL_SERVER_ERROR",
        detail: "Algo deu errado do lado servidor.",
        code: 500,
      });

    return repository;
  }

  async updateProduct(productId: string, product: ProductUpdate) {
    const verifyProductExist = await productRepository.getByProductId(productId);

    if (!verifyProductExist)
      throw new HttpError({
        title: "NOT_FOUND",
        detail: "Produto não encontrado.",
        code: 404,
      });

    const updateProduct = await productRepository.updateProduct(productId, product);

    if (!updateProduct)
      throw new HttpError({
        title: "BAD_REQUEST",
        detail: "Erro ao atualizar produto.",
        code: 400,
      });

    return updateProduct;
  }

  async deleteProduct(productId: string) {
    console.log(productId, '[PRODUCTID ]')
    const verifyProductExist = await productRepository.getByProductId(productId);

    if (!verifyProductExist)
      throw new HttpError({
        title: "NOT_FOUND",
        detail: "Produto não encontrado.",
        code: 404,
      });

    const deleteProduct = await productRepository.deleteProduct(productId);

    if (!deleteProduct) throw new HttpError({
          title: "BAD_REQUEST",
          detail: "Erro ao deletar produto.",
          code: 400,
        });

      return deleteProduct;
  }
}

export default new ProductService();
