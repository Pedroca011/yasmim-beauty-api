import { Request, Response } from "express";
import { productService } from "../services";
import { ProductCreate, ProductUpdate } from "../interfaces";

class ProductController {
  async createProduct(req: Request, res: Response) {
    try {
      const product: ProductCreate = req.body;
      const created = await productService.createProduct(product);
      return res.status(201).json({
        msg: "Produto criado com sucesso",
        product: created,
      });
    } catch (error: any) {
      return res.status(error.code || 500).json({ detail: error.detail || error.message });
    }
  }

  async getAllProduct(req: Request, res: Response) {
    try {
      const products = await productService.getAllProduct();
      return res.status(200).json({
        msg: "Todos os produtos listados",
        products, 
      });
    } catch (error: any) {
      return res.status(error.code || 500).json({ detail: error.detail || error.message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const product: ProductUpdate = req.body;
      const { productId } = req.params;

      if (!productId) {
        throw new Error("productId é obrigatório"); 
      }

      const updated = await productService.updateProduct(productId, product);
      return res.status(200).json({
        msg: "Atualizado com sucesso",
        product: updated,
      });
    } catch (error: any) {
      return res.status(error.code || 500).json({ detail: error.detail || error.message });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      if (!productId) {
        throw new Error("productId é obrigatório");
      }

      const deleted = await productService.deleteProduct(productId);
      return res.status(200).json({
        msg: "Deletado com sucesso",
        product: deleted,
      });
    } catch (error: any) {
      return res.status(error.code || 500).json({ detail: error.detail || error.message });
    }
  }

  // Novo: Rota para getAllForBot (útil para testes ou chamada via API no bot)
  async getAllForBot(req: Request, res: Response) {
    try {
      const formatted = await productService.getAllForBot();
      return res.status(200).json({
        msg: "Produtos formatados para bot",
        formatted,
      });
    } catch (error: any) {
      return res.status(error.code || 500).json({ detail: error.detail || error.message });
    }
  }
}

export default new ProductController();