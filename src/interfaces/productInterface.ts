import { Decimal } from "@prisma/client/runtime/client";

export interface ProductCreate {
  name: string;
  description: string;
  currentPrice: Decimal;
  promotionalPrice?: Decimal;
  duration: number;
}

export type ProductByName = ProductCreate["name"];
