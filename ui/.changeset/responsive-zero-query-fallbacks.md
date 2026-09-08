---
"@xihan-ui/styles": minor
---

**修一批实测出来的横向溢出。这一批一句媒体查询都没写。**

逐组件量过之后的结论是：多数「窄处坏掉」的修法不需要任何查询——`flex-wrap`、`min-inline-size: 0`、`overflow-wrap`、把死地板改成能让步的形式，**这类规则在窄视口与窄容器两种情形下同时成立，一份规则管两轴**。只按视口写档的话，1280px 宽屏里的 260px 侧栏照样坏（实测溢出 86px）。

**控件的 `12rem` 死地板**是一处根因，拖着 16 个组件：`text-field` / `select` / `combobox` / `cascader` / `tree-select` / `color-picker` / `date-field` / `date-picker` / `time-field` / `time-picker` / `number-field` / `password-input` / `tags-input` / `mention` / `clipboard` / `input-group`。它们此前在窄于 192px 的容器里恒定溢出（120px 容器越界 72px）。现在地板会让步，宽处默认一像素没动。

注意：**改令牌取值本身是走不通的**——这些控件的根是 `inline-flex`（收缩到内容宽），百分比在不定宽的包含块里退化成 auto，实测 `select` 会从 192px 塌到 68px。改的是这条地板怎么被消费。

**横向排布族**改为折行：`tabs` / `toolbar` / `menubar` / `navigation-menu` / `toggle-group` / `segmented`。刻意不用横滚——`overflow-x: auto` 会让 `overflow-y` 一起变 `auto`，`tabs` 的指示条 `inset-block-end` 是负值、整条挂在列表盒外沿，横滚会把它裁掉，而且排得下时也照裁。

**内容撑破行**的一批走 `overflow-wrap` 与给代码块表格加 `overflow-x`：`typography` / `markdown-stream` / `page-header` / `timeline` / `tool-call` / `download-trigger`。

**几处与断点无关的常量缺陷**一并收掉：`alert` 的 `content` 改 `flex: 1 1 0`（≤480px 时图标脱行、关闭叉掉到内容下方）、`slider` 两端刻度文案挂在轨道外、`image-cropper` 的滑杆没归零原生 `input[type=range]` 的 UA margin（任何宽度下恒溢出 4px）、`dialog` 的 `positioner` 内衬补 `max(令牌, env(safe-area-inset-*))`（刘海机横屏会压到刘海下）。

**`button-group` 刻意不折行**：它的段与段共边焊成一条，折行会把两端圆角切在中间。朝向应由使用者显式给 `data-orientation`，皮肤不偷偷翻。结论写进了皮肤注释与组件文档。

**已知代价**：`tabs` 折行之后，选中标签落在上面几行时指示条的纵向位置不对——机器只把主轴那一维写成内联样式，块向落点由皮肤钉在列表盒下沿。不折行时毫无变化。根治要让连接层把块向也量出来，属机器面改动。
