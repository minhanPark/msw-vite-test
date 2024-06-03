import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

console.log("handlers", handlers);
export const worker = setupWorker(...handlers);
