---
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/react": major
"@xihan-ui/web-components": major
---

**取色器的两条通道滑杆改成各内嵌一台 `slider` 机器，键盘与指针拖动不再自己手写一份。**

色相与透明度这两条滑杆此前自带一整套方向键步进、Home/End 端点、指针按下即跳与跟手、以及 RTL 掉头——这些库里的 `slider` 都已有。现在每条通道各跑一台 `slider` 机器：区间、步长与当下的值都受控于取色器（色相 0–360、透明度 0–100），滑杆推出来的新值经 `CHANNEL.SET` 送回取色器，颜色模型的换算仍留在取色器这一层。读屏那几条（`role` / 三个 `aria-value*` / `aria-orientation` / `aria-disabled` / Tab 位）仍由取色器自己明写，值与滑杆算的是同一个。轨道的渐变底色不受影响：三个部件对外仍挂取色器自己的部件名（`channel-slider` / `channel-slider-track` / `channel-slider-thumb`），滑杆那份皮肤选不中它们。

破坏面逐条：

- **`connectColorPicker` 的第一个参数从一台服务换成一份服务表。** 原来是 `connectColorPicker(service, normalize)`，现在是 `connectColorPicker({ root, hueSlider, alphaSlider }, normalize)`（新类型 `ColorPickerServices`）。两台滑杆的 props 由新导出的 `colorPickerChannelSliderProps(rootService, channel)` 现算。三个适配器已改完，直接用组件的使用者不受影响；自己拿 headless 连线的要跟着改。
- **`ColorPickerRefs.getChannelTrackEl` 撤掉。** 通道轨道的矩形改由各自那台滑杆的 `getTrackEl` 量。
- **`ColorPickerDragTarget` 从 `'area' | 'hue' | 'alpha'` 收窄成 `'area'`。** 取色器机器的 `DRAG.START` / `dragTarget` 现在只表示二维取色区那一处拖动；两条通道的拖动态住在各自那台滑杆里，`api.dragging` 与部件上的 `data-dragging` 照旧覆盖三处。
- **通道拇指新增了 `PageUp` / `PageDown`（各走 10）。** 这是滑杆自带的大步进，原先按下去只会滚页面。键盘表新增一行 `color-picker.kbd.channel-page-step`。`Shift + 方向键` 走 10 这条照旧。
- **指针拖动通道时的取值改按整格落。** 色相落在整度、透明度落在整百分点（与方向键、与 `aria-valuenow` 报的数同一档）。此前拖动会留下小数，读出来的数一样，序列化出的颜色串可能差 1/255。

不变的：两条通道的部件名与全部 `data-*`、`aria-label` 与带单位的 `aria-valuetext`、只读留 Tab 位而禁用（含 `alpha` 关掉时那条）抽 Tab 位、`CHANNEL.SET` / `CHANNEL.STEP` / `CHANNEL.TO_EDGE` 三个命令式事件、受控与非受控两条路、拇指位置按未取整的工作色算。
