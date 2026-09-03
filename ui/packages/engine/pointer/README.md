# @xihan-ui/pointer

指针交互原语：一根指针从按下到抬起的跟手会话、多指跟踪与双指几何、拖放落点投影与边缘自动滚动、尺寸调整的八向边推动。会话挂在文档上、认 `pointerId`、收 `pointercancel`、拆卸时摘干净监听；拖放与尺寸两层是纯函数，输入几何、输出几何，不碰 DOM。自研实现，零运行时依赖，import 无副作用，SSR 安全。

**谁会装它**：一般不用直接装——需要跟手的组件内部已经接好了。自己写拖拽、缩放或手势交互时才会直接引。

## 用法

```ts
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'

const session = createPointerSession({
  doc: resolveSessionDoc(trackEl),
  pointerId: event.pointerId,
  onMove: ({ point }) => {
    // point.clientX / point.clientY
  },
  onEnd: ({ reason }) => {
    // reason: 'pointerup' | 'pointercancel'
  },
})

session.dispose() // 摘掉监听，重复调用是安全的
```

`resolveSessionDoc` 的解析顺序是元素自己的文档 → 全局 `document` → `null`。按元素解析而不是直接取全局，是因为组件可能渲在 iframe 或另一个文档里；无 DOM 时返回 `null`，会话退化成空操作，`dispose` 照常可调。

## 装

```bash
pnpm add @xihan-ui/pointer
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `engine/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
