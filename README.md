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