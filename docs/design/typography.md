# 字体

组件不指定正文字族：皮肤里写的是 `font-family: inherit`，控件与面板跟着宿主页面的字走，库只定等宽字族、字号阶梯、字重、行高与排版角色。层级由字号、字重、行高和间距共同表达，不能只调颜色。

## 字族

<XhTokenTable
  :names="['--xh-font-family-mono']"
  :notes="{ '--xh-font-family-mono': '代码、密钥、哈希、快捷键：Kbd、Clipboard、CodeView、JsonViewer、Typography 的 code' }"
/>

正文字族由宿主决定。文档站用的是 Inter 与系统无衬线字，那是文档站的选择，不是库的默认。中后台产品建议用系统字栈（`-apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif` 一类），数字密集的表格与统计面板打开 `font-variant-numeric: tabular-nums`——NumberField、Statistic、Timer、Timestamp、Clipboard、分段日期与时间框已自带。

## 字号阶梯

七档，以 `rem` 记，随宿主根字号缩放：

<XhTokenTable
  kind="text"
  :names="['--xh-font-size-xs', '--xh-font-size-sm', '--xh-font-size-md', '--xh-font-size-lg', '--xh-font-size-xl', '--xh-font-size-2xl', '--xh-font-size-3xl']"
  :notes="{
    '--xh-font-size-xs': '12px · 次级标注：计数、快捷键、时间戳、序号',
    '--xh-font-size-sm': '13px · 说明、错误文案、sm 档控件',
    '--xh-font-size-md': '14px · 正文、标签、md 档控件',
    '--xh-font-size-lg': '16px · lg 档控件',
    '--xh-font-size-xl': '18px · 三级标题：Dialog、Drawer、Tour 的面板标题',
    '--xh-font-size-2xl': '22px · 二级标题',
    '--xh-font-size-3xl': '28px · 一级标题',
  }"
/>

控件字号随尺寸档：`--xh-control-font-sm / md / lg` = 13 / 14 / 16px；控件里的次级文字（提示、计数、快捷键、清空钮、标签项）取 `--xh-control-caption-*`，比同档主文字低一级。密度不改字号。

## 字重与行高

<XhTokenTable
  :names="['--xh-font-weight-regular', '--xh-font-weight-medium', '--xh-font-weight-semibold', '--xh-font-weight-bold', '--xh-leading-none', '--xh-leading-tight', '--xh-leading-normal', '--xh-leading-relaxed']"
  :notes="{
    '--xh-font-weight-regular': '正文',
    '--xh-font-weight-medium': '字段标签、集合标题、当前页的面包屑',
    '--xh-font-weight-semibold': '面板标题、各级标题、总览卡片标题',
    '--xh-font-weight-bold': '只给 Typography 的加粗与个别强调（Alert 标题、日历的今天）',
    '--xh-leading-none': '单行标签、控件内文字',
    '--xh-leading-tight': '标题、色板标注',
    '--xh-leading-normal': '正文、说明',
    '--xh-leading-relaxed': '长文（Typography 的段落）',
  }"
/>

## 排版角色

皮肤按角色取值，不直接取字号原语；门禁 `check-text-role` 逐条核。

| 角色 | 字号 / 字重 / 颜色 | 与相邻元素的间距 |
| --- | --- | --- |
| 字段标签（单字段与 Slider、Rating、Signature、Color* 等复合单字段） | `--xh-text-label-size` 14 / `--xh-text-label-weight` 500 / `--xh-fg-default` | 贴控件 `--xh-space-1` |
| 集合标题（RadioGroup、CheckboxGroup、Listbox、Tree、TagGroup、Descriptions） | 14 / 500 / `--xh-fg-muted` | 与集合 `--xh-space-2` |
| 整行控件的标签（Checkbox、Switch） | 随档 `--xh-control-font-sm / md / lg` / regular / `--xh-fg-default`，禁用 `--xh-fg-subtle` | 与方框 `--xh-space-2` |
| 说明 / helper | `--xh-text-secondary-size` 13 / `--xh-fg-muted` / `--xh-leading-normal` | 与控件 `--xh-space-1` |
| 错误文案 | 13 / `--xh-fg-danger` | 与控件 `--xh-space-1` |
| Surface / Feedback / 浮层内标题 | 14 / `--xh-font-weight-semibold` | — |
| 页面级面板标题（Dialog、Drawer、Tour） | heading-3（`--xh-text-heading-3-*`） | — |
| 次级标注（计数、快捷键、时间戳、序号） | `--xh-text-caption-size` 12 | — |
| 代码 | `--xh-font-family-mono` / `--xh-text-code-leading` 1.5rem | — |

必填星号与错误文案是公共层规则：`--xh-glyph-mark-required` + `--xh-space-1` + `--xh-fg-danger`，自带标签的字段不各画一套；禁用标签色统一 `--xh-fg-subtle`；单行标签 `--xh-leading-none`。

## 文案

- 标签是名词或名词短语，不带冒号；说明是一句完整的话，句末不加句号；错误文案说清楚"怎么改"，不只说"格式不对"。
- 按钮是动词或动宾短语（"保存"、"删除标签"），主要动作只有一个；破坏性动作用 danger 语气并在 Popconfirm 里二次确认。
- 空状态说清楚"为什么空"与"下一步做什么"，[EmptyState](/components/empty-state) 自带动作位。
- 数字用 `tabular-nums` 对齐，时间用 [Timestamp](/components/timestamp) 按本地化格式化，不手拼。

## 相关

- [布局](/design/layout) · [图标](/design/icons)
- 指南：[设计令牌与主题 · 排版角色](/guide/theme#排版角色) · [国际化](/guide/i18n)
