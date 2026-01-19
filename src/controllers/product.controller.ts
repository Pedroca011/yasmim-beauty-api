import { Request, Response } from "express";
import { productService } from "../services";
import { ProductCreate, ProductUpdate } from "../interfaces";
import { HttpError } from "../utils";

class ProductController {
  async createProduct(req: Request, res: Response) {
    const product: ProductCreate = req.body;

    const service = await productService.createProduct(product);

    return res.status(201).json({
      msg: "Produto criado com sucesso",
      product: service,
    })
  }

  async getAllProduct(res: Response) {
    const service = await productService.getAllProduct();

    return res.status(200).json({
      msg: "Todos os produtos listados",
      product: service,
    })
  }

  async updateProduct(req: Request, res: Response) {
    const product: ProductUpdate = req.body;
    const productId: string = req.params.id;


    if (!product) throw new HttpError({
      title: "BAD_REQUEST",
      detail: "Erro ao enviar produto.",
      code: 400
    })
    const service = await productService.updateProduct(productId, product);

    return res.status(200).json({
      msg: "Atualizado com sucesso",
      product: service,
    });
  }

  async deleteProduct(req: Request, res: Response) {
    const productId = req.params.id;

    const service = await productService.deleteProduct(productId);

    return res.status(200).json({
      msg: "Deletado com sucesso",
      product: service,
    });
  }
}

export default new ProductController();
