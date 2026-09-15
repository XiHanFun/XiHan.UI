# 解剖与部件契约

解剖（anatomy）是 XiHan.UI 的基础约定：把一个组件拆成若干具名部件（part），每个部件在 DOM 上由 `data-scope` + `data-part` 两个属性唯一标识。皮肤、测试、诊断、跨适配器一致性判据都建立在这条约定上。

## 声明

```ts
import { createAnatomy } from "@xihan-ui/core";

export const accordionAnatomy = createAnatomy("accordion", [
  "root",
  "item",
  "header",
  "trigger",
  "content",
  "indicator",
]);
```

`build()` 把它展开成属性与选择器：

```ts
const parts = accordionAnatomy.build();

parts.content.attrs;
// { 'data-scope': 'accordion', 'data-part': 'content' }

parts.content.selector;
// '[data-scope="accordion"][data-part="content"]'
```

部件名一律 kebab-case，即 `data-part` 的值，也是 CSS 选择器中出现的字面量；三处同名，不做任何转换。

## 三类属性

DOM 上出现的属性分三类，只有前两类是对外的样式接口：

| 属性 | 含义 | 谁写 |
| --- | --- | --- |
| `data-scope` / `data-part` | 结构标识：所属组件与部件 | 解剖 |
| `data-state` / `data-disabled` / `data-orientation` / `data-highlighted` / `data-side` / `data-align` | 状态：当前的状态 | `connect` |
| `data-xh-*` | 内部标记（层栈、集合项、焦点哨兵、滚动分片等） | 原语内部 |

第三类以 `data-xh-` 前缀与前两类区分。不在皮肤中选择它们，它们是实现细节，不承诺稳定。

## 必备部件

每个组件另有一份机读元数据，声明缺少哪些部件组件就无法工作：

```ts
export const accordionMeta: ComponentMeta = {
  component: "accordion",
  requiredParts: ["trigger", "content"],
};
```

这份元数据具有执行力：

- Web Components 适配器在接线时比对作者编写的 DOM，缺少必备部件时报告 `wc.missing-part`（error），出现解剖之外的部件名时报告 `wc.unknown-part`（warn）；
- 部分部件还登记了必须使用的标签：例如表单字段的 `label` 必须是原生 `<label>`，写成 `<div>` 会使 `for` 关联失效、点击标签不再聚焦控件，这类写错即静默失效的情况报告 `wc.wrong-part-tag`。

每个组件的必备部件在[组件参考](../components/)中加粗标出。

## collection 是否铺开结构

不少组件接受 `collection`（或 `columns` / `rows`）作为数据入口。接受数据不等于会渲染结构，分为两档：

| 档 | 传了数据之后 | 哪些组件 |
| --- | --- | --- |
| 根级代铺 | `<XhXxxRoot :collection>` 可以单独使用，整套部件由组件铺开；写了默认插槽即整体接管 | `accordion` `checkbox-group` `combobox` `context-menu` `listbox` `mention` `menu` `menubar` `navigation-menu` `radio-group` `select` `tabs` `toggle-group` |
| 仅元信息 | 不铺任何节点，结构全部手写；数据只供组件内部判断禁用、层级、选中 | `tree` `tree-select` `cascader` `transfer` `side-nav` `table`（`columns` / `rows`）`steps`（`count`） |

判据是结构的自由度：扁平集合的 DOM 形状确定，代铺不会限制任何写法；层级与多区（树、级联、穿梭框）的结构有较多合理变体，代铺会迫使作者推翻重写。

代铺一档有一条硬约束，由 `tests/collection-required-parts.spec.ts` 逐个组件保证：铺出的结构必须包含该组件的必备部件，与手写全套部件产出的 DOM 一致。少一个部件即渲染出一个看似正常、实际不工作的组件：浮层无法打开、方向键找不到条目、读屏在自定义元素侧报告 `wc.missing-part`。为新组件增加代铺时，先在该测试中增加一行。

## 两套适配器的用法

Vue 适配器把部件封装为组件。`XhAccordionContent` 内部把 `api.getContentProps()` 展开到一个 `<div>` 上，属性由 `connect` 提供，`data-part` 不需要作者编写，但它存在于 DOM 上。

Web Components 适配器相反：结构由作者编写，用 `data-xh-part` 声明节点的角色，元素发现它们之后写入属性。

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
作者写的是 `data-xh-part`（声明：该节点担任 trigger），元素接线后写入的是 `data-part`（事实：它已经被接为 trigger）。两者分开，才能区分“作者写了但未接上”与“已经接上”，`wc.missing-part` 等诊断才有意义。
:::

部件发现逐层向下遍历，遇到嵌套的 `xh-*` 子树即跳过：嵌套的另一个组件的部件由它自己管理。

## 皮肤只识别属性不识别类名

类名属于框架，属性不属于框架。

```css
@layer xihan.components {
  [data-scope='button'][data-part='root'] { /* … */ }
  [data-scope='button'][data-part='root'][data-variant='solid'] { /* … */ }
  [data-scope='button'][data-part='root'][data-disabled] { /* … */ }
}
```

同一份 CSS 同时作用于 Vue 组件与自定义元素，因为两者在 DOM 上完全一致。这也意味着可以整体替换默认皮肤，组件行为不受影响。

## 归一化与属性合并

`connect` 产出的是框架无关的 prop 字典，交给适配器的归一化器落到具体框架上：

```ts
export function connectAccordion<T extends PropTypes>(
  service: Service<AccordionSchema>,
  normalize: NormalizeProps<T>,
): AccordionApi<T>;
```

`normalize` 按元素类型分成 `element` / `button` / `input` / `label` / `img` 等若干 getter，各框架各实现一份。Vue 适配器传 `vueNormalize`，Web Components 适配器传 `wcNormalize`，无头场景直接用 `@xihan-ui/core` 的恒等归一化器 `normalizeProps`。

需要叠加自定义属性时使用 `mergeProps`，合并语义固定：

| 键 | 语义 |
| --- | --- |
| `class` / `className` | 空格拼接 |
| `style` | 对象浅合并 |
| `onXxx` 事件处理器 | 顺序组合，前者先执行 |
| 其余 | 后者覆盖前者 |

## 相关

- [connect 与属性产出](./connect)：`getXxxProps()` 的内容
- [皮肤与样式分层](./styling)：属性选择器如何组织为一套皮肤
- [诊断通道](./diagnostics)：契约违约如何被报告
