import { HttpResponse, http } from "msw";
import { backendUrl } from "../util";

const url = backendUrl + "/products";

export const handlers = [
  http.get(url, () => {
    return HttpResponse.json([
      { id: 1, name: "Product 1", price: 100 },
      { id: 2, name: "Product 2", price: 200 },
    ]);
  }),
];
