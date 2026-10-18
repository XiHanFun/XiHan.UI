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

运行时只依赖 `@xihan-ui/core` 的 `./json` 与 `./hotkey` 子入口（`./hotkey` 是快捷键的平台写法与按键命中）和 `@xihan-ui/pointer` 的滚轮换算，子入口 `./properties` 另用 `@xihan-ui/expression` 的 `checkFormatSpec` 检查格式说明；import 无副作用，浏览器与服务端都能运行。属性描述与结构校验分别在子入口 `./properties` 与 `./schema`，只做画布的页面（如流程查看器）不为它们付字节。

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

上一步带同一合并键且没有封口时，新执行并入上一步，说明保留上一步的。`seal()`、撤销、重做与事务都会封口；字段失焦时调用 `seal()`，下次再输入就另起一步。`mergeWithin`（毫秒）可再加一道时间窗，配合 `now` 选项注入时钟；单次执行也可以带自己的 `mergeWithin` 盖过它，比如属性面板的输入传 `Infinity`，不论停顿多久都并成一步，只等失焦封口，而方向键微移仍按历史的时间窗合并。

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

## 剪贴板数据

复制出去的内容包成一个带格式标记、产品名与版本的 JSON 包，粘贴时先认包、再交给产品按版本校验载荷。同一产品的设计器之间（跨实例、跨标签页）可以互相粘贴，别的产品或普通文本粘进来时能明确拒绝。

```ts
import { clipboardMimeType, decodeClipboard, encodeClipboard } from "@xihan-ui/designer-kit";

designer.addEventListener("copy", (event) => {
  const text = encodeClipboard("print", 1, { elements: selectedElements });
  event.clipboardData?.setData(clipboardMimeType("print"), text);
  event.clipboardData?.setData("text/plain", text);
  event.preventDefault();
});

designer.addEventListener("paste", (event) => {
  const text = event.clipboardData?.getData(clipboardMimeType("print")) || event.clipboardData?.getData("text/plain") || "";
  const result = decodeClipboard(text, "print");
  if (result.ok)
    pasteElements(result.version, result.payload); // 载荷的结构由产品自己校验
});
```

| 函数 | 说明 |
| --- | --- |
| `encodeClipboard(product, version, payload)` | 序列化为 `{ format: "xihan-designer-clipboard", product, version, payload }` 的 JSON 文本 |
| `decodeClipboard(text, product)` | 成功得到 `{ ok: true, version, payload }`；失败得到 `{ ok: false, reason }` |
| `clipboardMimeType(product)` | `application/x-xihan-<product>+json` |

- 产品名是小写字母开头的小写字母、数字与连字符，版本是正整数，载荷是合法 JSON 值；不满足时 `encodeClipboard` 抛 `RangeError`。
- 失败原因：`invalid-json`（不是 JSON）、`not-clipboard`（没有格式标记）、`invalid-envelope`（产品名、版本或载荷缺失或不合法）、`other-product`（别的产品复制的）。包上多出的字段忽略。
- 自定义 MIME 类型只在同一浏览器里有效，所以同时写一份 `text/plain`；粘贴时先读自定义类型，再退到纯文本。

## 可绑定字段树

宿主用字段树描述数据的形状，设计器的字段选择器据此列出可选字段。`list` 字段的子字段描述数组的一个元素，比如表格的列从行对象里取值。

```ts
import type { DataField } from "@xihan-ui/designer-kit";
import { listDataFields } from "@xihan-ui/designer-kit";

const fields: DataField[] = [
  { name: "order", label: "订单", kind: "object", children: [
    { name: "no", label: "单号", kind: "value" },
    { name: "items", label: "明细", kind: "list", children: [{ name: "qty", kind: "value" }] },
  ] },
];

listDataFields(fields, { kinds: ["value"] }); // order.no
listDataFields(fields, { kinds: ["list"] }); // order.items
listDataFields(fields, { base: ["order", "items"] }); // qty，相对数组的一个元素
```

| 函数 | 说明 |
| --- | --- |
| `listDataFields(fields, { base?, kinds? })` | 深度优先列出 `{ path, text, field }`：进入 `object` 的子字段，不进入 `list` 的子字段；`base` 是起点（只含键的路径），是 `list` 时列它的元素字段；`kinds` 只列这些种类 |
| `findDataField(fields, path)` | 按只含键的路径找字段，经过 `list` 时进入元素字段，找不到为 `undefined` |
| `listFilterFields(fields)` | 条件编辑器用的字段清单（`@xihan-ui/viz` 的 `FilterField`）：根上与 `object` 里的 `value` 字段，`name` 是路径的 `formatJsonPath` 写法，不进入 `list`（条件筛的是行，不是行里数组的元素）；`type` 取字段的 `type`，没写时按文本（`"string"`） |

`text` 是 `formatJsonPath` 写法，不是标识符的键写成 `["unit price"]`。同级字段重名、名字为空或种类未知时抛 `RangeError`。

`value` 字段可以写 `type`（`"string" | "number" | "boolean" | "date" | "datetime"`，即 `@xihan-ui/viz` 的 `FilterValueType`）：条件编辑器据此给运算符与值的控件，不写时按文本。

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

`snapRect(rect, { targets, threshold, x?, y?, grid?, lines? })` 把移动中矩形的左 / 中 / 右（上 / 中 / 下）三条线与每个目标的同类线比对，在阈值内取最近的一条，返回应再平移的 `dx` / `dy` 与吸附后重合的参考线：

```ts
interface SnapGuide {
  axis: "x" | "y"; // x：x = position 的竖线；y：横线
  position: number;
  from: number; // 线的起点
  to: number; // 线的终点，覆盖所有在这条线上对齐的矩形
}
```

阈值与矩形同一坐标系，屏幕上的固定像素先除以 `zoom`。`lines: { x?, y? }` 给出贯穿画布的吸附线（如从标尺拖出的参考线）：`x` 是竖线的横坐标，`y` 是横线的纵坐标，与目标矩形的线一同比对；吸上时返回的参考线只覆盖移动的矩形。某一向没吸到目标、又给了 `grid` 时，矩形左上角落到最近的网格线上。`snapToGrid` / `snapPointToGrid` 单独把数值或点落到网格上。

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
checkTableCells(size, cells); // []
planCellMerge(cells, ["b", "a"]); // { ok: true, anchor: "a", rowSpan: 1, columnSpan: 2, absorbed: ["b"] }
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

## 属性描述

属性面板与属性检查用同一份描述，从子入口 `@xihan-ui/designer-kit/properties` 引入（只做画布的页面不为它付字节）：

```ts
import type { PropertyDescriptor } from "@xihan-ui/designer-kit/properties";
import { checkProperties, groupProperties } from "@xihan-ui/designer-kit/properties";

const descriptors: PropertyDescriptor[] = [
  { path: ["label"], control: { kind: "text" }, group: "basic", required: true },
  { path: ["data", "mode"], control: { kind: "select", options: [{ value: "Any" }, { value: "All" }] }, group: "rule", default: "Any" },
  { path: ["data", "count"], control: { kind: "number", integer: true, min: 1 }, group: "rule", visibleWhen: { path: ["data", "mode"], equals: "All" } },
];

const groups = groupProperties(descriptors, node, ["basic", "rule"]); // 属性面板按组渲染显示中的属性
const issues = checkProperties(descriptors, node, { path: ["nodes", 3], target: { kind: "node", id: node.id } });
```

| 字段 | 说明 |
| --- | --- |
| `path` | 值相对被编辑对象（节点、元素、字段本身）的 `JsonPath`，语义同 `@xihan-ui/core/json` |
| `control` | 编辑方式与取值约束，见下表；产品可用泛型参数扩展自己的种类，如 `PropertyDescriptor<PropertyControl \| { kind: "stroke" }>` |
| `group` | 分组 id，分组的先后与文案由产品决定 |
| `label` | 标签；不写时由产品按 `formatJsonPath(path)` 去语言包里查 |
| `required` | 显示时必须填写，按 `isFilled` 判空（`undefined`、`null`、空串、空数组、空对象算未填） |
| `default` | 新建时写入的缺省值，`applyDefaults` 只写还没有值的路径 |
| `visibleWhen` | 显示条件：`{ path, equals }`、`{ path, oneOf }`、`{ path, filled }`，可用 `all` / `any` / `not` 组合；path 同样相对被编辑对象 |
| `meta` | 产品自用，内核不解释 |

| 内建编辑方式 | 取值约束 |
| --- | --- |
| `{ kind: "text", multiline?, placeholder? }` | 字符串 |
| `{ kind: "number", integer?, min?, max?, exclusiveMin?, step?, unit? }` | 有限数字；min / max 含端点，exclusiveMin 不含；step 与 unit 只给编辑器用 |
| `{ kind: "boolean" }` | 布尔 |
| `{ kind: "select", options, multiple?, appearance? }` | 某个选项的 `value`；`multiple` 时是这些值组成的数组。`appearance` 只给编辑器用：`auto`（缺省）由编辑器定，`dropdown` 总是下拉，`toggle` 总是切换按钮组 |
| `{ kind: "tags" }` | 字符串数组 |
| `{ kind: "color" }` | `transparent`，或 `#` 开头的 3、4、6、8 位十六进制色 |
| `{ kind: "json" }` | 任意 JSON 值 |
| `{ kind: "dataField", fields?, kinds?, base? }` | 字段路径的 `formatJsonPath` 写法，空串为没有绑定，写法不对报 `invalid-value`。字段树：描述里写了 `fields` 就用它，没写时用属性面板给的（`<xh-designer-properties>` 的 `dataFields`）；`kinds` 是能选的字段种类，`base` 是相对路径的起点（从字段树根开始、只含键），同 `listDataFields` 的两个选项。这三项只给编辑器用 |
| `{ kind: "sides", integer?, min?, max?, exclusiveMin?, step?, unit? }` | `{ top, right, bottom, left }` 四个数字，每边按 number 的约束检查；缺边或某边不是数字报 `invalid-type`，多出别的键报 `unknown-key` |
| `{ kind: "format", kinds? }` | `@xihan-ui/expression` 的格式说明，按 `checkFormatSpec` 检查，没过报 `invalid-value`；`kinds` 是允许的格式种类，缺省全部 |
| `{ kind: "filter", fields?, parameters?, maxDepth?, ids? }` | 条件树（`@xihan-ui/viz` 的 `FilterGroup`）：组是 `{ logic: "and" \| "or", conditions }`，条件是 `{ field, operator }`，不是对象报 `invalid-type`，这层形状不对报 `invalid-value`；字段在不在、运算符合不合由各款自己的校验报。可筛选的字段：描述里写了 `fields`（`FilterField`）就用它，没写时用属性面板给的 `dataFields` 按 `listFilterFields` 列出的值字段。`parameters` 是可引用的参数（`FilterParameter`），`maxDepth` 限子组层数，`ids` 为 true 时新建的条件与组带 id。这四项只给编辑器用 |

number 与 sides 的数值约束是同一个类型 `PropertyNumberConstraints`；四边的键与次序是 `PROPERTY_SIDES`（`top`、`right`、`bottom`、`left`），取值类型是 `PropertySides`。

| 函数 | 说明 |
| --- | --- |
| `evaluateCondition(condition, target)` / `isPropertyVisible(descriptor, target)` | 求值显示条件，equals 与 oneOf 按 JSON 值比较 |
| `groupProperties(descriptors, target, order?)` | 只收显示中的属性；`order` 里的组在前，其余按出现先后，无组的排最后，空组不出现 |
| `nestProperties(prefix, descriptors)` | 把相对子对象的描述换成相对上级对象：`path` 与显示条件里的 `path` 都接在 `prefix` 之后，产品扩展的字段原样保留；同一组描述既给子对象的面板用，又拼进上级对象的描述时用它 |
| `checkPropertyValue(control, value)` | 内建编辑方式的取值检查，返回 `invalid-type`、`invalid-value`、`out-of-range`、`not-integer`、`invalid-option`、`invalid-color`、`unknown-key` 或 `undefined` |
| `checkProperties(descriptors, target, { path?, target?, controls? })` | 只看显示中的属性：必填未填报 `required`，内建取值不合法报对应码，登记在 `controls` 里的编辑方式交给它的 `check`，既不是内建也没登记的报 `unknown-control`；返回结构问题，路径以 `path` 为前缀 |
| `mergePropertyEditorTables(layers)` | 把几层编辑器表叠成一张，逐键合并，后面的压前面的 |
| `applyDefaults(target, descriptors)` | 写入缺省值，中间缺少的对象键补成空对象；没有可写的返回同一个对象 |
| `resolvePropertyEditor(table, targetKind, descriptor)` | 按「对象种类 + 路径」→「路径」→「编辑方式」查编辑器；表里放 `PropertyEditor` 或编辑器 id 都可以，路径键用 `formatJsonPath` 的写法 |

属性面板里的某些属性需要宿主自己的编辑器（如选人、选部门）。设计器按 `PropertyEditor` 调用它：

```ts
type PropertyEditor<D, T> = (context: {
  value: JsonValue | undefined; // 当前值
  descriptor: D; // 属性描述
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

## 结构校验

四款设计器校验自己的 JSON 模板时共用一种问题形状与一组读取器，从子入口 `@xihan-ui/designer-kit/schema` 引入。问题只带问题码与定位，不带文案，问题面板与文案表因此可以共用：

```ts
interface SchemaIssue<C extends string = string> {
  code: C; // 通用码或带前缀的产品码，如 node.unreachable
  path: JsonPath; // 从文档根算起，只用对象键与数组下标
  target?: { kind: string; id: string }; // 问题落在的对象，下标会随编辑变，按对象定位看它
  severity?: "error" | "warning"; // 缺省按 error
  params?: Record<string, JsonPrimitive | JsonPrimitive[]>;
}
```

通用问题码：`required`、`invalid-type`、`invalid-value`、`out-of-range`、`not-integer`、`invalid-option`、`invalid-color`、`empty`、`unknown-key`、`duplicate-key`、`duplicate-id`、`unknown-control`。

```ts
import { createIssueSink, readNumber, readObject, readString, withSeverity } from "@xihan-ui/designer-kit/schema";

const sink = createIssueSink();
const fields = readObject(sink, value, ["nodes", 0], { required: ["id", "x"], allowed: ["id", "x", "label"] });
readString(sink, fields?.id, ["nodes", 0, "id"], { nonEmpty: true });
readNumber(sink, fields?.x, ["nodes", 0, "x"]);
const issues = withSeverity(sink.issues, { "node.isolated": "warning" }, userOverrides);
```

| 函数 | 说明 |
| --- | --- |
| `createIssueSink({ target? })` | 收集问题：`report(code, path, { params?, target?, severity? })`，路径另存一份；缺省 target 写进没有自带 target 的问题 |
| `readObject(sink, value, path, { required?, allowed? })` | 不是普通对象报 `invalid-type`；缺少必填键报 `required`，给了 `allowed` 时其余键报 `unknown-key`；返回对象本身 |
| `readArray` / `readString(…, { nonEmpty? })` / `readBoolean` | 类型不符报 `invalid-type`（参数 `expected`），`nonEmpty` 时空串报 `empty` |
| `readNumber(sink, value, path, { integer?, min?, max?, exclusiveMin? })` | 不是有限数字报 `invalid-type`，不是整数报 `not-integer`，越界报 `out-of-range`（参数带上界限） |
| `readOneOf(sink, value, path, choices)` | 不在 `choices` 里报 `invalid-option` |
| `readJson(sink, value, path)` | 不是 JSON 报 `invalid-value`，参数 `pointer` 指出第一处非 JSON 的位置 |
| `checkUniqueKeys(sink, items, path, keyOf, code?)` | 同一个键第二次及以后出现的项报问题（缺省 `duplicate-key`） |
| `withSeverity(issues, table, overrides?)` | 定下严重程度：`overrides` 优先，其次问题自己写的，再次 `table`，最后 error；定为 `off` 的去掉 |
| `issueSeverity(issue)` / `hasErrors(issues)` | 取严重程度；是否有 error 级问题 |

各 `read` 函数把 `undefined` 视为缺省，返回 `undefined` 且不报问题，必填由 `readObject` 的 `required` 管；读到的值不拷贝。读取器只要求收集器有 `report`（`IssueReporter`），问题码比通用码更宽的产品收集器也能直接传入。按 id 或名字定位数组项属于产品语义：先按下标报出，再由产品换成自己的定位。

## 设计器扩展

四款设计器都收一个按实例传入的 `extensions` 属性，值是扩展对象的数组：`designer.extensions = [xihanWorkflow, hostExtension]`。同页多实例各给各的，不做全局登记。内置的种类、命令、面板与导出也写成内置扩展，放在列表最前面，与传入的走同一条路。这里放四款共用的骨架；种类、渲染、面板这些由各款在骨架之上加。

```ts
import type { DesignerExtensionBase } from "@xihan-ui/designer-kit";

const simulation: DesignerExtensionBase<FlowContext> = {
  id: "@xihan-flow-pro/simulation", // 全局唯一，也是模板里扩展数据的键
  controls: { cron: { check: value => (typeof value === "string" ? undefined : "invalid-type") } },
  rules: [doc => doc.nodes.length > 200 ? [{ code: "simulation.too-many-nodes", path: ["nodes"] }] : []],
  editors: { byControl: { cron: createCronEditor } },
  commands: [{ id: "@xihan-flow-pro/simulation.run", label: ctx => ctx.t.run, placement: ["toolbar"], shortcut: ["Mod", "R"], run: ctx => ctx.simulate() }],
  setup: ctx => ctx.designer.addEventListener("schema-change", onChange), // 返回的函数在卸下时调用
};
```

| 字段 | 说明 |
| --- | --- |
| `id` | 全局唯一，用包名加功能名；问题码的前缀取它的末段（`@xihan-flow-pro/simulation` → `simulation.`） |
| `controls` | 新的编辑方式，键是属性描述里的 `control.kind`，不能与内建的重名；`checkProperties` 的 `controls` 用合并后的这张表 |
| `rules` | `(document, context) => SchemaIssue[]`；问题码必须以「id 末段.」开头，否则执行器抛 `TypeError` |
| `editors` | 属性编辑器表的一层（三张表都可以缺），按扩展顺序压在设计器内建的之上 |
| `commands` | 工具栏、右键菜单与快捷键共用的命令：`{ id, label, placement?, shortcut?, enabled?, checked?, tone?, run }`；`shortcut` 的写法同 `xh-kbd` 的 `keys`，破坏性命令的 `tone` 写 `danger`，按钮与菜单项按这族色显示 |
| `importers` / `exporters` | 粘贴、拖放、打开文件时的导入，以及导出成文件；形状由各款定 |
| `setup` | 装上时调用，返回卸下时的清理 |

`DesignerExtensionCore` 只含 `id`、`controls` 与 `rules`，给只读纯数据与纯函数的 core 函数（校验、计算）用；`DesignerExtensionBase` 在它之上加设计器层的字段。各款的扩展类型按层是超集：设计器层 ⊇ 运行时层 ⊇ core 层，只用查看器的页面只引运行时层。

### 合并、冲突与装卸

```ts
import { createExtensionHost } from "@xihan-ui/designer-kit";

const host = createExtensionHost({
  builtins: [flowBuiltins],
  spaces: { "node-type": ext => Object.keys(ext.nodeTypes ?? {}) }, // 各款自己的名字空间
  context: () => this.commandContext(),
});
host.assign(this.extensions ?? []); // 给 extensions 赋值时调用；冲突在这里抛
host.dispose(); // 元素离开文档时调用
```

- 顺序：内置在前，传入的按数组顺序在后。物料分组、追加的属性、规则执行、命令的缺省排列、面板的上下次序都按这个顺序。
- 冲突在给 `extensions` 赋值、合并登记表的那一刻抛 `DesignerExtensionError`（`code` 为 `designer.extension-conflict`），报出名字空间、名字与先后登记它的两个扩展的 id，设计器保持赋值前的状态。查的名字有：扩展 id、命令 id、快捷键（Mod 按 Ctrl 算，`Mod+S` 与 `Ctrl+S` 算同一个）、编辑方式（含内建的那几种）、导入导出 id，以及 `spaces` 里各款的名字（种类、面板区名等）。不支持后登记的就地覆盖先登记的：要换掉内置行为，用自己的 id 另登记一项，再用命令排列或 `panels` 把内置那项去掉。
- 编辑器表例外：本来就是层叠模型，按顺序合并，后面的压前面的。
- 装卸按扩展 id 与对象引用比对：去掉的调它 `setup` 返回的清理，新加的调 `setup`；id 没变但换了一个对象，当作卸下再装上。所以宿主要保持扩展对象的引用稳定，不要每次渲染都新建一个同 id 的对象。

| 函数 | 说明 |
| --- | --- |
| `mergeExtensions(builtins, extensions, spaces?)` | 只合并查重，返回列表 |
| `createExtensionHost({ builtins?, spaces?, context })` | 合并查重加装卸：`assign(extensions)` 返回新列表，`list` 是当前列表，`dispose()` 全部卸下 |
| `extensionEditors(base, extensions)` | 编辑器表：`base` 是设计器内建的那层 |
| `extensionControls(extensions)` | 编辑方式合成一张表 |
| `extensionCommands(extensions)` | 命令按登记顺序排成 `Map`，键是命令 id |
| `findImporter(importers, sources)` | 挑出接下导入的导入器：来源按先后，每个来源按导入器的先后问 `accepts`，返回第一个接下的与那个来源；都不接时为 `undefined`。粘贴与拖放的数据由 designer-shell 的 `importSources` 列成来源 |
| `runExtensionRules(extensions, document, context)` | 按扩展顺序逐条跑规则，检查问题码前缀 |
| `shortcutKey(keys)` / `formatShortcut(keys, platform)` | 快捷键的比较用写法；显示文字，macOS 上 `⌘⇧P`，其余平台 `Ctrl+Shift+P` |
| `commandForShortcut(commands, event, context, platform)` | 这次按键命中的、此刻可用的命令；`platform` 由 `@xihan-ui/core/hotkey` 的 `detectKbdPlatform()` 测出；`event` 只读 key、code 与四个修饰键 |

### 模板里的扩展数据

文档与每个对象（节点、元素、字段、卡片、连线）都可以带 `extensions: { [扩展 id]: JsonObject }`。校验只查它是对象、每一块也是对象，里面不看；编辑操作、复制粘贴与导入导出原样带着走。扩展只读写自己 id 下的那一块，与宿主的业务数据分开。

| 函数 | 说明 |
| --- | --- |
| `getExtensionData(object, id)` | 读对象上某个扩展的数据，没有时为 `undefined` |
| `setExtensionData(id, data, base?)` | 写入或去掉（`data` 为 `undefined`）的路径编辑操作，`base` 是对象自己的路径 |
| `extensionDataPath(id, base?)` | 那一块在文档里的路径 |
| `checkExtensionData(object, path?)` | 结构检查，不是对象报 `invalid-type` |

## 状态

实验级：四款设计器接入期间，历史栈的事务与通知、视口、吸附与控制柄的选项、属性描述、结构校验与扩展的形状仍可能调整，破坏性变更可以出现在 minor 中，并在更新日志中逐条列出。
