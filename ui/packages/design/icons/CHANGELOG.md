# @xihan-ui/icons

## 1.0.0-preview.0

## 1.0.0-alpha.3

### Minor Changes

- f154e07: 组件自带的兜底字形改为真正的图标：勾、半选横杠、展开箭头、清空与关闭的叉、排序方向、加减号、翻页箭头、图片查看器工具条这些，原先要么是皮肤里的 Unicode 字符（`✓ ▾ ✕`，跨字体跨系统长得各不一样），要么由作者在每个部件里手打一个字符。现在统一走 `--xh-glyph-mark-*` 一族二十个令牌，取值是图标包里对应 SVG 的 `url("data:image/svg+xml,…")`，皮肤拿它当 `mask-image`、用 `currentColor` 着色——随语气、悬停、禁用自动变色，与 `<XhIcon>` 画出来的一模一样。令牌的 `$type` 为 `icon`、`$value` 是图标名，构建期从图标包读 SVG 内联，改图标只改一处。

  使用者换图标有两条路：在 `:root` 上重声明令牌即全局换，写在任意容器上即只换那一块（任何 SVG 都行，着色一样走 `currentColor`）；或者往部件里放自己的节点，皮肤那条 `:empty` 守卫即不命中。兜底覆盖面从 14 份皮肤扩到 39 份：此前 tree / tree-select / table / toast / dialog / drawer / number-field / carousel / transfer / image-viewer 等二十个组件的把手空着就什么都不画，文档示例只好逐个手打字符；现在示例里的 960 处手打字符全部删掉，由皮肤画。命令式 toast / dialog 的类型徽记与 `XhToastCloseTrigger`、`XhImageViewer*Trigger` 的默认内容同样改走这族令牌。

  图标包新增 `info` / `rotate-left` / `rotate-right` / `flip-horizontal` / `flip-vertical` 五枚。`check-glyph-slots` 门禁禁止皮肤里再写字面字形，并双向核对令牌与用处（适配器里的 JS 默认模板也算）。

## 1.0.0-alpha.2

### Minor Changes

- 271cee6: `@xihan-ui/icons` 新增 SVG → `IconRecord` 的构建期转换器：`xihan-icons` 命令与 `@xihan-ui/icons/codegen` 子路径。首方集保持小而准，图标由使用者自带——把任意 SVG 目录交给转换器，产出可摇树的运行期模块（`--dts` 一并出类型）。属性层走宽松模式（`class` / `width` / `height` 等丢弃并记进 `notes`），标签层仍严格（`<use>` / `<text>` / `<style>` 报错，因为收下就是产出一枚画错的图标），非 24 网格的源按比例归一到 24。三套真实集实测：Lucide 2025/2025、Tabler outline 5130/5130、Bootstrap Icons 2077/2078。
- b261b5d: 首方图标集扩到覆盖中后台界面的常用语义：新增 134 枚手绘图标，分方向与布局、文件与文档、文本编辑、媒体与设备、通信、状态与安全、数据与图表、系统与账户、商业场景九类。全部走严格模式管线，24 网格、2 粗描边、round 端点与连接，与既有的 45 枚同一手感。摇树不受影响——只引一枚仍是 149 B（gzip），整集合体积门禁由 2.2 kB 调到 8 kB。

### Patch Changes

- 1e85f27: 补 16 枚常用图标，并把体积棘轮改成量使用者真正下载的那个数。

  原先 29 枚全是箭头 / 勾叉 / 增删这类结构性图元，给站点加一个主题开关——最普通不过的需求——
  太阳、月亮、显示器一枚都没有。曦寒官网因此在自己仓里手抄了三条 `IconRecord`。

  新增 16 枚，判据是真实界面的高频缺口，不求成套：

  | 用途               | 图标                             |
  | ------------------ | -------------------------------- |
  | 主题开关           | `sun` `moon` `monitor`           |
  | 导航与链接         | `menu` `external-link`           |
  | 分页首末           | `chevrons-left` `chevrons-right` |
  | 日期时间选择器触发 | `calendar` `clock`               |
  | 与 `upload` 配对   | `download`                       |
  | 密码显隐           | `eye` `eye-off`                  |
  | 表格列筛选         | `filter`                         |
  | 删除与重试         | `trash` `refresh`                |
  | 通知               | `bell`                           |

  体积条目同时改了形状。原先 `icons` 量的是整包 `dist/index.mjs`，而这个包 `sideEffects: false`、
  每枚一个顶层 `export const`，摇树是真的——实测集合 29 枚与 45 枚时，`import { CheckIcon }`
  都是 149 B，一字不差。也就是说那条棘轮量的是**任何使用者都不会下载的数**，却随集合线性增长，
  1.4 kB 的上限只够再放几枚，把「补图标」变成了体积违规。

  现在拆成两条，各自量一件有意义的事：`icons：只用 CheckIcon` 走贴身摇树写法（与适配器条目同款）
  守住使用者的实付成本，`icons：整集合` 保留整包口径守住「每枚图标的边际开销别失控」。

## 1.0.0-alpha.1

## 1.0.0-alpha.0

### Major Changes

- 84b1aa3: 新增 Icon 原语，`@xihan-ui/icons` 整包重写为首方图标集。

  旧的 `@xihan-ui/icons` 是 27 个第三方图标集的聚合（约四万个图标），已整体移除并在
  npm 上弃用。新包只收自研图标，第一批 29 个覆盖组件库自用的全部语义，24×24 单色
  描边、`stroke-width` 2。

  用法：

  - `@xihan-ui/kernel` 导出 `IconRecord` / `IconNode` / `IconTag` 三个类型
  - `@xihan-ui/headless` 导出 `connectIcon` / `iconAnatomy` / `iconMeta` / `iconKeyboard`
  - `@xihan-ui/vue` 导出 `XhIcon`，`@xihan-ui/web-components` 注册 `<xh-icon>`
  - `@xihan-ui/styles` 新增 `icon.css`，`data-size` 与 `data-weight` 各三档

  图标记录是结构化节点数组而不是 SVG 字符串，渲染端逐节点建元素，运行期不经 HTML
  解析器。图标数据传的是记录本身而不是名字：按名字查表要把全表静态引进来，摇树会
  整个失效。

  WC 侧要在 `<svg data-xh-part="root">` 里留一个空的 `<g data-xh-part="glyph"></g>`
  作为授权点，元素只在它内部铺图元；不留这个空壳就一个节点都不动，手写内联 SVG 与
  `<use>` 引用两种写法因此都还能用。`icon` 是对象，只能走 property 传，属性里写不出来。

  可及名字两态互斥：`label` 给了非空白文本就输出 `role="img"` 与 `aria-label`，否则
  输出 `aria-hidden="true"`。只有图标的按钮请把名字写在按钮上而不是图标上，两处都写
  读屏会念两遍。
