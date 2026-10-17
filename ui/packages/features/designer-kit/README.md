# @xihan-ui/designer-kit

画布式设计器的公共内核：撤销重做历史栈、按 JSON 路径的编辑操作、文档内唯一 id、网格布局、视口平移缩放、对齐吸附与参考线、多选对齐与等距分布、框选与命中、变换控制柄、标尺刻度、长度单位与纸张预设，以及属性面板的自定义编辑器接口。全部是纯函数与普通对象，不碰 DOM；文档与编辑操作的具体形状由使用方决定，历史栈只要求一个「应用操作，返回新文档与逆操作」的函数。自研实现，运行时只依赖 `@xihan-ui/core` 的 `./json`、`./hotkey` 子入口与 `@xihan-ui/pointer` 的滚轮换算，子入口 `./properties` 另用 `@xihan-ui/expression` 检查格式说明；import 无副作用。

**谁会装它**：做打印、流程、表单、报表这类画布式设计器的人。普通页面用不到它，它也不随适配器安装。

## 用法

```ts
import { createHistory, fitRect, snapRect } from '@xihan-ui/designer-kit'

interface Doc { readonly items: readonly string[] }
type Op = { type: 'add', value: string } | { type: 'pop' }

// 历史栈只依赖这一个函数：不改输入，返回新文档与按顺序应用即可撤销的逆操作
function apply(doc: Doc, op: Op): { document: Doc, inverse: Op[] } {
  if (op.type === 'add')
    return { document: { items: [...doc.items, op.value] }, inverse: [{ type: 'pop' }] }
  const last = doc.items.at(-1)
  if (last === undefined)
    throw new RangeError('nothing to pop')
  return { document: { items: doc.items.slice(0, -1) }, inverse: [{ type: 'add', value: last }] }
}

const history = createHistory<Doc, Op>({ document: { items: [] }, apply })
history.execute([{ type: 'add', value: 'a' }], { label: '添加' })
history.execute([{ type: 'add', value: 'b' }], { merge: 'typing' })
history.execute([{ type: 'add', value: 'c' }], { merge: 'typing' }) // 同一合并键，并入上一步
history.undo() // 回到 ['a']

// 视口：把内容整个放进 800 × 600 的画布并居中
const viewport = fitRect({ x: 0, y: 0, width: 1600, height: 900 }, { width: 800, height: 600 })

// 吸附：屏幕上 6px 的吸附距离先除以缩放倍数
const snap = snapRect({ x: 103, y: 40, width: 120, height: 48 }, {
  targets: [{ x: 100, y: 200, width: 120, height: 48 }],
  threshold: 6 / viewport.zoom,
})
```

## 约定

- 历史栈每一步只存待执行方向的操作：撤销时应用逆操作，应用得到的逆操作就是重做所需，所以操作必须可逆、逆操作必须能精确还原。`execute` 接收一组操作并记为一步；`merge` 合并键相同的连续执行并成一步（`seal()`、撤销、重做之后不再合并，`mergeWithin` 可加时间窗）；`begin` / `commit` / `rollback` 与 `transact` 把一段交互（如拖动）记为一步，可嵌套，回滚放弃整个事务；`limit` 是撤销步数上限，缺省 100；`markSaved()` 记下保存点，`dirty` 判断是否有未保存的修改。应用后文档仍是同一引用的执行不入栈；应用失败时抛错，文档与两个栈都不变。`subscribe` 在每次变化后通知变化种类、新文档与实际应用的操作。
- `applyInSequence` 依次应用一组操作，逆操作按反序拼接；历史栈内部就用它。
- 路径编辑操作 `applyPathOperation(s)`：`set`（`value` 缺省删除对象键，`createMissing` 补中间层）、`insert`、`remove`、`move`，可直接作为历史栈的 `apply`。不改输入，没有变化时返回同一文档、逆操作为空；失败抛 `PathOperationError`，`message` 即 `code`。路径语义同 `@xihan-ui/core/json`。
- 文档内唯一 id：`nextFreeId(prefix, taken)` 取同前缀最大序号加一，`createIdAllocator` 连续分配并可登记已占用的 id，`remapIds` 给粘贴出的对象换新 id。
- 剪贴板数据：`encodeClipboard(product, version, payload)` 包成带格式标记、产品名与版本的 JSON 文本，`decodeClipboard(text, product)` 只认本产品的包，失败时给出原因；`clipboardMimeType(product)` 给出写进剪贴板事件的 MIME 类型。读写剪贴板事件由设计器负责。
- 字段树：`DataField` 是 `{ name, label?, kind: 'value' | 'object' | 'list', children? }`，由宿主描述数据的形状；`listDataFields(fields, { base?, kinds? })` 列出起点之下可直接读到的字段（进入对象、不进入数组），以数组为起点时列元素字段；`findDataField` 按键路径找字段。
- 网格布局：`GridItem` 是 `{ id, x, y, w, h }`，单位是格。`clampToGrid` 夹到网格内，`gridCollides` 判重叠（边相接不算），`compactLayout` 自上而下向上压实，`setGridItemRect` 拖动或改大小时推开压到的项、向下拖过下方项的顶边即与它对调，`placeGridItem` 放到第一个空位或指定位置，`removeGridItem` 移除一项；调整之后缺省整体压实，`{ compact: false }` 不压实。
- 合并单元格的表格：`TableCell` 是 `{ id, row, column, rowSpan, columnSpan }`。`checkTableCells` 检查越界、重叠与留空，`planCellMerge` 判断所选单元格能否合并成一个矩形，`planCellSplit` 给出拆分后要补的位置，`planTableLineInsert` / `planTableLineRemove` 算出增删一行（列）后的新尺寸、变化的单元格与要新建、删除的单元格；只给计算结果，编辑操作由各设计器自己生成。
- 子入口 `@xihan-ui/designer-kit/properties`：属性描述 `PropertyDescriptor`（按 `JsonPath` 相对被编辑对象寻址，内建 text / number / boolean / select / tags / color / json 七种编辑方式，可用泛型扩展产品的种类）、显示条件、`groupProperties`、给描述加路径前缀的 `nestProperties`、`checkPropertyValue` / `checkProperties`、`applyDefaults`、`resolvePropertyEditor`，以及自定义编辑器接口 `PropertyEditor`（只是类型）。
- 子入口 `@xihan-ui/designer-kit/schema`：结构问题 `SchemaIssue`（`code`、从文档根算起的 `path`、可选的 `target` / `severity` / `params`，不带文案）、通用问题码、`withSeverity` / `hasErrors`、`createIssueSink`，以及 `readObject` / `readArray` / `readString` / `readNumber` / `readBoolean` / `readOneOf` / `readJson` / `checkUniqueKeys` 读取器。
- 视口：屏幕坐标 = 世界坐标 × `zoom` + (`x`, `y`)。`zoomTo` / `zoomBy` 以锚点为中心缩放并夹在 `ZoomLimits` 内（缺省 0.1–4）；`fitRect` 适配内容（缺省不把小内容放大到 100% 以上）；`revealRect` 只在目标没整个露出时才居中；`constrainViewport` 不让内容整个拖出视野；`wheelZoomFactor` 把滚轮滚动量换成缩放倍数。
- 吸附：`snapRect` 比对移动矩形与目标的左 / 中 / 右、上 / 中 / 下三条线，在阈值内取最近的一条，返回位移与吸附后重合的参考线；`lines` 另给贯穿画布的吸附线（如标尺拖出的参考线）；某一向没吸到目标时可退到网格。阈值与矩形同一坐标系。
- `alignRects` 按选区包围盒贴边或居中，`distributeRects` 沿一个方向等空隙（缺省）或等中心距分布，首尾不动；两者按输入顺序返回新的左上角。
- `selectInMarquee` 按完整包住（`contain`）或碰到即选（`intersect`）挑出框里的矩形下标；`marqueeModeFromDrag` 按拖拽方向取方式。矩形可带 `rotation`（绕中心顺时针的角度），合并、包含、相交、对齐、分布、吸附与视口适配都按旋转后的包围盒计算，`hitTest`、`rotatedRectIntersects` 与框选的 `intersect` 按实际形状判断；`hitTest` 返回命中的最上层下标。
- 变换控制柄：`handlePoints` 给出八个缩放柄与旋转柄的位置，`resizeWithHandle` 在矩形自身坐标系里缩放（等比、以中心、最小尺寸），`rotateWithHandle` 按指针算角度并可按步长吸附，`nudgeDelta` 把方向键换成位移（步长 1，大步长 10）。
- `rulerTicks` 按每单位屏幕像素取 1-2-5 序列的主刻度与小刻度，单位由调用方决定（如毫米）。
- 长度单位：`convertLength(value, from, to, { dpi? })` 在 `mm`、`cm`、`in`、`pt`、`px` 之间换算，像素缺省按 96 dpi（CSS 像素）；`PAPER_PRESETS` 是 A3–A6、B4、B5（ISO 216）与 Letter、Legal 的纵向毫米尺寸，`PAPER_PRESET_NAMES`、`LENGTH_UNITS` 供列选项，`isPaperPresetName` 供校验。
- 非法输入立即抛 `RangeError`，不静默修正。

## 装

```bash
pnpm add @xihan-ui/designer-kit
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `features/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
