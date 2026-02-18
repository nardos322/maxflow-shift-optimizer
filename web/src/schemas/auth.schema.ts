import { z } from "zod";
import { loginBodySchema } from "@maxflow/shared";

export const loginSchema = loginBodySchema;

export type LoginSchemaType = z.infer<typeof loginSchema>;
