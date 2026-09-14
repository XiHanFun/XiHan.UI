# @xihan-ui/styles

默认皮肤：138 份纯 CSS，零 JS。只按 `[data-scope][data-part]` 与 `data-*` 选中，不匹配标签名也不匹配 class——所以整套换掉它不影响任何行为。

**谁会装它**：不想自己写样式的人装它。要做自己的设计语言，就不装，照解剖文档写一套自己的。

## 用法

```ts
/* 全量 */
import '@xihan-ui/styles'

/* 或按需：令牌与层序先行，tone 决定语气轴，缺了它 tone 会静默回落品牌色 */
import '@xihan-ui/styles/layers.css'
import '@xihan-ui/styles/tone.css'
import '@xihan-ui/styles/button.css'
```

`button.css` 已传递引入 Action Control Family Recipe；需要给自定义解剖接入同一视觉合同时，也可单独引入 `@xihan-ui/styles/action-control.css`，并使用文档化的 `data-xh-action-*` 角色属性。家族缺省是无顶光、无描边、无投影的平面中性动作；品牌实心、显式边界与海拔必须由消费组件通过状态槽明确映射。

`text-field.css` 已传递引入 Field Chrome 与字段内 Action Control；自定义字段可单独引入
`@xihan-ui/styles/field-chrome.css`，并由 Headless 投影 `data-xh-field-chrome/input/affix/layout/size`
角色。家族配方不读取组件名、标签名或未命名空间的业务属性。

`select.css` 已传递引入 Collection Item；自定义集合可单独引入
`@xihan-ui/styles/collection-item.css`，并用 `data-xh-collection-item/size/slot` 投影稳定角色；
选择、禁用与加载直接读取 `aria-selected/aria-disabled/aria-busy`，路径、高亮与对号继续使用状态词汇表里的
`data-in-path/data-highlighted/data-state`。
Menu、Mention、Command 等导航候选在各自迁移前不会被
机械标成持久选择；Select 的 `selected` 与 `checked` 分别表达选值事实和末端对号。

## 装

```bash
pnpm add @xihan-ui/styles
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `design/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
