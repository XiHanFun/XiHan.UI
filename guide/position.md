来源：https://ui.docs.xihanfun.com/guide/position

# 浮层定位

`@xihan-ui/position` 负责一件事：把浮层放到锚点旁的正确位置，并在页面变化时持续跟随。它是自研实现，零第三方运行时依赖。

默认共享箭头皮肤只作用于 `context-menu`、`hover-card`、`menu`、`menubar`、`popconfirm`、`popover`、`tour`、`tooltip` 自身的 `arrow` 部件。业务或其他组件使用同名 `data-part="arrow"` 不会获得浮层定位、旋转或描边裁剪。

## 端口与实现是分开的

定位能力在 `@xihan-ui/core` 中以端口形式声明，`@xihan-ui/position` 只是它的一个实现：

```ts
export interface PositionEnginePort {
  /** 计算并持续更新浮层位置，返回值调用后停止跟随。 */
  attach: (
    anchor: Anchor,
    floating: HTMLElement,
    options: PositionOptions,
    onResult: (result: PositionResult) => void,
  ) => () => void;
}
```

组件只识别这个端口。需要换用其他定位库时，实现一份 `PositionEnginePort` 注入即可，组件与皮肤不需修改。定位判据本身也是引擎无关的：它只断言浮层最终出现在屏幕的位置，更换实现后同样适用。

## 用法

```ts
import { createPositionEngine } from "@xihan-ui/position";

const engine = createPositionEngine();

const stop = engine.attach(
  triggerEl,
  floatingEl,
  { placement: "bottom-start", offset: 8, flip: true, shift: true, strategy: "absolute" },
  ({ x, y, placement, hidden }) => {
    floatingEl.style.left = `${x}px`;
    floatingEl.style.top = `${y}px`;
  },
);

stop(); // 停止跟随
```

日常使用不涉及这一层：浮层组件内部已经接入，只需传 `placement` / `offset` 等 props。

## 选项

| 选项 | 默认 | 说明 |
| --- | --- | --- |
| `placement` | `'bottom'` | 12 种：四个方向 × `start` / `center` / `end` |
| `offset` | `8` | 与锚点的间距（px） |
| `flip` | `true` | 主轴空间不足时翻到对面 |
| `shift` | `true` | 交叉轴溢出时沿边推回，贴边留 4px 余量 |
| `strategy` | `'absolute'` | 坐标系，见下 |

回传的 `PositionResult` 除坐标外，还有最终采用的 `placement`（翻面后可能与请求的不同，皮肤依靠 `data-side` / `data-align` 绘制箭头）与 `hidden`（锚点已被裁剪，浮层应隐藏）。

## 两套坐标系

这是浮层最容易出错的位置：

| strategy | 坐标基准 | 被谁裁 |
| --- | --- | --- |
| `absolute` | 包含块的布局坐标 | 任何 `overflow` 祖先 |
| `fixed` | 视口坐标 | 只受改变其包含块的祖先（`transform` / `filter` / `contain` 等）约束 |

引擎对两者的处理不只是切换基准：`fixed` 时会把裁剪祖先链截断到改变包含块的祖先为止。不截断时，浮层会离开裁剪区却仍在躲避一条已不存在的边界，表现为异常翻面或被推回。

::: warning 坐标系必须三处一致
状态机传给引擎的 `strategy`、`connect` 产出的内联 `position`、皮肤中 `positioner` 规则的 `position`，三处必须写同一个值。任意一处不一致，引擎按一套坐标计算、CSS 按另一套渲染，整族浮层会整体偏移一个 `scrollY`，且没有任何报错。

仓库中有一道门禁（`check-overlay-strategy.mjs`）专门检查这三处。新增使用引擎坐标的浮层组件时，必须把它登记进该名单，否则不受保护。
:::

## 虚拟锚点

右键菜单、文本选区这类没有实体元素的锚点，给一个能返回矩形的对象即可：

```ts
const virtual = {
  getBoundingClientRect: () => ({ x: event.clientX, y: event.clientY, width: 0, height: 0 }),
};
engine.attach(virtual, floatingEl, { placement: "bottom-start" }, apply);
```

计算的第一步即把元素锚点与虚拟锚点统一为矩形，之后没有任何区别。

## 落位后显示

浮层的坐标依赖自身尺寸，而尺寸要等元素进入 DOM 参与排版后才能测量：无法先定位再展开，
顺序只能是渲染、测量、定位。展开的前几帧坐标仍是兜底的 0，不处理时浮层会先在视口左上角闪现一帧：
快机器上这一帧在绘制前闭合，慢机器或开启 devtools 时会被绘制。

因此定位层有一条生命周期契约，落在皮肤基线与连接层两处：

- `reset.css` 给所有 `[data-part='positioner']` 默认 `visibility: hidden`，只有带 `data-positioned` 的才显示。
  使用 visibility 而不是 display：`display: none` 会让浮层退出排版，引擎无法测量其尺寸。
- 连接层在引擎回报坐标后写入 `data-positioned`（使用引擎坐标的经 `overlayPositioned(position)`；
  由皮肤 inset 直接摆放的对话框、抽屉、图片查看器恒带，它们没有尚未测量完成的窗口）。
- 判据与展开态无关：收起中的浮层保留坐标播完退场；重开前由各状态机的 `trackPosition` 先清除坐标，
  因此再次落位前同样隐藏。`(0, 0)` 是合法坐标，判据只判断 `x` 是否存在。
- 锚点被滚出可视区时引擎置 `hidden`，这是另一个信号 `data-hidden`，各皮肤据此隐藏。

未接线的新浮层只会不显示，不会闪现：`check-overlay-positioned` 门禁在构建前即报出。

多面板共用一份坐标的组件（菜单栏、侧栏的折叠弹出）还要逐面板记录：切换时共享份立即归新面板所有，
正在收起的面板若从共享份取坐标会当场归零。菜单栏此外遵循原生菜单栏的惯例：首开有进场、
末收有退场，相邻切换瞬时切换；且新面板落位前上一面板保持显示（`data-instant` 与交接），
否则两者之间的空档快速掠过会形成频闪。

## 跟随

`attach` 之后引擎会持续更新位置，覆盖这些情况：

- 页面滚动、容器滚动
- 视口尺寸变化
- 锚点或浮层自身尺寸变化
- 祖先链上的 `transform` / 缩放容器

静置时不空转，`stop()` 之后不再有任何回调。这两条与十二种 placement 的贴边对齐、翻面与避让（各配一条关闭后应当溢出的对照）、缩放容器、裁剪后的 `hidden` 一起，构成在浏览器中运行的定位契约判据。

## 相关

- [组件参考](../components/)：带 `positioner` 部件的组件
- [行为原语](./behavior)：定位之外的层栈、消隐与焦点
- [测试与质量门禁](./testing)：定位契约的验证方式
