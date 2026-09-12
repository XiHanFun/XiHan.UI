# 文本输入

单行或多行的自由文本输入。

## 何时使用

- 姓名、标题、描述、搜索词这类没有固定候选的文本。

## 何时不用

- 值来自一份已知清单：用[选择器](./select)或[组合框](./combobox)。
- 输入的是数字并需要加减：用[数字输入](./number-field)。
- 输入的是日期或时间：用[日期输入](./date-field)、[时间输入](./time-field)。

## 特性

- `type` 覆盖 `text` / `password` / `email` / `tel` / `url` / `search`。
- `clearable` 给出清空按钮，`maxLength` 给出字数上限。
- 输入部件用 `as="textarea"` 切到多行；`autoSize` 为 `true` 时随内容长高，也可用
  `{ minRows, maxRows }` 限定行数。两个边界给值时必须是大于等于 1 的有限整数，且
  `minRows` 不得大于 `maxRows`；无效配置会明确失败，不会夹取或沿用旧配置。
- 自动高度会跟随输入、程序化写值与运行期配置变化重新测量。关闭 `autoSize`、换回单行、
  替换输入节点或卸载组件时，会归还启用前的 `block-size` 与 `overflow-y` 内联声明及其 priority；
  作者原本没有写的声明才会被移除。
- 自动高度把一只隐藏 textarea 临时挂到输入框所属 Document，以复制后的排版与宽度计算值取得真实
  内容高度和单行高度，换算 `minRows` / `maxRows`；`line-height: normal` 不按字号猜测。`content-box` 与 `border-box`
  分别按自己的声明盒计算内距和边框。量高要求 textarea 已连接到带 Window 的 Document，且当前只接受
  `writing-mode: horizontal-tb`；其他书写模式会明确失败，不会把物理纵向滚动尺寸误当成逻辑块尺寸。
- `prefix` / `suffix` 在框内摆货币符、单位或图标，两段对读屏隐藏。
- 默认皮肤把控件接入 Field Chrome：Headless 在真实视觉盒、输入、装饰段上分别投影
  `data-xh-field-chrome`、`data-xh-field-input`、`data-xh-field-affix`，单行与 textarea 由
  `data-xh-field-layout` 明确区分。旧 `data-multiline` / `data-auto-resize` 视觉钩子已删除，
  自定义皮肤应读取新的家族角色，不提供双写兼容。
- 清空按钮复用 Action Control 的 `field-inset` profile 和 `has-value` 显示策略；粗指针命中区、
  pressed/focus/forced-colors 均由家族配方提供，适配器不另算尺寸或可见性。
- `showCount` 显出字数部件，数字取 `count` 与 `maxLength`，顶到上限时换色。
- 放在 FormFieldGroup 里时，未声明的 `disabled` / `readOnly` / `required` / `invalid` 会从最近的
  Field 或 Form 继承；实例显式写 `false` 仍以实例为准。Field 的标签、说明和错误描述链保持挂到 input。
- 输入组、限制可输入字符由作者组合，组件不预设。

## 组合

- 外面套[表单字段](./field)拿标签与错误文本；与[按钮](./button)拼成输入组。

## 最佳实践

- `type` 要写对：移动端的软键盘按它切换，写错会让用户多按很多次。
- 密码框的明暗切换按钮要有可及名字，并在切换后更新它。

## 反模式

- 用它收集固定格式的分段值（日期、验证码）：用[日期输入](./date-field)、[分格输入](./pin-input)。
- 输入时就报格式错误。
