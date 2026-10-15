# 设计器内核

`@xihan-ui/designer-kit` 是画布式设计器的公共内核：撤销重做历史栈、按 JSON 路径的编辑操作、文档内唯一 id、网格布局、视口平移缩放、对齐吸附与参考线、多选对齐与等距分布、框选与命中、变换控制柄、标尺刻度、长度单位与纸张预设，以及属性面板的自定义编辑器接口。打印、流程、表单、报表这类设计器都要做这几件事，内核把它们写成与文档形状无关的纯函数，各设计器只需提供自己的文档模型与编辑操作。

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

运行时只依赖 `@xihan-ui/core` 的 `./json` 子入口与 `@xihan-ui/pointer` 的滚轮换算，import 无副作用，浏览器与服务端都能运行。

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

### 依次应用一组操作

`applyInSequence(apply, document, operations)` 依次应用一组操作，返回最终文档与按反序拼接的逆操作，任一操作抛错时整体抛错、输入文档不变。历史栈的 `execute` 内部就是用它，设计器自己的 `applyOperations` 也可以直接写成它。

## 路径编辑操作

文档就是一份 JSON 时，可以不另写操作类型，直接按路径编辑。路径与读写语义见 `@xihan-ui/core/json`：段只有对象键（只认自有属性）与数组下标两种，原型键、负数与小数一律不合法。

| 操作 | 作用 | 逆操作 |
| --- | --- | --- |
| `{ type: 'set', path, value?, createMissing? }` | 写入 `value`；`value` 缺省时删除对象键。缺中间层时报错，`createMissing: true` 才补成空对象。空路径替换整个文档 | 原来有值时 `set` 回原值，原来没有时 `remove`；补出中间层时删掉补出的最上面一层 |
| `{ type: 'insert', path, index?, value }` | 把 `value` 插入 `path` 指向的数组，`index` 缺省时追加 | `remove` 插入的那一项 |
| `{ type: 'remove', path }` | 删除对象键或数组项 | 对象键 `set` 回去，数组项 `insert` 回原位置 |
| `{ type: 'move', path, index }` | 把数组项移到同一数组的 `index` 处 | `move` 回原位置 |

```ts
import { applyPathOperation, createHistory } from "@xihan-ui/designer-kit";

const history = createHistory({ document: template, apply: applyPathOperation });
history.execute([{ type: "set", path: ["rows", 0, "title"], value: "合计" }], { merge: "rows.0.title" });
history.execute([{ type: "move", path: ["rows", 2], index: 0 }], { label: "上移" });
```

`applyPathOperation(document, operation)` 不修改输入，未改动的部分沿用原引用，写入的值不做拷贝；没有带来变化时返回同一个文档、逆操作为空数组，历史栈因此不会记下空步。`applyPathOperations` 依次应用一组。失败时抛 `PathOperationError`，`message` 就是 `code`，`operation` 是失败的那个操作：

| `code` | 含义 |
| --- | --- |
| `invalid-operation` | 不是已知的操作或缺少 `path` |
| `invalid-path` | 路径段不合法，或对空路径做 `remove` / `move` |
| `path-not-found` | 路径不存在，或段的种类与所在容器不符 |
| `invalid-value` | 值不是 JSON，或想用 `set` 删除数组项 |
| `not-an-array` | `insert` / `move` 指向的不是数组 |
| `index-out-of-range` | `insert` / `move` 的目标下标越界 |

按 id 或名字定位数组项属于各设计器自己的语义，先把它解析成下标再交给路径操作。

## 文档内唯一 id

| 函数 | 说明 |
| --- | --- |
| `nextFreeId(prefix, taken)` | 形如 `${prefix}${n}`，`n` 取 `taken` 里同前缀正整数序号的最大值加一 |
| `createIdAllocator(prefix, taken?)` | 分配器：`next()` 从已有最大序号之后连续分配、互不重复；`reserve(id)` 登记已被占用的 id |
| `remapIds(ids, allocate)` | 为一组旧 id 各分配一个新 id，返回旧 → 新的对照表（粘贴、复制时改写引用用）；重复的旧 id 只分配一次 |

分隔符算在前缀里：`createIdAllocator("text-")` 给出 `text-1`、`text-2`。这里生成的是文档里保存的 id；DOM 上关联 ARIA 用的 id 走适配器自己的生成器，两者不要混用。

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

## 网格布局

看板、工作台这类按整数格排布的卡片用这一组函数。`GridItem` 是 `{ id, x, y, w, h }`，单位是格；列数由调用方给出，行数不限：

```ts
import { placeGridItem, setGridItemRect } from "@xihan-ui/designer-kit";

let items = [{ id: "sales", x: 0, y: 0, w: 6, h: 2 }];
items = placeGridItem(items, { id: "trend", w: 6, h: 2 }, 12); // 放到第一个空位：x 6、y 0
items = setGridItemRect(items, "trend", { x: 0, y: 0 }, 12); // 拖到 sales 上：sales 被推到下面
```

| 函数 | 说明 |
| --- | --- |
| `clampToGrid(item, columns)` | 取整并夹到网格内：宽在 1 到列数之间，高至少 1，不越过右边界，x、y 不小于 0 |
| `gridCollides(a, b)` | 两项是否重叠，边相接不算 |
| `compactLayout(items, columns)` | 自上而下、自左而右把每项向上移到碰到别的项为止，原本重叠的项向下推开 |
| `setGridItemRect(items, id, target, columns, { compact? })` | 拖动或改大小：压到的项向下推开并连锁推开；向下拖过下方项的顶边时两者对调 |
| `placeGridItem(items, { id, w, h, x?, y? }, columns, { compact? })` | 放入新项：写了 x、y 放在那里并推开碰撞的项，没写时放到第一个放得下的空位；新项排在末尾 |
| `removeGridItem(items, id, columns, { compact? })` | 移除一项 |

返回新数组，次序与输入相同，不改输入。调整之后缺省整体向上压实，同位置时被拖动或放入的项优先；`{ compact: false }` 不压实，项可以悬空。位置大小不是有限数、id 不存在或重复时抛 `RangeError`。

## 合并单元格的表格

表单的表格布局、打印的表格元素、报表的网格都有合并单元格，几何运算由这一组函数给出。`TableCell` 是 `{ id, row, column, rowSpan, columnSpan }`，行列从 0 起，跨度至少 1。函数只给计算结果，编辑操作由各设计器按自己的文档形状生成：

```ts
import { checkTableCells, planCellMerge, planTableLineInsert } from "@xihan-ui/designer-kit";

const size = { rows: 2, columns: 2 };
const cells = [{ id: "a", row: 0, column: 0, rowSpan: 1, columnSpan: 1 }, { id: "b", row: 0, column: 1, rowSpan: 1, columnSpan: 1 }, { id: "c", row: 1, column: 0, rowSpan: 1, columnSpan: 2 }];
checkTableCells(size, cells);             // []
planCellMerge(cells, ["b", "a"]);         // { ok: true, anchor: "a", rowSpan: 1, columnSpan: 2, absorbed: ["b"] }
planTableLineInsert(size, cells, "column", 1); // c 加长到 3 列，b 后移到第 2 列，第 0 行第 1 列补一个新格
```

| 函数 | 说明 |
| --- | --- |
| `checkTableCells(size, cells)` | 全部问题：`invalid-size`、`invalid-cell`（位置不是非负整数或跨度小于 1）、`out-of-bounds`、`overlap`（报在后出现的单元格上）、`gap`（按行优先给出没被覆盖的位置） |
| `planCellMerge(cells, ids)` | 所选单元格须至少两个、恰好拼成一个矩形且矩形里没有未选的单元格；成功时给出左上角 `anchor`、新跨度与按输入顺序并入的 `absorbed`，失败时给出 `unknown-cell`、`too-few-cells` 或 `not-rectangle` |
| `planCellSplit(cell)` | 跨度还原成 1 后要补新格的位置，行优先；本来就是 1 × 1 时为空数组 |
| `planTableLineInsert(size, cells, axis, at)` | 在第 `at` 行（列）前插入：跨过的单元格加长，其后的后移，没被覆盖的位置补新格；`at` 等于行（列）数时追加在末尾 |
| `planTableLineRemove(size, cells, axis, at)` | 删除第 `at` 行（列）：只占这一行（列）的单元格删除，跨过的缩短，其后的前移 |

增删行列返回 `{ size, updates, added, removed }`：新尺寸、位置或跨度变了的单元格（给出新几何）、要新建的 1 × 1 单元格位置与要删除的单元格 id。不改输入；`at` 越界或表格只剩一行（列）还要删时抛 `RangeError`。

## 标尺

`rulerTicks({ start, end, pixelsPerUnit, minMajorSpacing?, minMinorSpacing?, steps? })` 返回 `{ step, minorStep, ticks }`，每个刻度是 `{ value, offset, major }`。单位由调用方决定：打印设计器传毫米与「每毫米的屏幕像素 × 缩放倍数」，画布设计器传世界坐标。主刻度间隔从 `steps`（缺省 1-2-5）的十进制倍数里取不小于 `minMajorSpacing`（缺省 64 像素）的最小一档，主刻度之间按 10、5、2 格依次尝试，取小格间距不小于 `minMinorSpacing`（缺省 6 像素）的最多分格。

## 长度单位与纸张

`convertLength(value, from, to, { dpi? })` 在 `LengthUnit` 之间换算：`mm`、`cm`、`in`、`pt`（1/72 英寸）与 `px`。像素按 `dpi` 折算，缺省 96，即 CSS 像素；按打印机分辨率出图时传 203、300 等。毫米、厘米、英寸与磅之间的换算没有浮点零头，如 25.4 mm 恰好是 72 pt。`dpi` 不是正的有限数或单位不认识时抛 `RangeError`。

```ts
import { convertLength, PAPER_PRESETS } from "@xihan-ui/designer-kit";

const a4 = PAPER_PRESETS.A4; // { width: 210, height: 297 }，纵向，单位 mm
const widthPx = convertLength(a4.width, "mm", "px"); // 793.7…
const fontMm = convertLength(12, "pt", "mm"); // 4.233…
```

`PAPER_PRESETS` 收 ISO 216 的 A3–A6 与 B4、B5，以及北美的 Letter、Legal，都是纵向尺寸，横向时宽高互换。`PAPER_PRESET_NAMES` 与 `LENGTH_UNITS` 按声明顺序列出全部取值，供页面设置与属性面板列选项；`isPaperPresetName` 区分大小写。

## 属性编辑器接口

属性面板里的某些属性需要宿主自己的编辑器（如选人、选部门）。设计器按 `PropertyEditor` 调用它：

```ts
type PropertyEditor<D, T> = (context: {
  value: JsonValue | undefined; // 当前值
  descriptor: D; // 属性描述，形状由设计器决定
  target: T; // 被编辑的对象，如节点、元素、字段
  readonly: boolean;
  setValue: (value: JsonValue | undefined) => void; // 写入，连续输入并为一步撤销
  commit: () => void; // 一次编辑结束（如失焦），此后的写入另起一步
}) => {
  element: HTMLElement;
  update?: (context: PropertyEditorContext<D, T>) => void;
  destroy?: () => void;
};
```

设计器把 `element` 放进属性面板，值或只读状态变化时调用 `update`，移除前调用 `destroy`。接口本身只是类型，内核不创建任何 DOM。

## 状态

实验级：四款设计器接入期间，历史栈的事务与通知、视口、吸附与控制柄的选项仍可能调整，破坏性变更可以出现在 minor 中，并在更新日志中逐条列出。
