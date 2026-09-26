来源：https://ui.docs.xihanfun.com/design/dark

# 暗黑模式

深色不是把浅色反相。皮肤从头到尾只写语义令牌，`data-theme="dark"` 换掉的是语义层的取值：面往中性色阶的暗端走、品牌往亮端走、投影换成纯黑加一条浅色上沿。切主题时没有一行组件 CSS 需要改。

## 一条轴，七条轴

明暗只是视觉环境七条轴里的一条。它们由同一个控制器维护、投影成根元素上的一组属性，Portal 出去的浮层由 Core 桥接同一组值：

```html
<html data-theme="dark" data-brand="xihan" data-density="compact" data-contrast="more" data-motion="reduce" data-transparency="reduce" dir="rtl">
```

| 轴 | 取值 | 管什么 |
| --- | --- | --- |
| `data-theme` | `light` / `dark`（偏好可写 `system`，跟 `prefers-color-scheme`） | 整套语义取值 |
| `data-brand` | 注册过的品牌 id | 换整套品牌原语梯度 |
| `data-density` | `comfortable` / `compact` | 控件高度、内距与间隙；不缩字号和字形 |
| `dir` | `ltr` / `rtl` | 逻辑属性驱动的布局镜像 |
| `data-contrast` | `default` / `more`（偏好可写 `system`） | 加强边界：控件边界升到 3:1、装饰边加深、材质提高不透明度 |
| `data-motion` | `default` / `reduce`（偏好可写 `system`） | 局部关闭位移与缩放动效 |
| `data-transparency` | `default` / `reduce`（偏好可写 `system`） | 磨砂材质切成实体配方 |

主题与对比度可以分别落在不同层级：每一层采用最近的 `data-theme` 与 `data-contrast`，子主题不撤销祖先的高对比；深色取值块里声明了 `color-scheme`，嵌套深色区域的原生控件也跟着走。接法见 [设计令牌与主题 · 八轴视觉环境运行时](/guide/theme#八轴视觉环境运行时)。

## 语义角色怎么翻

| 角色 | 浅色 | 深色 | 为什么这样 |
| --- | --- | --- | --- |
| `--xh-bg-page` | neutral 50 | neutral 950 | 页面底始终比面低一档 |
| `--xh-bg-surface` | neutral 0 | neutral 900 | 面 |
| `--xh-bg-surface-raised` | neutral 0 | neutral 750 | 深色档取半档 750，与淡底差一道明度，抬起面上取淡底的部件静态时才有身形 |
| `--xh-bg-subtle` → `-hover` → `-active` | 100 → 200 → 300 | 800 → 700 → 650 | 交互阶梯在深色档往亮端走 |
| `--xh-bg-brand` → `-hover` → `-active` | brand 600 → 700 → 800 | brand 500 → 400 → 300 | 深底上品牌往亮端走才有对比 |
| `--xh-bg-brand-subtle` | 12% 品牌兑 surface | 12% 品牌兑 surface（neutral 900） | 兑 canvas（950）只得 L 0.202，比面还暗；兑面才比面亮一档 |
| `--xh-fg-default` / `-muted` / `-subtle` / `-disabled` | 950 / 600 / 550 / 400 | 50 / 400 / 450 / 600 | 层级同向，比值逐条核 |
| `--xh-fg-on-brand` | neutral 0 | neutral 950 | 深色档品牌实心底是 brand 500，白字够不着 4.5:1，改深字 |
| `--xh-border-default` / `-subtle` / `-strong` | 200 / 100 / 300 | 700 / 800 / 600 | 装饰边留在 700：往下半档 750 与淡底只差 1.04，热力图格子的描边会与空格连成一片 |
| `--xh-border-control` | = default | = default | 控件边界与装饰边同一条规则 |
| `--xh-ring-focus` | brand 600 | brand 400 | 对画布、面、淡底都 ≥ 3:1 |

下面这几块画的是当前主题的取值，切换文档站右上角的明暗看它们翻转：

<XhTokenSwatches prefix="--xh-bg-" :steps="['page', 'surface', 'surface-raised', 'subtle', 'subtle-hover', 'subtle-active', 'brand', 'brand-subtle']" compact />
<XhTokenSwatches prefix="--xh-fg-" :steps="['default', 'muted', 'subtle', 'disabled', 'brand']" compact />
<XhTokenSwatches prefix="--xh-border-" :steps="['subtle', 'default', 'strong', 'control-hover']" compact />

## 深色档的几条特殊规则

- **投影用纯黑，再加一条浅色上沿。** 中性色阶最暗的一档比页面底还亮，拿它当投影压不出深度；四档海拔在末尾各带 1px 浅色描边把面的上沿提出来，raised / lifted 那条只画上边缘。
- **磨砂面同样成立。** frosted 的 0.88 不透明度与 16px 模糊在深底上按黑、白、中灰、页面与品牌背景重新验过正文 4.5:1、焦点环 3:1。
- **状态色往亮端走。** 六族语气的实心底、淡底、文字与描边在深色档各有一套取值，`--xh-tone-*` 的槽名不变。
- **overlay 必须能从 canvas 与 surface 中辨认。** 模态遮罩 `--xh-bg-overlay` 在两套主题下都验过与其下面的面有可见差。
- **强制色（forced-colors）另起一套。** 面改由 `Canvas` / `CanvasText`，选中改由 `Highlight` / `HighlightText`，按钮边改由 `ButtonText`；不靠颜色的通道（对号、指示条、chevron 转向）在这一档承担全部语义。
- **打印取消海拔与材质效果。** 纸上没有屏幕光源，投影与高光只会变成脏灰或无意义亮边：四档海拔置 `none`，磨砂改实体、关闭滤镜；语义角色只重映射，不动原语。

## 怎么接

- 首屏由服务端直接输出七个已解析属性，客户端接管前不闪。
- 用 `createVisualEnvironmentController` 或框架的 `XhConfigProvider` / `provideXhConfig` / `<xh-config>` 维护状态；局部区域用带 `parent` 的子控制器，只覆盖自己关心的轴。
- 自定义节点想跟着主题走，只写语义令牌与 `--xh-tone-*`，不写原语：原语在两套主题下是同一个值。

## 相关

- [色彩](/design/colors) · [阴影与材质](/design/shadow)
- 指南：[设计令牌与主题](/guide/theme) · [无障碍与键盘规格](/guide/a11y)
