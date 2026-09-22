来源：https://ui.docs.xihanfun.com/design/icons

# 图标

图标是界面里最小的一种"字"：跟着文字的字号、颜色与基线走，不自己发光。库里有两条图标通道——使用者放进部件的图标（`@xihan-ui/icons` 或任何 SVG 集）与皮肤自绘的兜底字形（`--xh-glyph-mark-*`），两条通道取同一把尺、同一支颜色。

## 首方图标集

`@xihan-ui/icons` 是一套结构化数据：每枚图标是名字、`viewBox` 与若干节点，渲染端逐节点创建元素，运行期不解析字符串。首方集覆盖中后台的常用语义，逐枚手绘、统一 24 网格与 2 粗描边，按方向与布局、文件与文档、文本编辑、媒体与设备、通信、状态与安全、数据与图表、系统与账户、商业场景分组。它不打算穷尽：换 Lucide、Tabler 或自绘集，把 SVG 目录交给转换器即可，打包器按引用逐枚摇树。用法与转换见 [图标集](/guide/icons)。

## 尺寸随控件档

<XhTokenTable
  :names="['--xh-glyph-size-text', '--xh-glyph-size-sm', '--xh-glyph-size-md', '--xh-glyph-size-lg', '--xh-glyph-size-xl', '--xh-glyph-size-2xl', '--xh-glyph-size-3xl', '--xh-glyph-size-4xl']"
  :notes="{
    '--xh-glyph-size-text': '随文 1em：只给 Tag、Kbd、Breadcrumb、Typography、Highlight 这类纯行内文字组件',
    '--xh-glyph-size-sm': 'sm 档控件内图标',
    '--xh-glyph-size-md': 'md 档控件内图标（缺省）',
    '--xh-glyph-size-lg': 'lg 档控件内图标',
    '--xh-glyph-size-xl': '面板与卡片的题图',
    '--xh-glyph-size-2xl': '空状态、结果页的插图位',
    '--xh-glyph-size-3xl': '大插图',
    '--xh-glyph-size-4xl': '特大插图',
  }"
/>

- 控件内图标随 `size` 档取 16 / 20 / 24px：Action Control、Field Chrome、Collection Item 三份配方按档下发 `--xh-icon-size`，皮肤缺省值只能是 `var(--xh-<组件>-icon-size, var(--xh-glyph-size-md))` 并随 `data-size` 换档。
- 描边三档 `--xh-glyph-stroke-light / regular / bold` = 1.5 / 2 / 2.5px；行内图标以 `--xh-glyph-baseline-shift`（-0.125em）压回文字基线。
- 图标颜色一律 `currentColor`：随语气、悬停、禁用与前景一起变，不单独上色。

## 兜底字形

作者没向部件放内容时，皮肤画一个默认字形：勾、叉、加减号、展开箭头、排序方向、必填星号。它们不是字符，是图标包里对应 SVG 的 `data:` URI，皮肤拿它当 `mask-image`、以 `currentColor` 着色——与用 `<XhIcon>` 放进去的结果一致。

| 令牌 | 用途 |
| --- | --- |
| `--xh-glyph-mark-check` | 各列表族的条目勾、多选框、树、穿梭框、表格勾选把手、步骤条已完成 |
| `--xh-glyph-mark-minus` · `-plus` | 半选横杠；数字框的减号、加号；悬浮按钮 |
| `--xh-glyph-mark-close` | 清空钮、关闭钮、标签与文件条目的删除钮 |
| `--xh-glyph-mark-chevron-*` · `-chevrons-*` | 展开箭头、树与侧栏的分支把手、翻页、回到顶部 |
| `--xh-glyph-mark-arrow-up` · `-arrow-down` · `-sort*` | 排序方向 |
| `--xh-glyph-mark-info` · `-warning` | 命令式 dialog / notification 的类型徽记，toast 的状态字形 |
| `--xh-glyph-mark-edit` · `-download` · `-star` · `-eye` · `-eye-off` · `-calendar` · `-clock` · `-ellipsis` · `-play` · `-pause` | 就地编辑、下载、评分、密码明暗、日期与时间触发器、更多、轮播播放 |
| `--xh-glyph-mark-zoom-*` · `-rotate-*` · `-flip-*` · `-maximize` · `-restore` | 图片查看器与浮动面板的工具条 |
| `--xh-glyph-mark-required` | 必填星号（这是文字 `*`，不是图标） |

换整套兜底字形只需覆盖这些令牌；单个部件放了作者内容时兜底字形自动让位。

## 怎么用

- 图标与文字同框时，图标贴文字 `--xh-space-1`（控件内）或 `--xh-space-2`（条目内），由家族配方给出，不手写。
- 只有图标的按钮必须有可访问名称（`aria-label`），走 Action Control 的 `icon` 档：正方视觉盒与控件同高。
- 状态不能只靠图标或颜色：错误、成功与警告同时给文案或结构通道。
- 装饰性图标 `aria-hidden`；承担语义的图标给 `role="img"` 与名称。首方集与转换器都保留这两条路径。

## 相关

- [字体](/design/typography) · [组件家族与模式](/design/patterns)
- 指南：[图标集](/guide/icons) · 组件：[Icon](/components/icon) · [IconWrapper](/components/icon-wrapper)
