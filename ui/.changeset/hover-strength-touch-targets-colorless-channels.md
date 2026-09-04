---
"@xihan-ui/styles": minor
---

**四组皮肤的悬停强度、粗指针热区与无色档一起补齐。**

**悬停回执分两族给足。** 此前全库有八十余条悬停规则只换一样东西：输入盒只挪一格 `border-color`（一条 1px 的描边色变化，在整框面积上读不出来），按钮形的面只换一层底色。现在按部件形态分两族：

- **输入族换填充**——`text-field` / `number-field` / `password-input` / `pin-input` / `tags-input` / `mention` / `editable` / `select` / `combobox` / `cascader` / `tree-select` / `popselect` / `date-picker` / `time-picker` / `date-field` / `time-field` / `color-picker` / `prompt-input` / `file-upload` 的输入盒在换描边之外同时换底色，`transition` 补上 `background`。悬停底取本档常态底朝淡底兑一小步（`outline` 从画布起、`ghost` 从透明起），`subtle` 那一档换到淡底自己的悬停档；只读与禁用两档排除在外——它们的底色本身就在表达"改不动"。
- **按钮形的面抬起一档**——`button`（`solid` 档抬升与顶边高光一起列，`outline` / `ghost` 两档收成 `none`）、`clipboard` / `download-trigger` / `timer` / `transfer` / `carousel` / `signature-pad` / `file-upload` 的动作钮悬停接 `--xh-elevation-raised`，按下收回，`transition` 补上 `box-shadow`。列表行按既有分界仍走中性灰高亮档，不接阴影。

**粗指针热区补到 44×44。** `@media (pointer: coarse)` 下，`checkbox` / `switch` / `dialog` / `drawer` / `popover` / `tour` / `alert` / `notification` / `toast` / `carousel` / `segmented` / `timer` / `float-button` / `back-top` 的独立触控目标各挂一个绝对定位的伪元素承接指针，视觉盒与布局占位一点不动（`::before` 已被兜底字形占着，一律用 `::after`）。密排成网格或一排的条目（走马灯圆点、热力图格子、取色器色块与拇指、表格与树的行首把手、拖拽把手）没有外扩：它们外扩到 44px 相邻命中区会叠在一起，点错格子比命中区小更糟，理由留在登记表的 backlog 里。

**打印与强制颜色两档补上非颜色通道。** 打印默认丢背景，`checkbox` / `radio-group` / `switch` / `rating` / `toggle` / `steps` / `tabs` / `pagination` / `calendar` / `segmented` / `table` / `timeline` / `diff-view` / `tag` / `badge` / `alert` 此前只靠底色表达的那些档（勾上、选中、当前页、区间、走过的步、变更类型、语气）改由描边粗细、虚实、字重、下划线这些印得出来的通道表达。强制颜色档里 `menu` / `menubar` / `context-menu` / `toolbar` / `steps` / `anchor` / `splitter` 的分隔线与指示条补 `CanvasText` / `Highlight`（这些部件本体就是一块底色，`forced-colors` 下整条消失），`progress` 的轨道与走过的段分开取色。共享层 `forced-colors.css` 只追加了一条日期／时间分段框的当前段焦点环，既有行一字未改。

**另两处。** `question-flow` 的选项记号改读控件内图标档（原先读展示档，勾画进 16px 的盒里溢出 4px），单选圆点直径跟着按记号盒折半，与 `radio-group` 同口径；`skeleton` 的微光默认值从 `--xh-bg-subtle-hover` 改到 `--xh-bg-surface-raised`——浅色档下前者比骨架底更暗，扫过去的是一道暗带，与深色档相反。

新增 37 个组件覆盖槽（`--xh-*-bg-hover` / `-shadow-hover` / `-shadow-active` / `-border-hover` / `-border-focus` / `--xh-question-flow-indicator-icon-size`），既有槽名、部件名、`data-*` 取值一个没删没改名。
