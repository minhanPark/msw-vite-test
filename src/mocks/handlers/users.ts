import { HttpResponse, http } from "msw";
import { backendUrl } from "../util";

const url = backendUrl + "/users";

export const handlers = [
  http.get(url, () => {
    console.log("mocked position");
    return HttpResponse.json([
      { id: 1, name: "John Doe" },
      { id: 2, name: "mh" },
    ]);
  }),
];
