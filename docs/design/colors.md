# 色彩

颜色分三层：**基础色板**（primitive，只声明一次的原始值）、**语义角色**（semantic，`bg-*` / `fg-*` / `border-*` / `ring-*`，皮肤只消费这一层）、**组件覆盖槽**（`--xh-<组件>-*`）。这一页讲前两层怎么定，以及它们之间的对比度判据。产物与引入方式见[设计令牌与主题](/guide/theme)。

## 色彩模型

所有颜色写成 `oklch(L C H)`，不用 hex / hsl。OKLCH 的明度 L 是感知均匀的：同一 L 的不同色相看起来一样亮，对比度只由 L 决定。于是整套色板可以只定一条明度曲线，换色相不改对比度；深色主题不是逐色手调，而是沿同一条曲线反向取档。

## 基础色板

十二个色相，每个色相 11 档（50 – 950）。每档的明度与彩度取品牌曲线的基线，彩度再按该档明度与色相收进 sRGB 色域。色相 258 那一族（indigo）与品牌色逐值相同——品牌就是色板里的一员。

<XhTokenSwatches prefix="--xh-color-red-" label="red · 25" />
<XhTokenSwatches prefix="--xh-color-orange-" label="orange · 50" />
<XhTokenSwatches prefix="--xh-color-amber-" label="amber · 70" />
<XhTokenSwatches prefix="--xh-color-yellow-" label="yellow · 95" />
<XhTokenSwatches prefix="--xh-color-lime-" label="lime · 125" />
<XhTokenSwatches prefix="--xh-color-green-" label="green · 149" />
<XhTokenSwatches prefix="--xh-color-teal-" label="teal · 180" />
<XhTokenSwatches prefix="--xh-color-cyan-" label="cyan · 215" />
<XhTokenSwatches prefix="--xh-color-blue-" label="blue · 237" />
<XhTokenSwatches prefix="--xh-color-indigo-" label="indigo · 258（= brand）" />
<XhTokenSwatches prefix="--xh-color-purple-" label="purple · 302" />
<XhTokenSwatches prefix="--xh-color-pink-" label="pink · 345" />

怎么读这张色板：

- **同一档跨色相同一明度。** 600 档 L 0.546，任何色相的 600 档上铺白字都过 3:1（大字与图形档），700 档上铺白字都过 4.5:1；50 – 200 档上铺 `--xh-fg-default` 正文超过 9:1，100 档上铺同色相的 700 档文字过 4.5:1。给数据图、标签、头像按颜色点名时，换色相不必重算对比度。
- **600 是锚点。** 实心底取 600（配白字的正文档取 700），悬停 700、按下 800；淡底取 100 / 200，淡底上的文字取 700。
- **黄、青这类天然明亮的色相中档偏沉。** 这是"同档同明度"的代价：要一块亮黄，取 200 / 300 档，而不是把 600 调亮。
- **皮肤不直接消费色板。** 组件皮肤只认语义角色与语气轴；色板给使用者、数据可视化与自定义语气用。

色板由 `packages/design/tokens/build/emit-palette.mjs` 从 `tokens/palette.seeds.json` 的十二个色相角派生，改色相只改种子；`tests/palette.spec.ts` 逐档核对生成物、明度与运行时 `deriveBrandScale` 同源。

## 中性色板

十六档，含 450 / 550 / 650 / 750 四个半档：中性色承担文字、背景、边界三种角色，正文与次要文字、装饰边与控件边、面与抬起的面之间常常只差半档，整档跳会太跳。

<XhTokenSwatches prefix="--xh-color-neutral-" />

| 档 | 浅色主题里的角色 | 深色主题里的角色 |
| --- | --- | --- |
| 0 / 50 | 面（`--xh-bg-surface`）与页面底（`--xh-bg-page`） | 反白前景 |
| 100 – 300 | 淡底与三档边线（subtle 100 / default 200 / strong 300） | — |
| 400 / 550 / 600 | 禁用字 / 次要字 / 正文次级 | — |
| 700 / 800 | — | 装饰边（default 700）与淡底 |
| 900 / 950 | 正文（950） | 面（900）与页面底（950） |

## 品牌色

品牌色不是一枚颜色，是一条从种子派生出来的 11 档梯度。派生只取种子的色相与彩度，明度曲线原样保留——语义层与语气层建立在明度之上的对比度保证，对任何种子都成立。

<XhTokenSwatches prefix="--xh-color-brand-" />

```ts
import { registerBrand } from "@xihan-ui/tokens/runtime";

// 种子锚定在 600 档，即实心底与强调文字用的那一档
const dispose = registerBrand("ocean", "oklch(0.546 0.16 215)");
document.documentElement.dataset.brand = "ocean";
```

`registerBrand` 把 `[data-brand='ocean']` 取值块注进文档；不透明的任何 CSS 颜色都能当种子，落在 sRGB 色域外的彩度逐档收进来。切换品牌只换 `data-brand`，品牌淡底（12% / 20% / 28% 拼色）、焦点环、指示条全部跟着走。运行时 API 见 [皮肤与样式分层 · 切换品牌色](/guide/styling#切换品牌色)。

## 功能色

四种语气各有一族原语，档位按"每一档要落在哪块面上"逐档验过对比度，不与基础色板共用曲线：黄族到 700 档也只有 3.75:1，够不着高对比档的判据，因此 warning 的 600 以上把色相从 86 转到 70。

| 语气 | 原语 | 与基础色板的关系 | 典型用途 |
| --- | --- | --- | --- |
| danger | `--xh-color-danger-400 … 700` | 色相 25，同 red | 破坏性动作、校验失败、错误状态 |
| success | `--xh-color-success-500 … 700` | 色相 149，同 green | 完成、通过、在线 |
| warning | `--xh-color-warning-400 … 800` | 色相 86 → 70，介于 amber 与 yellow | 需要注意但不阻断 |
| info | `--xh-color-info-500 … 700` | 色相 237，同 blue | 中性提示、进行中 |

<XhTokenSwatches prefix="--xh-color-danger-" label="danger" />
<XhTokenSwatches prefix="--xh-color-success-" label="success" />
<XhTokenSwatches prefix="--xh-color-warning-" label="warning" />
<XhTokenSwatches prefix="--xh-color-info-" label="info" />

danger 动作与 error 状态分开定义，不共用业务语义；状态色表达任务结果，不表达空间层级。

## 语义角色

皮肤只消费这一层。每个实色底都配了前景（`--xh-fg-on-brand`、`--xh-tone-on`），组件不自行计算文字色。取值随 `data-theme` 翻转，下面的色块画的是当前主题。

### 背景

<XhTokenTable
  kind="color"
  :names="['--xh-bg-page', '--xh-bg-canvas', '--xh-bg-surface', '--xh-bg-surface-raised', '--xh-bg-subtle', '--xh-bg-subtle-hover', '--xh-bg-subtle-active', '--xh-bg-muted', '--xh-bg-subtle-opaque', '--xh-bg-subtle-hover-opaque', '--xh-bg-subtle-active-opaque', '--xh-bg-muted-opaque', '--xh-bg-brand', '--xh-bg-brand-hover', '--xh-bg-brand-active', '--xh-bg-brand-subtle', '--xh-bg-brand-subtle-hover', '--xh-bg-brand-subtle-active', '--xh-bg-overlay']"
  :notes="{
    '--xh-bg-page': '页面底：面之下那一层，铺满视口',
    '--xh-bg-canvas': '不透明画布：自动填充遮罩、色块选中环等必须不透明的地方；控件盒静息不再填它',
    '--xh-bg-surface': '静态内容面缺省底',
    '--xh-bg-surface-raised': '抬起的面：Card、滑块',
    '--xh-bg-subtle': '淡底；白底上的 hover',
    '--xh-bg-subtle-hover': '白底上的 pressed；淡底上的 hover',
    '--xh-bg-subtle-active': '淡底上的 pressed，只留给按下',
    '--xh-bg-muted': '禁用实心钮退到的中性面',
    '--xh-bg-subtle-opaque': '淡底的不透明档：要盖住下层内容的面（吸顶表头、浮动钮、层叠头像）',
    '--xh-bg-subtle-hover-opaque': '淡底 hover 档的不透明档',
    '--xh-bg-subtle-active-opaque': '淡底 active 档的不透明档',
    '--xh-bg-muted-opaque': '中性面的不透明档',
    '--xh-bg-brand': '主要动作实心底',
    '--xh-bg-brand-subtle': '选中 / 当前专属，12% 品牌拼色',
    '--xh-bg-overlay': '模态遮罩',
  }"
/>

### 前景

<XhTokenTable
  kind="color"
  :names="['--xh-fg-default', '--xh-fg-muted', '--xh-fg-subtle', '--xh-fg-disabled', '--xh-fg-on-brand', '--xh-fg-on-brand-subtle', '--xh-fg-brand', '--xh-fg-brand-strong', '--xh-fg-success', '--xh-fg-warning', '--xh-fg-info', '--xh-fg-danger']"
  :notes="{
    '--xh-fg-default': '正文',
    '--xh-fg-muted': '次要文字、说明',
    '--xh-fg-subtle': '占位、禁用标签',
    '--xh-fg-disabled': '禁用文字，对画布不低于 2.5:1',
    '--xh-fg-on-brand': '实心品牌底上的字',
    '--xh-fg-on-brand-subtle': '品牌淡底上的字',
    '--xh-fg-brand': '普通底上的品牌文字与对号',
  }"
/>

### 边界与焦点环

<XhTokenTable
  kind="color"
  :names="['--xh-border-default', '--xh-border-default-opaque', '--xh-border-subtle', '--xh-border-strong', '--xh-border-control', '--xh-border-control-hover', '--xh-border-control-focus', '--xh-border-invalid', '--xh-ring-focus', '--xh-ring-invalid']"
  :notes="{
    '--xh-border-default': '一切根面外边与 raised 面描边',
    '--xh-border-default-opaque': '装饰边的不透明档：压在任意内容上、必须自带浅框的部件（滑杆拇指）',
    '--xh-border-subtle': '只作内部分隔线',
    '--xh-border-strong': '只作高对比档与刻意登记的强调边',
    '--xh-border-control': '控件边界，缺省档与 border-default 同色；高对比档才加深到 3:1',
    '--xh-border-control-hover': '控件悬停边',
    '--xh-border-control-focus': '聚焦边，与焦点环同色、不随语气',
    '--xh-ring-focus': '公共键盘焦点环，对画布、面与淡底都 ≥ 3:1',
  }"
/>

## 语气轴

`data-tone` 是六族语气的切换轴：brand、neutral、danger、warning、success、info。写在任何节点上，节点内即可取到整族 `--xh-tone-*`：实心底、实心底上的前景、淡底、淡底文字、描边、控件边界。组件按语气换色只经这条轴，不自行挑原语。取用方式与全表见 [皮肤与样式分层 · 在自定义节点上使用语气](/guide/styling#在自定义节点上使用语气)。

## 彩色面与墨色域

组件放在彩色区块上时，在区块上声明它的底色极性。域内的中性描边、淡底与交互阶梯改取墨色（浅底为纯黑、深底为纯白）按比例透明，正文、焦点环与主要动作取墨色本身。不透明的中性灰在彩色底上显著度随底色变化十几倍（neutral 200 描边在黄底上 1.06:1、黑底上 16.68:1）；墨色在任何底色上显著度一致，颜色取底色自身的深浅变体。

<XhDemo src="ink/01-domains" />

| 声明 | 含义 |
| --- | --- |
| `data-xh-ink="dark"` | 浅色底，黑墨；区块同时是浅色主题边界，语气色、表面与原生控件取浅色档 |
| `data-xh-ink="light"` | 深色底，白墨；区块同时是深色主题边界 |
| `data-xh-ink="auto"` + `--xh-ink-surface` | 由底色的相对亮度按 0.179 选墨（与语气实心底的黑白字同一分界）；只决定墨色与中性装饰，语气色与表面沿用外层主题。需要相对颜色语法（Chrome 119、Firefox 128、Safari 16.4 起），更早的引擎里等于未声明 |
| `data-xh-ink-margin="ample"` | 底色离分界足够远（黑墨时相对亮度 ≥ 0.5，白墨时 ≤ 0.05），次要文字与占位取墨色 72%；缺省时它们等于墨色，层级只靠字号与字重 |

<XhDemo src="ink/02-auto" />

- 没声明域的地方同样用墨色表达描边与淡底：墨色取主题极性（浅色档纯黑、深色档纯白），所以作者自己的彩色区块即使不声明，描边、分隔与淡底也是底色自身的深浅变体，只有文字需要声明域。置灰字属于文字，同样只在域里换成墨色。
- 比例不手填，按「与原中性色对比度相等」求：描边在页面底、画布、缺省面与对话框面上各求一个比例取最大值，哪种面上都不比原来淡；淡底只按缺省面求，压在上面的字与焦点环对比度不降。浅色档描边约 10%、淡底约 4%，与原中性色一致；深色档描边 22%（卡片面上比原来略重）、淡底约 6%。
- 淡底是半透明的，叠在别的淡底上会加深。要盖住下层内容的面（粘性表头、固定列、浮在内容上的钮）取 `-opaque` 档：同一比例的墨色叠在缺省面上的实色。
- 放文字的彩色面避开相对亮度 0.15–0.24：neutral 950 与 neutral 50 在这一段都到不了 4.5:1，只有纯黑、纯白勉强达标。品牌色阶 500 落在其中，浅色档的品牌实心因此取 600。
- 域内的品牌实心换成墨色实心，文字取 `--xh-ink-surface`（未提供时取与墨色相反的纯白 / 纯黑）；选中面换成墨色 12%。语气色保留自己的实心或淡底面。
- 高对比档（`data-contrast="more"`）下域内描边回到实色；强制色下取系统色。
- 浮层经 Portal 渲染到文档末尾，不在域内：弹出的菜单、选择面板保持自己的材质。
- 声明了域的区块，底色取原语（如 `--xh-color-indigo-800`）或在区块外取值。`--xh-bg-brand`、`--xh-fg-default` 这类令牌在域内被改写为墨色，区块用它们画自己的底，底色会随域翻转。

库自己渲染的彩色面自动成为域，不需要声明：实心按钮与实心标签、Tooltip 反白面里的内容按那块面的底色取墨色（与作者的 `auto` 同一套规则，面自身的底色不变），ImageViewer 的看片层整层是白墨域。把快捷键、分隔线或小徽标放进这些面时，它们的描边与淡底不会是一块不透明的灰。

## 对比度判据

判据写在 `packages/design/tokens/tests/contrast.spec.ts`，改令牌先过它：

| 组合 | 门槛 |
| --- | --- |
| 正文 / 次要文字对画布、面、淡底 | ≥ 4.5:1（WCAG 1.4.3 AA） |
| 焦点环对画布、面、品牌淡底 | ≥ 3:1（WCAG 1.4.11） |
| 语气实心底与淡底上的文字 | ≥ 4.5:1，六族 × 明暗逐一核 |
| 控件边界 `--xh-border-control` | 缺省档与装饰边同色（1.26:1，设计决定）；`data-contrast="more"` 下 ≥ 3:1；悬停档按棘轮不许更淡 |
| 装饰边 default / subtle / strong | 不在 1.4.11 范围内，但按棘轮钉住，不许悄悄变淡 |
| 禁用文字 | 1.4.3 豁免，只钉住对画布不低于 2.5:1 |

控件边界这一条是刻意的取舍：输入框壳、勾选框、单选圈与旁边的浮层面板、卡片描边同一重量，页面里只有一种边线；缺省档靠占位文字、标签与聚焦环辨认控件，需要 3:1 边界的场景打开高对比档。

## 数据色板

热力图这类按颜色点名的组件走 `data-palette` 轴，六个色板各取一族的满档：green（success 600）、blue（info 600）、orange（warning 600）、purple（基础色板 purple 600）、red（danger 600）、gray（中性 600，深色档换 450）。色阶从 `--xh-bg-subtle` 到满档逐档明度严格单调，明暗两套都验过。更多颜色点名的场景直接取基础色板。

## 相关

- [暗黑模式](/design/dark)：语义角色怎么翻转
- [设计令牌与主题](/guide/theme) · [皮肤与样式分层](/guide/styling)
