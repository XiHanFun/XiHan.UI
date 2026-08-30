# 指针原语

`@xihan-ui/pointer` 收的是指针交互里「写对了才不出事」的那部分公共几何与生命周期。自研实现，零运行时依赖，整包压缩后 2.04 kB，分四层：

| 层 | 收什么 |
| --- | --- |
| 指针会话 | 一根指针从按下到抬起的跟手、过滤与收尾 |
| 多指会话与双指几何 | 同时跟住多根指针，以及两指的间距、中点、连线角度与相对起始那一刻的缩放 / 位移 / 转角 |
| 拖放几何 | 排序落点投影、让位位移、激活阈值、边缘自动滚动 |
| 尺寸调整几何 | 八向边推动，带吸附步进、宽高比、上下限与容器夹取 |

后两层是纯函数：不碰 DOM、不持状态，输入几何、输出几何，因此能在无 DOM 的用例里直接断言。

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

跟手期间的指针监听统一走这一层，14 个组件在用：`slider` · `splitter` · `scrollbar` · `color-picker` · `image-cropper` · `floating-panel` · `signature-pad` · `carousel` · `image-viewer` · `sortable` · `resizable` · `table` · `tabs` · `tree`。

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

## 多指会话与双指几何

`createMultiPointerSession` 同时跟住多根指针：`add()` 记下一根新按下的，`onChange` 在任何一根移动或抬起时回送**当前全部触点**（按落下的先后排），最后一根离开才走 `onEnd`。

```ts
import { createMultiPointerSession, pinchChange, pinchSnapshot } from '@xihan-ui/pointer'

const session = createMultiPointerSession({
  doc: resolveSessionDoc(el),
  onChange: (points) => {
    if (points.length < 2)
      return
    const now = pinchSnapshot(points[0], points[1])
    const { scale, translate, rotate } = pinchChange(start, now)
  },
  onEnd: ({ reason }) => {
    // reason 是 'pointercancel' 时该退回原样，'pointerup' 才是落定
  },
})
```

`pinchSnapshot` 拍下两指此刻的间距、中点与连线角度；`pinchChange` 拿起始快照与当前快照算出**相对起始那一刻**的缩放、位移与转角。相对起始算而不是相对上一帧，是因为逐帧累乘会把浮点误差一路攒起来。触点数一变就该重拍基准：从双指退回单指时不重拍的话，剩下那根手指会带着上一段的缩放基准继续走，画面会跳一下。

`onEnd` 的 `reason` 要分开处理：被系统收走时该退回原样，抬手才是落定提交。会话本身可以反复用——最后一根手指抬起只是这一场结束，不是会话作废，因此可以挂在根级效应上常驻。

`carousel` 与 `image-viewer` 走的是这一层：前者只把第一根手指交进会话（单指划动，已经在划的时候第二根落下不算数），后者用双指缩放，两指整体平移时只动偏移不动缩放。

## 拖放几何

四个纯函数，`sortable` / `table` / `tree` / `tabs` 的重排都建在上面：

| 导出 | 用途 |
| --- | --- |
| `projectSortable()` | 算出此刻的落点下标与每一项该让开多少 |
| `sortableOffsets()` | 只要让位位移那一份 |
| `shouldActivate()` / `DEFAULT_ACTIVATION_DISTANCE` | 这次位移够不够格开始拖（默认 5px） |
| `edgeScrollDelta()` / `DEFAULT_EDGE_THRESHOLD` / `DEFAULT_EDGE_SPEED` | 拖到容器边缘时该滚多少，速度随入侵深度线性上升 |
| `moveItem()` | 「先摘后插」的下标折算 |

两条判据值得单独记：

- **落点按「被拖项的中心越过了谁的中心」判，不按矩形相交。** 项高不齐时相交判据会在边界反复横跳；沿轴扫描一遇到没越过的就停，落点因此连续，不会从第 0 位跳到第 5 位。
- **几何一律取按下那一刻的快照。** 让位之后布局已经变了，拿变形后的几何再算会自激振荡。拖动中版面滚走的那部分漂移由调用方换算回快照坐标。
- **激活阈值用直线距离而不是分轴比较。** 斜着拖 4px + 4px 的实际位移是 5.7px，分轴比较会判成没动。

## 尺寸调整几何

`resizeRect()` 算推动某条边之后的矩形，`clampSize` / `snapSize` / `applyAspectRatio` 是它用到的三条约束，也单独导出。`resizable` 与 `table` 的列宽、`floating-panel` 的改尺寸都走它。

两条硬规则：

- **西边与北边动的是矩形的起点**，所以位置要跟着走；尺寸先过约束，起点再按「实际收了多少」回算——顶到下限之后对边才不会继续漂。
- **约束次序是 吸附 → 宽高比 → 上下限 → 容器，夹取优先于比例。** 顶到容器或上下限时比例会破，因为边界是硬约束而比例是意图；反过来（保比例、越界）会把矩形推到看得见的容器外面。

## 这个包不管什么

- 不碰 DOM，不改样式，不调 `setPointerCapture`
- 不换算业务坐标（轨道百分比、裁剪框、面板位置都由各自的组件算）
- 不做时序类手势识别（轻点、长按、双击都不在这一层）
- 不持有拖动状态：拖没拖、拖的是谁、松手写回哪里，全在组件的状态机里

留在调用方，是因为同一段跟手在不同组件里意味着完全不同的东西：滑块要的是轨道上的比例，面板要的是相对起点的位移，签名板要的是压感曲线。这个包只保证「指针现在在这儿」与「这几个数该怎么算」两件事是对的。
