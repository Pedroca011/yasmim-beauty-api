import { Decimal } from "@prisma/client/runtime/client";

export interface ProductCreate {
  name: string;
  description: string;
  currentPrice: Decimal;
  servicePromotional: boolean;
  promotionalPrice?: Decimal;
  duration: number;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  currentPrice?: Decimal;
  servicePromotional?: boolean;
  promotionalPrice?: Decimal;
  duration?: number;
}

export type ProductByName = ProductCreate["name"];
