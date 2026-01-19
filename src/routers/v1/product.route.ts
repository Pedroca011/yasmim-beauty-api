import { Router } from "express";
import { authorize } from "../../middlewares/authorized";
import { ProductController } from "../../controllers";
import { IRoleName } from "../../utils/enums";
import { validate } from "../../middlewares";
import { productSchema } from "../../validations";

const _router: Router = Router({
  mergeParams: true,
});

_router.post("/",
  authorize([IRoleName.ADMIN]),
  validate(productSchema),
  ProductController.createProduct
);

_router.get("/",
  authorize([IRoleName.USER, IRoleName.PROFESSIONAL, IRoleName.ADMIN]),
  ProductController.getAllProduct
);

_router.patch("/:productId", 
  authorize([IRoleName.ADMIN]), 
  ProductController.updateProduct
);

_router.delete("/:productId", 
  authorize([IRoleName.ADMIN]), 
  ProductController.deleteProduct
);

export const router = _router;