import { ProductCreate, ProductUpdate, BotFormattedProducts, Product } from "../interfaces";
import { productRepository } from "../repositories";  // Import default
import { HttpError } from "../utils";

class ProductService {
  async createProduct(product: ProductCreate): Promise<Product> {
    const verifyProductExist = await productRepository.getByProductName(product.name);

    if (verifyProductExist) {
      throw new HttpError({
        title: "CONFLICT",  
        detail: "Nome existente",
        code: 409,
      });
    }

    const created = await productRepository.createProduct(product);

    if (!created) {
      throw new HttpError({
        title: "INTERNAL_SERVER_ERROR",
        detail: "Algo deu errado no servidor.",
        code: 500,
      });
    }

    return created;
  }

  async getAllProduct(): Promise<Product[]> {
    const products = await productRepository.getAllProduct();

    if (!products || products.length === 0) {
      throw new HttpError({
        title: "NOT_FOUND",
        detail: "Nenhum produto encontrado.",
        code: 404,
      });
    }

    return products;
  }

  async getAllForBot(): Promise<BotFormattedProducts> {
    const products = await this.getAllProduct();
    let formattedString = 'Lista de serviços disponíveis:\n\n';

    products.forEach((p, index) => {
      const price = p.servicePromotional && p.promotionalPrice
        ? `R$${p.promotionalPrice} (Promoção de R$${p.currentPrice})`
        : `R$${p.currentPrice}`;
      formattedString += `${index + 1}. ${p.name} - ${p.description}\nDuração: ${p.duration} min - Preço: ${price}\n\n`;
    });

    if (formattedString === 'Lista de serviços disponíveis:\n\n') {
      formattedString += 'Nenhum serviço disponível no momento.';
    }

    return { formattedString };
  }

  async updateProduct(productId: string, product: ProductUpdate): Promise<Product> {
    const verifyProductExist = await productRepository.getByProductId(productId);

    if (!verifyProductExist) {
      throw new HttpError({
        title: "NOT_FOUND",
        detail: "Produto não encontrado.",
        code: 404,
      });
    }

    const updated = await productRepository.updateProduct(productId, product);

    if (!updated) {
      throw new HttpError({
        title: "BAD_REQUEST",
        detail: "Erro ao atualizar produto.",
        code: 400,
      });
    }

    return updated;
  }

  async deleteProduct(productId: string): Promise<Product> {
    const verifyProductExist = await productRepository.getByProductId(productId);

    if (!verifyProductExist) {
      throw new HttpError({
        title: "NOT_FOUND",
        detail: "Produto não encontrado.",
        code: 404,
      });
    }

    const deleted = await productRepository.deleteProduct(productId);

    if (!deleted) {
      throw new HttpError({
        title: "BAD_REQUEST",
        detail: "Erro ao deletar produto.",
        code: 400,
      });
    }

    return deleted;
  }
}

export default new ProductService();