# 解剖与部件契约

「解剖」（anatomy）是 XiHan.UI 的地基约定：把一个组件拆成若干具名**部件**（part），每个部件在 DOM 上由 `data-scope` + `data-part` 两个属性唯一标识。皮肤、测试、诊断、跨适配器一致性判据全都建在这一条约定上。

## 声明

```ts
import { createAnatomy } from '@xihan-ui/core'

export const accordionAnatomy = createAnatomy('accordion', [
  'root',
  'item',
  'header',
  'trigger',
  'content',
  'indicator',
])
```

`build()` 把它展开成属性与选择器：

```ts
const parts = accordionAnatomy.build()

parts.content.attrs
// { 'data-scope': 'accordion', 'data-part': 'content' }

parts.content.selector
// '[data-scope="accordion"][data-part="content"]'
```

部件名一律 kebab-case，直接就是 `data-part` 的值，也直接就是 CSS 选择器里出现的字面量——三处同名，不做任何转换。

## 三类属性

DOM 上出现的属性分三类，只有前两类是对外的样式接口：

| 属性 | 含义 | 谁写 |
| --- | --- | --- |
| `data-scope` / `data-part` | 结构标识：这是哪个组件的哪个部件 | 解剖 |
| `data-state` / `data-disabled` / `data-orientation` / `data-highlighted` / `data-side` / `data-align` | 状态：此刻是什么样 | `connect` |
| `data-xh-*` | 内部标记（层栈、集合项、焦点哨兵、滚动分片等） | 原语内部 |

第三类以 `data-xh-` 前缀与前两类区分开。**不要在皮肤里选中它们**——它们是实现细节，不承诺稳定。

## 必备部件

每个组件另有一份机读元数据，声明哪些部件缺了组件就不工作：

```ts
export const accordionMeta: ComponentMeta = {
  component: 'accordion',
  requiredParts: ['trigger', 'content'],
}
```

这份元数据不是文档注解，它有执行力：

- Web Components 适配器在接线时比对作者写的 DOM，缺必备部件报 `wc.missing-part`（error），出现解剖之外的部件名报 `wc.unknown-part`（warn）；
- 有的部件还登记了**必须使用的标签**——比如表单字段的 `label` 必须是原生 `<label>`，写成 `<div>` 会让 `for` 关联整条失效、点标签不再聚焦控件，这类「写错了会静默失效」的情况报 `wc.wrong-part-tag`。

每个组件的必备部件在[组件参考](../components/)里加粗标出。

## collection 管不管铺开结构

不少组件收一个 `collection`（或 `columns` / `rows`）当数据入口。**收了数据不等于会替你渲染结构**，
这里分两档，写代码前先对号入座：

| 档 | 传了数据之后 | 哪些组件 |
| --- | --- | --- |
| **根级代铺** | `<XhXxxRoot :collection>` 单独就能用，整套部件由组件铺开；写了默认插槽就整体接管 | `accordion` `checkbox-group` `combobox` `context-menu` `listbox` `mention` `menu` `menubar` `navigation-menu` `radio-group` `select` `tabs` `toggle-group` |
| **仅元信息** | 一个节点都不铺，结构全部手写；数据只供组件内部判断禁用、层级、选中这些 | `tree` `tree-select` `cascader` `transfer` `side-nav` `table`（`columns` / `rows`）`steps`（`count`） |

判据是**结构的自由度**：扁平集合的 DOM 形状是确定的，代铺不会挡住任何写法；
层级与多区（树、级联、穿梭框）的结构有太多合理变体，代铺一份出来只会逼作者推翻重写。

代铺的那一档有一条硬约束，由 `tests/collection-required-parts.spec.ts` 逐个组件钉住：
**铺出来的结构必须凑齐该组件的必备部件**，与手写全套部件产出的 DOM 一致。
少一个部件就是渲染出一个看着正常、其实不工作的组件——浮层打不开、方向键找不到条目、
读屏在自定义元素那侧直接报 `wc.missing-part`。给新组件加代铺时，先往那份测试里加一行。

## 两套适配器怎么用它

**Vue 适配器**把部件包成组件。`XhAccordionContent` 内部就是把 `api.getContentProps()` 展开到一个 `<div>` 上，属性由 `connect` 给，你看不见 `data-part`，但它在。

**Web Components 适配器**反过来：结构由你手写，你用 `data-xh-part` 声明「这个节点担任哪个角色」，元素发现它们之后把属性挂上去。

```html
<xh-accordion>
  <div data-xh-part="item" data-value="a">
    <h3 data-xh-part="header">
      <button data-xh-part="trigger">第一节</button>
    </h3>
    <div data-xh-part="content">内容</div>
  </div>
</xh-accordion>
```

::: tip 为什么是两个不同的属性名
作者写的是 `data-xh-part`（**声明**：我打算让这个节点当 trigger），元素接线后打上的是 `data-part`（**事实**：它已经被接成 trigger 了）。两者分开，才能区分「作者写了但没接上」与「已经接上」，`wc.missing-part` 这类诊断才有意义。
:::

部件发现是逐层向下遍历，遇到嵌套的 `xh-*` 子树就跳过——嵌在里面的另一个组件的部件归它自己管。

## 为什么皮肤只认属性不认类名

因为类名是框架的东西，属性不是。

```css
@layer xihan.components {
  [data-scope='button'][data-part='root'] { /* … */ }
  [data-scope='button'][data-part='root'][data-variant='solid'] { /* … */ }
  [data-scope='button'][data-part='root'][data-disabled] { /* … */ }
}
```

同一份 CSS 同时给 Vue 组件与自定义元素上色，因为两者在 DOM 上长得一模一样。这也意味着你可以整包丢掉默认皮肤自己写，组件行为一点不受影响。

## 归一化与属性合并

`connect` 产出的是**框架无关的 prop 字典**，交给适配器的归一化器落到具体框架上：

```ts
export function connectAccordion<T extends PropTypes>(
  service: Service<AccordionSchema>,
  normalize: NormalizeProps<T>,
): AccordionApi<T>
```

`normalize` 按元素类型分成 `element` / `button` / `input` / `label` / `img` 等若干 getter，各框架各实现一份。Vue 适配器传 `vueNormalize`，Web Components 适配器传 `wcNormalize`，无头场景直接用 `@xihan-ui/core` 的恒等归一化器 `normalizeProps`。

需要把自己的属性叠上去时用 `mergeProps`，它的合并语义是固定的：

| 键 | 语义 |
| --- | --- |
| `class` / `className` | 空格拼接 |
| `style` | 对象浅合并 |
| `onXxx` 事件处理器 | 顺序组合，前者先执行 |
| 其余 | 后者覆盖前者 |

## 相关

- [connect 与属性产出](./connect)：`getXxxProps()` 里到底装了什么
- [皮肤与样式分层](./styling)：属性选择器怎么组织成一套皮肤
- [诊断通道](./diagnostics)：契约违约怎么被报出来
