import { handlers as userHandlers } from "./users";
import { handlers as productHandlers } from "./products";

export const handlers = [...userHandlers, ...productHandlers];
