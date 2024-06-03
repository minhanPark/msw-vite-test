export async function delay(seconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

export const backendUrl = "http://localhost:3000";
