# @xihan-ui/designer-kit

画布式设计器的公共内核：撤销重做历史栈、视口平移缩放、对齐吸附与参考线、多选对齐与等距分布、框选与命中、变换控制柄、标尺刻度。全部是纯函数与普通对象，不碰 DOM；文档与编辑操作的具体形状由使用方决定，历史栈只要求一个「应用操作，返回新文档与逆操作」的函数。自研实现，零运行时依赖，import 无副作用。

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
- 视口：屏幕坐标 = 世界坐标 × `zoom` + (`x`, `y`)。`zoomTo` / `zoomBy` 以锚点为中心缩放并夹在 `ZoomLimits` 内（缺省 0.1–4）；`fitRect` 适配内容（缺省不把小内容放大到 100% 以上）；`revealRect` 只在目标没整个露出时才居中；`constrainViewport` 不让内容整个拖出视野；`wheelZoomFactor` 把滚轮滚动量换成缩放倍数。
- 吸附：`snapRect` 比对移动矩形与目标的左 / 中 / 右、上 / 中 / 下三条线，在阈值内取最近的一条，返回位移与吸附后重合的参考线；某一向没吸到目标时可退到网格。阈值与矩形同一坐标系。
- `alignRects` 按选区包围盒贴边或居中，`distributeRects` 沿一个方向等空隙（缺省）或等中心距分布，首尾不动；两者按输入顺序返回新的左上角。
- `selectInMarquee` 按完整包住（`contain`）或碰到即选（`intersect`）挑出框里的矩形下标；`marqueeModeFromDrag` 按拖拽方向取方式。矩形可带 `rotation`（绕中心顺时针的角度），合并、包含、相交、对齐、分布、吸附与视口适配都按旋转后的包围盒计算，`hitTest`、`rotatedRectIntersects` 与框选的 `intersect` 按实际形状判断；`hitTest` 返回命中的最上层下标。
- 变换控制柄：`handlePoints` 给出八个缩放柄与旋转柄的位置，`resizeWithHandle` 在矩形自身坐标系里缩放（等比、以中心、最小尺寸），`rotateWithHandle` 按指针算角度并可按步长吸附，`nudgeDelta` 把方向键换成位移（步长 1，大步长 10）。
- `rulerTicks` 按每单位屏幕像素取 1-2-5 序列的主刻度与小刻度，单位由调用方决定（如毫米）。
- 非法输入立即抛 `RangeError`，不静默修正。

## 装

```bash
pnpm add @xihan-ui/designer-kit
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `features/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
