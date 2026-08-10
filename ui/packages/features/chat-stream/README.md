# @xihan-ui/chat-stream

SSE 传输与流式消息归约：把服务端推来的增量事件归一成消息的 parts，再维护一份会话 store。不渲染任何元素。

**谁会装它**：要接流式对话的人直接装它。渲染那半用 `@xihan-ui/vue` 的 composer / thread 组件，或者自己写。

## 用法

```ts
import { createChatStore, httpSseTransport } from '@xihan-ui/chat-stream'
```

## 装

```bash
pnpm add @xihan-ui/chat-stream
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `features/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
