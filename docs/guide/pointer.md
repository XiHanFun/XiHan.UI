# 指针会话

`@xihan-ui/pointer` 负责一件事：一根指针从按下到抬起的那一段，把跟手期间的监听、过滤与收尾收在一处。它是自研实现，零运行时依赖，压缩后 316 B。

## 为什么需要它

跟手这件事看着简单，写对却有四个必须一次都不漏的点：

- **监听要挂在文档上，不能挂在按下的那个元素上。** 挂在元素上，指针一滑出去就断手，滑块拖到一半停住、面板半路掉下来。
- **`pointercancel` 必须收。** 系统随时可能把指针收走（手机上被浏览器判定为页面滚动、笔离开数位板、来电打断）。不收，状态就永远停在「拖动中」，元素从此粘在指针上。
- **多指同按时，第二根手指不该劫持正在进行的那一场。** 不认 `pointerId`，触屏上双指一碰，拖拽目标会瞬移到另一根手指下。
- **拆卸路径必须摘干净监听。** 拖到一半组件被卸掉，监听还挂在文档上，后续每一次指针移动都在往一台已经死掉的状态机里送事件。

四条里漏任何一条，症状都是「偶发、只在真机上出现、复现不了」。会话把这四条一次写对，需要跟手的组件调它就行。

## 用法

```ts
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'

const session = createPointerSession({
  doc: resolveSessionDoc(trackEl),
  onMove: ({ point }) => {
    // point.clientX / point.clientY
  },
  onEnd: ({ reason }) => {
    // reason: 'pointerup' | 'pointercancel'
  },
})

session.dispose() // 摘掉监听，重复调用是安全的
```

日常用不到这一层——需要跟手的组件内部已经接好了。

## 选项

| 选项 | 必填 | 说明 |
| --- | --- | --- |
| `doc` | 是 | 会话跟随的文档。传 `null` 时会话退化成空操作，`dispose` 照常可调 |
| `pointerId` | 否 | 只跟这根指针，别的指针的事件全滤掉。不给则不过滤 |
| `onMove` | 是 | 指针移动。回送坐标、`pointerId`、压感与原始事件 |
| `onEnd` | 是 | 手抬起来或被系统收走。两种情形都只回送一次 |

## 跟哪个文档

`resolveSessionDoc` 的解析顺序是：元素自己的文档 → 全局 `document` → `null`。

按元素解析而不是直接取全局，是因为组件可能渲在 iframe 或另一个文档里，跟错文档的表现就是指针一动就断手。元素还没就位（首帧尚未布局）时退回全局；连全局都没有（无 DOM 的纯逻辑测试）返回 `null`，此时会话什么都不做，状态照常转移，只是没有指针可跟。

## 谁在用

跟手期间的指针监听统一走这一层：`slider` · `splitter` · `scrollbar` · `color-picker` · `image-cropper` · `floating-panel` · `signature-pad`。

在状态机里的接法是把会话挂进拖动态的效应，效应拆卸时 `dispose`——状态一离开拖动态，监听自动摘干净：

```ts
effects: {
  trackPointer: ({ send, refs }) => {
    const session = createPointerSession({
      doc: resolveSessionDoc(refs.get('getTrackEl')()),
      onMove: ({ point }) => send({ type: 'DRAG.MOVE', point }),
      onEnd: () => send({ type: 'DRAG.END' }),
    })
    return () => session.dispose()
  },
},
```

`signature-pad` 多传一个 `pointerId`：起笔那根指针的 id 在效应挂载前就记进了 refs，笔画因此不会被第二根手指接管。

## 会话不管什么

会话只回送坐标，边界划得很死：

- 不碰 DOM，不改样式，不调 `setPointerCapture`
- 不决定拖多远才算数（阈值是调用方的事）
- 不换算业务坐标（轨道百分比、裁剪框、面板位置都由各自的几何模块算）
- 不做手势识别（轻点、长按、双指缩放都不在这一层）

这些留在调用方，是因为同一段跟手在不同组件里意味着完全不同的东西：滑块要的是轨道上的比例，面板要的是相对起点的位移，签名板要的是压感曲线。会话只保证「这根指针现在在这儿」这一件事是对的。
