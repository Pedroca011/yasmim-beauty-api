import { Request, Response } from "express";
import { productService } from "../services";

class ProductController {
  async createProduct(req: Request, res: Response) {
    const product = req.body;

    const service = await productService.createProduct(product);

    return res.status(201).json({
        msg: "Produto criado com sucesso",
        product: service,
    })
  }
}

export default new ProductController();
