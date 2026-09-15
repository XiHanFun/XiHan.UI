# 文本字段

单行或多行的自由文本输入。

## 何时使用

- 姓名、标题、描述、搜索词等没有固定候选的文本。

## 何时不用

- 值来自已知清单时，使用[选择器](./select)或[组合框](./combobox)。
- 输入数字并需要加减时，使用[数字字段](./number-field)。
- 输入日期或时间时，使用[日期字段](./date-field)、[时间字段](./time-field)。

## 特性

- `type` 覆盖 `text` / `password` / `email` / `tel` / `url` / `search`。
- `clearable` 显示清空按钮，`maxLength` 设置字数上限。
- 输入部件用 `as="textarea"` 切换到多行；`autoSize` 为 `true` 时随内容增高，也可用 `{ minRows, maxRows }` 限定行数。两个边界必须是大于等于 1 的有限整数，且 `minRows` 不得大于 `maxRows`；无效配置会明确失败，不夹取也不沿用旧配置。
- 自动高度跟随输入、程序化写值与运行期配置变化重新测量。关闭 `autoSize`、换回单行、替换输入节点或卸载组件时，归还启用前的 `block-size` 与 `overflow-y` 内联声明及其 priority；只移除作者原本没有写的声明。
- 自动高度把一个隐藏 textarea 临时挂到输入框所属 Document，以复制后的排版与宽度计算值取得真实内容高度和单行高度，换算 `minRows` / `maxRows`；`line-height: normal` 不按字号推测。`content-box` 与 `border-box` 分别按自己的声明盒计算内距和边框。测量要求 textarea 已连接到带 Window 的 Document，且当前只接受 `writing-mode: horizontal-tb`；其他书写模式会明确失败，不把物理纵向滚动尺寸误当逻辑块尺寸。
- `prefix` / `suffix` 在框内放置货币符、单位或图标，两段对读屏隐藏。
- 默认皮肤把控件接入 Field Chrome：Headless 在真实视觉盒、输入、装饰段上分别投影 `data-xh-field-chrome`、`data-xh-field-input`、`data-xh-field-affix`，单行与 textarea 由 `data-xh-field-layout` 区分。旧 `data-multiline` / `data-auto-resize` 视觉钩子已删除，自定义皮肤应读取新的家族角色，不提供双写兼容。
- 默认即 `outline`：`--xh-bg-canvas` 底、`--xh-border-control` 描边、control 圆角、无阴影，不写 `variant` 时 root 与 control 都落 `data-variant="outline"`；`subtle` 为中性填充、`ghost` 为透明底，两者在悬停与聚焦时浮出描边，聚焦描边一律 `--xh-border-control-focus`。
- 清空按钮复用 Action Control 的 `field-inset` profile 和 `has-value` 显示策略；粗指针命中区、pressed / focus / forced-colors 均由家族配方提供，适配器不另行计算尺寸或可见性。
- 开启 `clearable` 后，清空按钮在空值时收起，只在有值且可编辑时出现；字段聚焦边界平滑过渡。
- `showCount` 显示字数部件，数字取 `count` 与 `maxLength`，达到上限时换色。
- 放在 FormFieldGroup 内时，未声明的 `disabled` / `readOnly` / `required` / `invalid` 从最近的 Field 或 Form 继承；实例显式写 `false` 时以实例为准。Field 的标签、说明和错误描述链保持挂到 input。
- 输入组、限制可输入字符由作者组合，组件不预设。

## 组合

- 外层放[表单字段](./field)获取标签与错误文本；与[按钮](./button)组成输入组。

## 最佳实践

- `type` 必须正确：移动端软键盘按它切换，写错会增加用户的按键次数。
- 密码框的明暗切换按钮要有可访问名称，并在切换后更新。

## 反模式

- 用它收集固定格式的分段值（日期、验证码）：应使用[日期字段](./date-field)、[分格输入](./pin-input)。
- 输入时就报格式错误。
