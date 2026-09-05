# 浮层定位

`@xihan-ui/position` 负责一件事：把一个浮层放到锚点旁边正确的位置，并在页面变化时持续跟住。它是自研实现，零第三方运行时依赖。

## 端口与实现是分开的

定位能力在 `@xihan-ui/core` 里以**端口**形式声明，`@xihan-ui/position` 只是它的一个实现：

```ts
export interface PositionEnginePort {
  /** 计算并持续更新浮层位置，返回值调用后停止跟随。 */
  attach: (
    anchor: Anchor,
    floating: HTMLElement,
    options: PositionOptions,
    onResult: (result: PositionResult) => void,
  ) => () => void
}
```

组件只认这个端口。想换成别的定位库，实现一份 `PositionEnginePort` 注入即可，组件与皮肤一行不用改。定位判据本身也是**引擎无关**的：它只断言浮层最终出现在屏幕的哪个位置，换实现照跑不误。

## 用法

```ts
import { createPositionEngine } from '@xihan-ui/position'

const engine = createPositionEngine()

const stop = engine.attach(
  triggerEl,
  floatingEl,
  { placement: 'bottom-start', offset: 8, flip: true, shift: true, strategy: 'absolute' },
  ({ x, y, placement, hidden }) => {
    floatingEl.style.left = `${x}px`
    floatingEl.style.top = `${y}px`
  },
)

stop() // 停止跟随
```

日常用不到这一层——浮层组件内部已经接好了，你只需要传 `placement` / `offset` 之类的 props。

## 选项

| 选项 | 默认 | 说明 |
| --- | --- | --- |
| `placement` | `'bottom'` | 12 种：四个方向 × `start` / `center` / `end` |
| `offset` | `8` | 与锚点的间距（px） |
| `flip` | `true` | 主轴空间不足时翻到对面 |
| `shift` | `true` | 交叉轴溢出时沿边推回，贴边留 4px 余量 |
| `strategy` | `'absolute'` | 坐标系，见下 |

回传的 `PositionResult` 里除了坐标，还有**最终采用的** `placement`（翻面后可能与请求的不同，皮肤靠 `data-side` / `data-align` 画箭头）与 `hidden`（锚点已被裁剪掉，浮层该藏起来）。

## 两套坐标系

这是浮层最容易出错的地方：

| strategy | 坐标基准 | 被谁裁 |
| --- | --- | --- |
| `absolute` | 包含块的布局坐标 | 任何 `overflow` 祖先 |
| `fixed` | 视口坐标 | 只被「劫持了它包含块」的那类祖先（`transform` / `filter` / `contain` 等）约束 |

引擎对两者的处理不是简单换个基准：`fixed` 时会把裁剪祖先链**截断**到那个劫持了包含块的祖先为止。不截断的话，浮层会逃出裁剪区却仍在躲一条已经不存在的边界，表现为莫名其妙的翻面或被推回去。

::: warning 坐标系必须三处一致
机器传给引擎的 `strategy`、`connect` 产出的内联 `position`、皮肤里 `positioner` 规则的 `position`——三处必须写同一个值。任意一处走岔，引擎按一套坐标算、CSS 按另一套渲染，整族浮层会整体偏掉一个 `scrollY`，而且不会有任何报错。

仓库里有一道门禁（`check-overlay-strategy.mjs`）专门盯这三处。新增吃引擎坐标的浮层组件时，必须把它登记进那份名单，否则它不受保护。
:::

## 虚拟锚点

右键菜单、文本选区这类没有实体元素的锚点，给一个能返回矩形的对象即可：

```ts
const virtual = {
  getBoundingClientRect: () => ({ x: event.clientX, y: event.clientY, width: 0, height: 0 }),
}
engine.attach(virtual, floatingEl, { placement: 'bottom-start' }, apply)
```

在计算的第一步元素锚点与虚拟锚点就统一成矩形了，之后没有任何区别。

## 落位才露

浮层的坐标依赖它自己的尺寸，而尺寸要等元素进 DOM 参与排版才量得到——「先定位再展开」做不到，
顺序只能是渲染、量、定位。展开的那几帧坐标还是兜底的 0，不处理的话浮层会先在视口左上角闪一帧：
快机器上这一帧赶在绘制前闭合，慢机器或开着 devtools 时画得出来。

所以定位层有一条生命周期契约，落在皮肤基线与连接层两处：

- `reset.css` 给所有 `[data-part='positioner']` 默认 `visibility: hidden`，只有带 `data-positioned` 的才显示。
  用 visibility 而不是 display——`display: none` 会让浮层退出排版，引擎量不到它的尺寸。
- 连接层在引擎回报坐标后打 `data-positioned`（吃引擎坐标的走 `overlayPositioned(position)`；
  由皮肤 inset 直接摆的对话框、抽屉、图片查看器恒带，它们没有「还没量完」的窗口）。
- 判据与展开态无关：收起中的浮层留着坐标把退场播完；重开前由各机器的 `trackPosition` 先清坐标，
  于是再次落位前同样藏着。`(0, 0)` 是合法坐标，判据只认 `x` 是否存在。
- 锚点被滚出可视区时引擎置 `hidden`，这是另一个信号 `data-hidden`，各皮肤压回隐藏。

忘了接线的新浮层只会不显示，不会闪——`check-overlay-positioned` 门禁在构建前就报出来。

多面板共用一份坐标的组件（菜单栏、侧栏的折叠弹出）还要逐面板记账：换张时共享份立刻归新面板所有，
正在收起的那张若从共享份取坐标会当场归零。菜单栏此外遵循原生菜单栏的成规——首开有进场、
末收有退场，相邻切换瞬时换张；且新张落位前上一张保持显示（`data-instant` 与交接），
否则两张之间的空档快速掠过就成了频闪。

## 跟随

`attach` 之后引擎会持续更新位置，覆盖这些情况：

- 页面滚动、容器滚动
- 视口尺寸变化
- 锚点或浮层自身尺寸变化
- 祖先链上的 `transform` / 缩放容器

静置时不空转，`stop()` 之后不再有任何回调。这两条与十二种 placement 的贴边对齐、翻面与避让（各配一条「关掉之后应当溢出」的对照）、缩放容器、裁剪后的 `hidden` 一起，构成了浏览器里跑的定位契约判据。

## 相关

- [组件参考](../components/)：哪些组件带 `positioner` 部件
- [行为原语](./behavior)：定位之外的层栈、消隐与焦点
- [测试与质量门禁](./testing)：定位契约怎么验
