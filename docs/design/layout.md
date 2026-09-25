# 布局

布局的尺度只有一把尺：4px 网格。间距、控件高度、字段宽度、面的内衬、断点全部锚在它上面，组件里没有第二套数。

## 间距阶梯

<XhTokenTable
  kind="space"
  :names="['--xh-space-0_5', '--xh-space-1', '--xh-space-1_5', '--xh-space-2', '--xh-space-2_5', '--xh-space-3', '--xh-space-4', '--xh-space-5', '--xh-space-6', '--xh-space-7', '--xh-space-8']"
  :notes="{
    '--xh-space-0_5': '半阶补偿：图标基线、几何对齐',
    '--xh-space-1': '贴在一起的：标签贴控件、说明贴控件、图标贴文字',
    '--xh-space-1_5': '半阶补偿：紧凑控件',
    '--xh-space-2': '同一组里的相邻项：控件内图标与文字、集合标题与集合',
    '--xh-space-2_5': '半阶补偿',
    '--xh-space-3': '控件的行内内衬（md）',
    '--xh-space-4': '不同信息组之间',
    '--xh-space-6': '区块之间',
    '--xh-space-8': '页面级分段',
  }"
/>

规则：所有 padding、gap 与布局间距走令牌；2 / 6 / 10 只用于图标基线、紧凑控件与几何补偿，不出现 5 / 7 / 9 / 13 / 15 这类散值；信息关系越紧密间距越小，不同信息组至少提升一个档位。

面的内衬只走 `--xh-surface-*`（`px-sm / md`、`py-sm / md`、`pad-xs … lg`），页面分段走 `--xh-section-py-*`，布局组件的列隙走 `--xh-layout-gap-xs … xl`、列的最小宽走 `--xh-layout-col-min-xs … lg`。

## 控件高度与密度

| 密度 | sm | md | lg |
| --- | ---: | ---: | ---: |
| comfortable（缺省） | 32px | 36px | 40px |
| compact | 28px | 32px | 36px |

- md 是缺省尺寸；同一 `size` 不随断点自动改变高度。
- 图标按钮的视觉盒遵循同一高度；粗指针命中区至少 44×44px，用伪元素扩展，不改布局盒。
- 尺寸档同时换行内内衬（`--xh-control-px-sm / md / lg` = 8 / 12 / 16px）、内部间隙（`--xh-control-gap-*` = 4 / 8 / 12px）、字号（`--xh-control-font-*`）与图标（16 / 20 / 24px）。
- 密度（`data-density="compact"`）只收紧高度、内距与间隙，不缩字号和字形。
- 正方盒（Avatar、色块、图标包装）走 `--xh-control-box-sm / md / lg` = 32 / 40 / 48px。

## 字段的宽度

单行字段不传尺寸时一族同宽：根缺省 `inline-size: var(--xh-control-w)`（16rem），宽度不随内容走——选中一条很长的选项触发器也不变宽。另有一条底线 `--xh-control-min-w`（12rem）：字段被 flex / grid 容器压缩时收到这里为止，容器比底线还窄时收成容器宽，不越出去。要撑满表单列在根上写 `inline-size: 100%`。

例外只有登记过的几件：日期范围选择器起止两组按日的段位放不进 16rem，缺省按内容撑开；分格输入由格数与格宽定宽；对话输入条铺满宿主；表单字段（Field）的控件铺满表单列。槽名与放开方式见 [皮肤与样式分层 · 输入类控件的缺省宽度与最小宽度](/guide/styling#输入类控件的缺省宽度与最小宽度)。

## 断点

<XhTokenTable
  :names="['--xh-breakpoint-sm', '--xh-breakpoint-md', '--xh-breakpoint-lg', '--xh-breakpoint-xl']"
  :notes="{
    '--xh-breakpoint-sm': '手机横屏起',
    '--xh-breakpoint-md': '平板；浮层里的多列面板在此以下改单列',
    '--xh-breakpoint-lg': '桌面；Layout 的 siderBreakpoint 常取这一档，以下折叠侧栏',
    '--xh-breakpoint-xl': '宽桌面',
  }"
/>

断点只用 `min-width` 自窄到宽依次接管，写了哪档就在哪档切换；只在窄档生效的规则写它的补集 `not all and (min-width: …)`，不写 `max-width`（它在断点值上与 `min-width` 同时成立），也不写区间写法 `(width < …)`（Safari 16.4 起才认）。媒体查询不改选择器权重。多数"窄处坏掉"的问题不靠断点解决：flex-wrap、`min-inline-size: 0`、`overflow-wrap`、把死地板改成能让步的 `min(…, 100%)`，这些规则在窄视口与窄容器（1280 宽屏里的 260px 侧栏）两种情形下同时成立。

## 布局组件

| 组件 | 管什么 |
| --- | --- |
| [Layout](/components/layout) | 页面骨架：页头、侧栏、内容、页脚；侧栏可折叠、可在断点以下改成覆盖层 |
| [Flex](/components/flex) | 一维排列，间隙走 `--xh-layout-gap-*` |
| [Grid](/components/grid) | 二维栅格，列的最小宽走 `--xh-layout-col-min-*` |
| [Masonry](/components/masonry) | 瀑布流 |
| [Splitter](/components/splitter) / [Resizable](/components/resizable) | 可拖动分栏与可拖动尺寸 |
| [Separator](/components/separator) | 分隔线，取 `--xh-border-subtle` |
| [ScrollArea](/components/scroll-area) | 组件内滚动面，自绘条或原生细条按 [组件内滚动](/guide/theme#组件内滚动) 归档 |

## 表单排布

[Form](/components/form) 四种排布：`vertical`（缺省，纵向一列）、`horizontal`（标签左置两列，整表标签列宽由 `--xh-form-label-w` 统一对齐）、`inline`（横向一行流，放不下自动换行）、`grid`（等宽列网格，列数 1 – 4 逐断点声明，单个字段可跨列或占满整行）。字段标签贴控件 `--xh-space-1`，说明与错误文案同样 `--xh-space-1`，字段与字段之间走 `--xh-form-gap`（缺省 `--xh-stack-gap-md`）。

## 浮层尺寸

锚定浮层的宽高走 `--xh-overlay-*`：面板最小宽 12rem、菜单最小宽 10rem、最大宽 sm / md / lg / xl = 16 / 20 / 24 / 48rem、菜单最大高 20rem；Dialog 的 sheet 宽 sm / md / lg = 24 / 32 / 48rem，Drawer 宽 sm / md / lg = 16 / 20 / 28rem。锚定浮层同时接可用高度与可用宽度：视口放不下时先收自己，再翻面。

## 相关

- [形状与边界](/design/shape) · [字体](/design/typography)
- 指南：[皮肤与样式分层](/guide/styling) · [浮层定位](/guide/position)
