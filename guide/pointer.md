来源：https://ui.docs.xihanfun.com/guide/pointer

# 指针原语

`@xihan-ui/pointer` 收纳指针交互中容易出错的公共几何与生命周期。自研实现，零运行时依赖，整包压缩后 2.04 kB，分四层：

| 层 | 内容 |
| --- | --- |
| 指针会话 | 一根指针从按下到抬起的跟手、过滤与收尾 |
| 多指会话与双指几何 | 同时跟住多根指针，以及两指的间距、中点、连线角度与相对起始那一刻的缩放 / 位移 / 转角 |
| 拖放几何 | 排序落点投影、让位位移、激活阈值、边缘自动滚动 |
| 尺寸调整几何 | 八向边推动，带吸附步进、宽高比、上下限与容器夹取 |

后两层是纯函数：不涉及 DOM、不持有状态，输入几何、输出几何，因此可以在无 DOM 的用例中直接断言。

## 存在的原因

跟手交互看似简单，正确实现需要同时满足四点：

- 监听挂在文档上，而不是按下的元素上。挂在元素上时，指针一旦滑出即中断，滑块拖到一半停住、面板中途脱落。
- 必须处理 `pointercancel`。系统随时可能收回指针（移动端被浏览器判定为页面滚动、笔离开数位板、来电打断）。不处理时状态永远停在拖动中，元素持续跟随指针。
- 多指同时按下时，第二根手指不应劫持正在进行的会话。不识别 `pointerId` 时，触屏上双指触碰会使拖拽目标瞬移到另一根手指下。
- 拆卸路径必须完整移除监听。拖动中组件被卸载而监听仍挂在文档上时，后续每次指针移动都在向已销毁的状态机发送事件。

四条中遗漏任何一条，症状都是偶发、只在真机上出现、难以复现。会话一次性正确实现这四条，需要跟手的组件直接调用。

## 用法

```ts
import { createPointerSession, resolveSessionDoc } from "@xihan-ui/pointer";

const session = createPointerSession({
  doc: resolveSessionDoc(trackEl),
  onMove: ({ point }) => {
    // point.clientX / point.clientY
  },
  onEnd: ({ reason }) => {
    // reason: 'pointerup' | 'pointercancel'
  },
});

session.dispose(); // 移除监听，重复调用是安全的
```

日常使用不涉及这一层：需要跟手的组件内部已经接入。

## 选项

| 选项 | 必填 | 说明 |
| --- | --- | --- |
| `doc` | 是 | 会话跟随的文档。传 `null` 时会话退化为空操作，`dispose` 照常可调用 |
| `pointerId` | 否 | 只跟随该指针，其他指针的事件全部过滤。不传则不过滤 |
| `onMove` | 是 | 指针移动。回送坐标、`pointerId`、压感与原始事件 |
| `onEnd` | 是 | 指针抬起或被系统收回。两种情形都只回送一次 |

## 跟随的文档

`resolveSessionDoc` 的解析顺序：元素自身的文档 → 全局 `document` → `null`。

按元素解析而不是直接取全局，是因为组件可能渲染在 iframe 或另一个文档中，跟错文档的表现是指针一移动即中断。元素尚未就位（首帧尚未布局）时退回全局；没有全局（无 DOM 的纯逻辑测试）时返回 `null`，此时会话不做任何事，状态照常转移，只是没有指针可跟随。

## 使用的组件

跟手期间的指针监听统一经过这一层，15 个组件在用：`slider` · `splitter` · `scrollbar` · `color-picker` · `image-cropper` · `floating-panel` · `signature-pad` · `carousel` · `calendar` · `image-viewer` · `sortable` · `resizable` · `table` · `tabs` · `tree`。

在状态机中的接法是把会话挂进拖动态的效应，效应拆卸时 `dispose`：状态一离开拖动态，监听自动移除：

<!-- eslint-skip -->

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

`signature-pad` 多传一个 `pointerId`：起笔指针的 id 在效应挂载前已记入 refs，笔画因此不会被第二根手指接管。

## 多指会话与双指几何

`createMultiPointerSession` 同时跟随多根指针：`add()` 记录新按下的指针，`onChange` 在任何一根移动或抬起时回送当前全部触点（按落下先后排序），最后一根离开才触发 `onEnd`。

```ts
import { createMultiPointerSession, pinchChange, pinchSnapshot } from "@xihan-ui/pointer";

const session = createMultiPointerSession({
  doc: resolveSessionDoc(el),
  onChange: (points) => {
    if (points.length < 2)
      return;
    const now = pinchSnapshot(points[0], points[1]);
    const { scale, translate, rotate } = pinchChange(start, now);
  },
  onEnd: ({ reason }) => {
    // reason 为 'pointercancel' 时应恢复原状，'pointerup' 才是落定
  },
});
```

`pinchSnapshot` 记录两指此刻的间距、中点与连线角度；`pinchChange` 由起始快照与当前快照算出相对起始时刻的缩放、位移与转角。相对起始计算而不是相对上一帧，是因为逐帧累乘会累积浮点误差。触点数变化时应重新记录基准：从双指退回单指时不重新记录，剩余手指会沿用上一段的缩放基准继续，画面会跳动。

`onEnd` 的 `reason` 需分开处理：被系统收回时应恢复原状，抬起才是落定提交。会话本身可以重复使用：最后一根手指抬起只是本场结束，不是会话作废，因此可以挂在根级效应上常驻。

`carousel` 与 `image-viewer` 使用这一层：前者只把第一根手指交给会话（单指划动，划动中第二根落下不计入），后者用双指缩放，两指整体平移时只改偏移不改缩放。

## 拖放几何

四个纯函数，`sortable` / `table` / `tree` / `tabs` 的重排都建立在其上：

| 导出 | 用途 |
| --- | --- |
| `projectSortable()` | 算出此刻的落点下标与每一项应让开的距离 |
| `sortableOffsets()` | 只取让位位移 |
| `shouldActivate()` / `DEFAULT_ACTIVATION_DISTANCE` | 本次位移是否足以开始拖动（默认 5px） |
| `edgeScrollDelta()` / `DEFAULT_EDGE_THRESHOLD` / `DEFAULT_EDGE_SPEED` | 拖到容器边缘时应滚动的距离，速度随入侵深度线性上升 |
| `moveItem()` | 先移除后插入的下标折算 |

三条判据：

- 落点按被拖项的中心是否越过其他项的中心判定，不按矩形相交。项高不一致时相交判据会在边界反复跳动；沿轴扫描遇到未越过的即停止，落点因此连续，不会从第 0 位跳到第 5 位。
- 几何一律取按下时刻的快照。让位之后布局已变化，用变形后的几何再计算会自激振荡。拖动中版面滚动产生的漂移由调用方换算回快照坐标。
- 激活阈值用直线距离而不是分轴比较。斜向拖动 4px + 4px 的实际位移是 5.7px，分轴比较会判定为未移动。

## 尺寸调整几何

`resizeRect()` 计算推动某条边之后的矩形，`clampSize` / `snapSize` / `applyAspectRatio` 是它使用的三条约束，也单独导出。`resizable` 与 `table` 的列宽、`floating-panel` 的尺寸调整都使用它。

两条硬规则：

- 西边与北边移动的是矩形的起点，因此位置随之变化；尺寸先经过约束，起点再按实际收缩量回算：顶到下限之后对边才不会继续漂移。
- 约束次序是吸附 → 宽高比 → 上下限 → 容器，夹取优先于比例。顶到容器或上下限时比例会被打破，因为边界是硬约束而比例是意图；反之（保比例、越界）会把矩形推到容器外。

## 本包不负责的部分

- 不涉及 DOM，不改样式，不调用 `setPointerCapture`
- 不换算业务坐标（轨道百分比、裁剪框、面板位置由各组件计算）
- 不做时序类手势识别（轻点、长按、双击都不在这一层）
- 不持有拖动状态：是否在拖、拖的是谁、松手后写回何处，全在组件的状态机中

这些留给调用方，是因为同一段跟手在不同组件中含义完全不同：滑块需要轨道上的比例，面板需要相对起点的位移，签名板需要压感曲线。本包只保证指针当前位置与几何计算两件事正确。
