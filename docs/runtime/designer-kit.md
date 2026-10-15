# 设计器内核

`@xihan-ui/designer-kit` 是画布式设计器的公共内核：撤销重做历史栈、视口平移缩放、对齐吸附与参考线、多选对齐与等距分布、框选与命中、变换控制柄、标尺刻度。打印、流程、表单、报表这类设计器都要做这几件事，内核把它们写成与文档形状无关的纯函数，各设计器只需提供自己的文档模型与编辑操作。

```ts
import { createHistory, fitRect, snapRect, zoomBy } from "@xihan-ui/designer-kit";

const history = createHistory({ document, apply: applyOperation });
history.execute([{ type: "moveNodes", positions }], { label: "移动" });
history.undo();

let viewport = fitRect(contentBounds, { width: 800, height: 600 });
viewport = zoomBy(viewport, 1.2, { x: 400, y: 300 });

const { dx, dy, guides } = snapRect(draggingRect, { targets, threshold: 6 / viewport.zoom });
```

## 设计约束

- **不碰 DOM。** 全部是纯函数与普通对象，指针事件、绘制与样式由设计器自己处理；同一页面放多个设计器互不影响。
- **文档形状由使用方决定。** 历史栈只依赖「应用一个操作，返回新文档与逆操作」这一个函数，不认识节点、连线或字段。
- **不改输入。** 视口、吸附、对齐与分布都返回新值；历史栈要求 `apply` 不修改传入的文档。
- **非法输入立即报错。** 缩放上限小于下限、吸附阈值为负、未知的对齐方式等一律抛 `RangeError`，不静默修正。

## 是否安装

它不随适配器安装，需要时单独安装：

```bash
pnpm add @xihan-ui/designer-kit
```

零运行时依赖，import 无副作用，浏览器与服务端都能运行。

## 撤销重做

### 操作约定

```ts
type ApplyOperation<D, O> = (document: D, operation: O) => {
  document: D; // 新文档，不修改输入
  inverse: readonly O[]; // 按顺序应用即可撤销
};
```

一组操作的逆操作是各操作逆操作按反序拼接。逆操作必须能精确还原：撤销时应用逆操作，应用得到的逆操作就是重做所需，历史栈每一步只存待执行方向的那组操作。

### 执行、撤销与重做

| 成员 | 说明 |
| --- | --- |
| `execute(operations, { merge?, label? })` | 依次应用一组操作并记为一步，返回新文档；清空重做栈。空数组、或应用后文档仍是同一引用（操作没有带来变化）时什么都不做，不入栈也不通知 |
| `undo()` / `redo()` | 撤销或重做一步，没有可执行的步时返回 `false` |
| `canUndo` / `canRedo`、`undoCount` / `redoCount` | 工具栏按钮的可用状态与步数 |
| `undoLabel` / `redoLabel` | 下一次撤销、重做那一步的说明 |
| `document` | 当前文档 |
| `markSaved()` / `dirty` | 把当前位置记为保存点；`dirty` 为当前位置与保存点不同，或事务中已有改动 |
| `reset(document)` | 换成新文档并清空两个栈，新文档视为已保存（装载模板时用） |
| `clear()` | 只清空两个栈，是否已保存不变 |
| `subscribe(listener)` | 每次变化后通知 `{ kind, document, operations }`，返回取消订阅的函数 |

应用失败时 `apply` 抛出的错误原样抛出，文档与两个栈都不变。`limit` 是撤销栈的步数上限，缺省 100，超出时丢弃最早的一步。

保存点按位置比对：撤销、重做回到保存点时 `dirty` 变回 `false`；保存点被新执行清出重做栈、或早于步数上限能退回的位置时，再也回不到保存点。`markSaved()` 同时封口，保存之后的输入另起一步。

### 合并连续输入

在属性面板里逐字输入时，每次按键都执行一次，但撤销应当一次回到输入前。给这些执行带同一个合并键：

```ts
history.execute([setLabel(nodeId, value)], { merge: `node:${nodeId}:label`, label: "改名" });
```

上一步带同一合并键且没有封口时，新执行并入上一步，说明保留上一步的。`seal()`、撤销、重做与事务都会封口；字段失焦时调用 `seal()`，下次再输入就另起一步。`mergeWithin`（毫秒）可再加一道时间窗，配合 `now` 选项注入时钟。

### 事务

拖动、批量对齐这类由多次执行组成的交互用事务记为一步：

```ts
history.begin("拖动");
// 拖动中每帧 execute，文档实时更新
history.commit(); // 整段拖动记为一步
// 或 history.rollback()：按 Esc 放弃，文档回到拖动前
```

事务可嵌套，最外层 `commit` 时才入栈；`rollback` 放弃整个事务（含外层），重做栈保持事务前的样子。`transact(run, label)` 在 `run` 正常返回时提交、抛错时回滚后重新抛出。事务中调用 `undo`、`redo`、`reset`、`clear` 会抛错，事务中的执行忽略合并键。

## 视口

视口是 `{ x, y, zoom }`：屏幕坐标 = 世界坐标 × `zoom` + (`x`, `y`)。

| 函数 | 说明 |
| --- | --- |
| `screenToWorld` / `worldToScreen` | 点的互转；`screenRectToWorld` / `worldRectToScreen` 是矩形的互转 |
| `visibleWorldRect(viewport, size)` | 视口里看得到的世界矩形 |
| `panBy(viewport, dx, dy)` | 平移若干屏幕像素 |
| `zoomTo(viewport, zoom, anchor, limits?)` / `zoomBy(viewport, factor, anchor, limits?)` | 以屏幕上的锚点为中心缩放，锚点对着的世界点不动；缩放夹在 `limits` 内，缺省 `DEFAULT_ZOOM_LIMITS`（0.1–4） |
| `wheelZoomFactor(deltaY, deltaMode?, speed?)` | 滚轮滚动量换成缩放倍数，按行、按页滚动先折成像素 |
| `fitRect(bounds, size, { padding?, maxZoom?, limits? })` | 让内容整个落在视口中央；`maxZoom` 缺省 1，小内容不放大 |
| `centerOn(viewport, point, size)` | 缩放不变，把世界点移到视口中央 |
| `revealRect(viewport, rect, size, padding?)` | 目标已整个露出时原样返回，否则把它居中 |
| `constrainViewport(viewport, content, size, keep?)` | 内容每个方向至少留 `keep` 像素在视口内，不让它被整个拖出视野 |

## 对齐吸附与参考线

`snapRect(rect, { targets, threshold, x?, y?, grid? })` 把移动中矩形的左 / 中 / 右（上 / 中 / 下）三条线与每个目标的同类线比对，在阈值内取最近的一条，返回应再平移的 `dx` / `dy` 与吸附后重合的参考线：

```ts
interface SnapGuide {
  axis: "x" | "y"; // x：x = position 的竖线；y：横线
  position: number;
  from: number; // 线的起点
  to: number; // 线的终点，覆盖所有在这条线上对齐的矩形
}
```

阈值与矩形同一坐标系，屏幕上的固定像素先除以 `zoom`。某一向没吸到目标、又给了 `grid` 时，矩形左上角落到最近的网格线上。`snapToGrid` / `snapPointToGrid` 单独把数值或点落到网格上。

## 对齐与分布

`alignRects(rects, mode)` 按选区包围盒对齐：`left` / `right` / `top` / `bottom` 贴边，`center-vertical` 把中心落到包围盒的竖直中线上，`center-horizontal` 落到水平中线上。`distributeRects(rects, axis, spacing?)` 沿 `horizontal` 或 `vertical` 方向分布，按中心排序后首尾不动：`gap`（缺省）让相邻空隙相等，`center` 让相邻中心距相等。两者按输入顺序返回各自新的左上角，交给设计器生成移动操作。

## 框选

`marqueeRect(start, current)` 由拖拽起止点得出选框；`selectInMarquee(marquee, rects, mode?)` 返回落在框里的矩形下标，`contain`（缺省）要求整个包住，`intersect` 碰到即选；`marqueeModeFromDrag(start, current)` 按拖拽方向取方式：自左向右为 `contain`，自右向左为 `intersect`。

`rectFromPoints`、`unionRects`、`rectContains`、`rectsIntersect`、`expandRect`、`rectCenter` 是这些函数共用的矩形运算，同样公开。

## 旋转与命中

`Rect` 可带可选的 `rotation`：`x` / `y` / `width` / `height` 是旋转前的框，`rotation` 为绕中心顺时针旋转的角度（度），缺省 0。

带旋转角的矩形一律按旋转后的包围盒计算：`unionRects`、`rectContains`、`rectsIntersect`、`alignRects`、`distributeRects`、`snapRect`（含网格退路），以及视口的 `fitRect`、`revealRect`、`constrainViewport` 都如此；对齐与分布移动的是包围盒，返回的左上角是旋转前的框跟着平移后的位置；`screenRectToWorld`、`worldRectToScreen`、`expandRect` 保留旋转角。需要按旋转后的实际形状判断时用下表的函数，框选的 `intersect` 也按实际形状判断。

| 函数 | 说明 |
| --- | --- |
| `rotatePoint(point, center, degrees)` | 把点绕中心顺时针旋转 |
| `rectCorners(rect)` / `rotatedBounds(rect)` | 旋转后的四角与轴对齐包围盒 |
| `pointInRect(point, rect, tolerance?)` | 点是否落在旋转后的矩形内 |
| `hitTest(point, rects, tolerance?)` | 命中的最上层下标（数组越靠后越在上），都不命中为 `-1` |
| `rotatedRectIntersects(a, b)` | 两个矩形按旋转后的实际形状是否相交，按分离轴判断 |

## 变换控制柄

| 函数 | 说明 |
| --- | --- |
| `handlePoints(rect, rotateOffset?)` | 八个缩放柄与旋转柄的位置；旋转柄在上边中点再往外 `rotateOffset` |
| `resizeWithHandle(start, handle, pointer, { keepAspect?, fromCenter?, minWidth?, minHeight? })` | 拖动缩放柄到指针处后的矩形：在矩形自身的坐标系里缩放，旋转角不变，对边或对角（`fromCenter` 时为中心）保持不动，拖过对边时停在最小尺寸上 |
| `rotateWithHandle(start, pointer, { step? })` | 拖动旋转柄后的角度（0–360，旋转柄朝上为 0）；`step` 按步长吸附，按住 Shift 时通常传 15 |
| `nudgeDelta(key, { large?, step?, largeStep? })` | 方向键对应的位移，缺省步长 1、大步长 10；不是方向键时为 `undefined` |

控制柄只给几何，指针与键盘事件、等比与以中心缩放对应哪个修饰键由设计器决定；得到的矩形再由设计器换成自己的缩放或移动操作。

## 标尺

`rulerTicks({ start, end, pixelsPerUnit, minMajorSpacing?, minMinorSpacing?, steps? })` 返回 `{ step, minorStep, ticks }`，每个刻度是 `{ value, offset, major }`。单位由调用方决定：打印设计器传毫米与「每毫米的屏幕像素 × 缩放倍数」，画布设计器传世界坐标。主刻度间隔从 `steps`（缺省 1-2-5）的十进制倍数里取不小于 `minMajorSpacing`（缺省 64 像素）的最小一档，主刻度之间按 10、5、2 格依次尝试，取小格间距不小于 `minMinorSpacing`（缺省 6 像素）的最多分格。

## 状态

实验级：四款设计器接入期间，历史栈的事务与通知、视口、吸附与控制柄的选项仍可能调整，破坏性变更可以出现在 minor 中，并在更新日志中逐条列出。
