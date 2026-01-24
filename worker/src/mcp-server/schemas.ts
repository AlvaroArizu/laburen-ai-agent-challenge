import { z } from "zod";

export const listProductsSchema = z.object({
  conversation_id: z.string().min(1).optional(),

  q: z.string().optional(),

  disponible: z.enum(["si", "no", "all"]).optional(),
  in_stock: z.enum(["si", "no", "all"]).optional(),

  talla: z.string().optional(),
  talle: z.string().optional(),

  categoria: z.string().optional(),
  estilo: z.string().optional(),

  tipo_prenda: z.string().optional(),
  prenda: z.string().optional(),

  color: z.string().optional(),

  match: z.enum(["exact", "contains"]).optional(),

  limit: z.coerce
    .number()
    .refine(Number.isFinite, "limit inválido")
    .int()
    .min(1)
    .max(500)
    .optional(),

  offset: z.coerce
    .number()
    .refine(Number.isFinite, "offset inválido")
    .int()
    .min(0)
    .max(50000)
    .optional(),

  sort: z.enum(["id", "price", "stock"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const listFacetsSchema = z.object({
  disponible: z.enum(["si", "no", "all"]).optional(),
  in_stock: z.enum(["si", "no", "all"]).optional(),
  q: z.string().optional(),
  limit: z.coerce
    .number()
    .refine(Number.isFinite, "limit inválido")
    .int()
    .min(1)
    .max(200)
    .optional(),
});

export const getProductDetailsSchema = z.object({
  id: z.coerce.number().refine(Number.isFinite, "id inválido").int().positive(),
  qty: z.coerce.number().refine(Number.isFinite, "qty inválido").int().positive().optional(),
});

export const quotePriceSchema = z.object({
  product_id: z.coerce.number().refine(Number.isFinite, "product_id inválido").int().positive(),
  qty: z.coerce.number().refine(Number.isFinite, "qty inválido").int().positive(),
});

export const getProductsByIdsSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(1).max(200),
});

export const createCartSchema = z.object({
  conversation_id: z.string().min(1),
});

export const updateCartSchema = z.object({
  conversation_id: z.string().min(1),
  action: z.enum(["add", "set", "remove", "clear"]),

  product_id: z.coerce
    .number()
    .refine(Number.isFinite, "product_id inválido")
    .int()
    .positive()
    .optional(),

  qty: z.coerce.number().refine(Number.isFinite, "qty inválido").int().min(0).optional(),

  items: z
    .array(
      z.object({
        product_id: z.coerce.number().refine(Number.isFinite, "product_id inválido").int().positive(),
        qty: z.coerce.number().refine(Number.isFinite, "qty inválido").int().min(0),
      })
    )
    .max(100)
    .optional(),
});

export const getCartSchema = z.object({
  conversation_id: z.string().min(1),
});

export const validateCartSchema = z.object({
  conversation_id: z.string().min(1),
});
