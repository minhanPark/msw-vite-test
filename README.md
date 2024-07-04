# MSW 설치 및 테스트

msw는 mock service worker라는 의미로 서비스 워커를 사용하여 API 요청을 가로채서 가짜 응답을 반환하는 라이브러리이다. 이를 통해 API 요청을 테스트할 때 실제 서버를 사용하지 않고도 테스트를 할 수 있음

### 설치하기

```bash
npm install -D msw@latest
```

dev 환경에서만 사용할 것이면 -D 옵션으로 설치하면 된다.

### 환경 설정하기

```bash
#npx msw init <PUBLIC_DIR> [options]
npx msw init ./public --save
```

msw는 워커스크립트를 public 디렉토리에 생성한다. 이때 --save 옵션을 사용하면 package.json에 public 디렉토리의 위치를 추가해주고, 이를 통해 워커 스크립트의 자동 업데이트를 해 줄 수 있다.

```json
// package.json
{
  "msw": {
    "workerDirectory": ["public"]
  }
}
```

package.json에 msw 설정이 위와 같이 추가된 것을 확인할 수 있다.

> msw를 설치할 때 워커 스크립트가 현재 설치된 라이브러리 버전과 동기화도 됨

해당 명령어를 입력한 뒤에는 도메인/mockServiceWorker.js로 이동해서 워커 스크립트 콘텐츠가 표시되는 지 확인해야 한다. 만약 표시되지 않는다면(404, MIME 타입 오류 등) 워커 스크립트가 제대로 생성되지 않은 것이다.

**src 폴더 밑에 mocks 폴더**를 만들자.

```ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
```

**setupWorker**는 클라이언트(브라우저)에서 API 모킹이 가능하도록 해주는 함수
**handlers**는 사용할 핸들러들을 배열로 구성한 것이다.

```ts
import { handlers as userHandlers } from "./users";
import { handlers as productHandlers } from "./products";

export const handlers = [...userHandlers, ...productHandlers];
```

단일 핸들러로 구성할 수도 있지만 위와 같이 핸들러들을 분리해서 스프레드 연산자로 넣어주면 대규모 핸들러들을 url로 구분해서 관리할 수 있다.

각각의 핸들러들은 아래처럼 생겼다.

```ts
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
```

- 공통으로 사용할 기능들은 util 등을 만들어 사용하면 좋다.(좀 더 여러가지를 활용하기 위해 delay 함수와 backendUrl을 util에 넣고 사용함)

```ts
http.patch(url + "/:id", async ({ params, request, cookies }) => {
    const submittedData = (await request.json()) as unknown;
    const { id } = params;
    console.log(submittedData, id);
    console.log(cookies.token) // cookie에 token이라는 key를 가진 값이 있다면 출력
    return HttpResponse.json({ content: true });
  }),
```

handler에서 **body**로 온 부분은 **await request.json()** 으로 변환해서 사용할 수 있다.  
**params**로 온 부분은 **매개변수로 params**를 받아서 그 안에서 꺼내서 사용할 수 있다.
**cookie**는 **매개변수로 cookies**를 받아서 접근할 수 있다.

> params를 사용할 떄 조심할 점은 배열을 위에서 부터 파악해서 매치가 되면 뒤에껀 실행시키지 않는 것 같다는 점이다.  
> /clients/:id와 /clients/name이 있을 때 /clients/name으로 요청을 보내더라도 /clients/:id가 배열에 앞에 정의되어 있다면  
> 먼저 매치가 되기 때문에 /clients/:id가 실행된다. **즉 params는 같은 url 레벨에서는 뒤에 정의**하자.

### 연결하기

```ts
async function enableMocking() {
  if (process.env.NODE_ENV === "production") {
    return;
  }
  const { worker } = await import("./mocks/browser.ts");
  return worker.start({
    // 해당 부분은 브라우저에서 정적파일에 대한 요청이 왔을 때 어떻게 처리할 지에 대한 부분
    // 테스트를 통과하면(정적파일 일 경우) 리턴을 통해서 종료시키고, 테스트를 통과하지 않으면 warning을 해준다.
    onUnhandledRequest(req, print) {
      if (/\.(png|jpg|svg|tsx?|css|jsx?|woff2|ttf|otf)$/.test(req.url)) {
        return;
      }
      print.warning();
    },
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
```

위와 같이 비동기 enableMocking 함수를 만들어준다. 안에서는 환경에 따라 msw를 실행할 지 하지 않을 지를 구분해서 리턴해주고, msw를 실행할 때는 worker.start()를 호출해준다.
해당 함수를 비동기로 만들어준 이유는 워커는 비동기 함수이고 밑에 createRoot와 경쟁상태를 막기 위함이다.

> 위와 같이 하고 브라우저에서 콘솔을 확인해보면 msw가 동작하는 것을 확인할 수 있다.  
> onUnhandledRequest을 처리해주지 않으면 콘솔에 워닝이 많이 뜬다. 폰트 등의 정적파일 및 크롬 익스텐션 떄문에.
