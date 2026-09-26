# 动效原语

`@xihan-ui/motion` 是动效的基础层：缓动曲线与时长常量、不持有计时器的纯补间、逐帧循环、减弱动效偏好，以及解析解弹簧与 Web Animations 的薄封装。零第三方依赖，`import` 无副作用，SSR 安全。

安装任意一个适配器即自动获得它：`headless` 的数字动画与倒计时、`core` 的缓动表都从这里取值。需要自行编写动画时，它也可以单独安装。

## 缓动

CSS 侧的字符串与 JS 侧的采样函数在这里是同一份来源；取值的真源是令牌层（`@xihan-ui/tokens` 的原语 `ease.*`、`duration.*` 与语义层 `--xh-motion-*`）。门禁 `check-motion-source` 双向比对：令牌里的每条曲线与时长在这里都有同值常量，这里多出的名字须登记理由。

```ts
import { cubicBezier, easing, resolveEasing } from "@xihan-ui/motion";

easing.easeOut; // 'cubic-bezier(0, 0, 0.2, 1)'

// 名字、CSS 缓动函数、函数三种写法统一成函数
resolveEasing("easeOut")(0.5); // 0.79…
resolveEasing("cubic-bezier(0.4, 0, 0.2, 1)")(0.5);
resolveEasing("steps(4)")(0.5); // 0.5
resolveEasing(t => t * t)(0.5); // 0.25
```

十条命名缓动：与令牌原语同值的 `standard` `easeIn` `easeOut` `outStrong` `outFluid` `easeInOut` `outBack` `sineInOut`，CSS 关键字 `linear`，以及没有令牌对应的 `emphasized`（表现性进场，`@xihan-ui/animations` 的预设使用）。

三档时长（毫秒）：`durations.fast` 120、`durations.normal` 200、`durations.slow` 320。`animate()` 默认取 `durations.normal`，`@xihan-ui/animations` 的配方默认取 `durations.slow`。语义层在此之上定义统一点击触感：按下走 `--xh-motion-duration-press`（120ms）与 `--xh-motion-ease-press`，释放走 `--xh-motion-duration-release`（200ms）与 `--xh-motion-ease-release`，见[设计令牌与主题](/guide/theme#点击触感)。

字符串先查命名缓动，查不到再按 CSS 缓动函数的语法解释：`linear`、`ease` / `ease-in` / `ease-out` / `ease-in-out`、`step-start` / `step-end`、`cubic-bezier()`、`steps()`、`linear()`，取值与浏览器一致，所以 `readMotion` 读到样式里改写成任何合法缓动都能换成函数。CSS 关键字 `ease-out` 与命名缓动 `easeOut` 是两条曲线。认不出的写法抛 `TypeError`，消息里列出可用写法：写法可能来自 DOM 特性或后端配置，拼错的名字若悄悄按匀速播放，比报错更难察觉。`cubicBezier` 用牛顿迭代反解参数，导数过小时退回二分。

## 从元素读取令牌

JS 动画与同一元素上的 CSS 过渡保持同步时，不要写死毫秒，从元素读取语义令牌：

```ts
import { readMotion, tweenValueAt } from "@xihan-ui/motion";

const motion = readMotion(el);
const spec = {
  from: 0,
  to: 1,
  duration: motion.duration("move"), // --xh-motion-duration-move 的实际取值（毫秒）
  easing: motion.easing("continuous"), // --xh-motion-ease-continuous 的采样函数
};
```

计算样式里已经算进作者对组件槽的覆盖、容器上的 `data-motion` 与系统的减弱动效偏好，减弱动效下几何类时长读到的就是 1ms。读不到时（服务端、未加载样式的测试环境）取与令牌同值的常量 `motionDurations` / `motionEasings`，并按元素判断是否减弱。每次调用读一次计算样式，在动画开始前调用即可。

`toLinearEasing` 把任意缓动函数采样为 CSS `linear()` 串，用于把只有 JS 能计算的曲线交回 CSS：

```ts
import { toLinearEasing } from "@xihan-ui/motion";

toLinearEasing(t => t ** 2, 5); // 'linear(0, 0.0625, 0.25, 0.5625, 1)'
```

## 弹簧

弹簧使用解析解，不是逐帧数值积分。给定质量、刚度、阻尼，任意时刻的位移可以 O(1) 直接计算，因此它可以被任意采样、可以离线烘焙为 `linear()` 串交给 CSS，不需要每帧回主线程写样式。

<XhDemo src="motion/01-spring" />

两种参数写法。直接给物理参数：

```ts
import { createSpring } from "@xihan-ui/motion";

const spring = createSpring({ stiffness: 380, damping: 30, mass: 1 });
spring(0.1); // 0.1 秒时的归一化位移，0 起 1 止，欠阻尼时可越过 1
spring.durationMs; // 沉降到静止阈值要多久
spring.dampingRatio; // <1 欠阻尼、=1 临界阻尼、>1 过阻尼
spring.overshoot; // 最大过冲量，不过冲为 0
```

感知参数更易调整，只描述时长与弹性：

```ts
createSpring({ duration: 0.4, bounce: 0.3 }); // 弹
createSpring({ duration: 0.4, bounce: 0 }); // 临界阻尼，全程单调不过冲
createSpring({ duration: 0.4, bounce: -0.5 }); // 过阻尼，缓慢趋近
```

`bounce` 落在 (−1, 1)：正数减阻尼、负数加阻尼。预设按名字取，取值与令牌 `--xh-motion-spring-<名>-stiffness / -damping` 同源（质量恒为 1）：

| 预设 | 刚度 / 阻尼 | 超调 | 落定 | 用途 |
| --- | --- | ---: | ---: | --- |
| `stiff` | 600 / 42 | 0.5% | 约 195ms | 越界回弹 |
| `smooth` | 300 / 30 | 0.4% | 约 283ms | 手势松手：归位、快甩、面板弹回 |
| `snappy` | 380 / 30 | 2.2% | 约 369ms | 干脆的位移 |
| `gentle` | 170 / 26 | 0 | 约 567ms | 临界阻尼的慢弹簧 |
| `bouncy` | 400 / 18 | 20.4% | 约 581ms | 明显回弹，只供作者使用，核心组件不用 |
| `toggle` | 420 / 26 | 7.5% | — | liquid 档的切换滑块 |
| `lead` / `trail` | 520 / 34、210 / 24 | 2.9%、0.9% | 约 313ms、485ms | liquid 档双沿指示器的前沿与后沿 |

核心组件在 standard 档只用超调不超过 3% 的预设。

沉降时长按阻尼比分三支计算：欠阻尼看包络衰减、临界阻尼求解含 t 的指数方程、过阻尼由较慢的根主导。三支各有断言，并与 dt=0.1ms 的四阶龙格-库塔积分逐点比对。

烘焙给 CSS：

```ts
import { createSpring, springToLinearEasing, supportsLinearEasing } from "@xihan-ui/motion";

const spring = createSpring("bouncy");
if (supportsLinearEasing()) {
  el.style.animationDuration = `${spring.durationMs}ms`;
  el.style.animationTimingFunction = springToLinearEasing(spring, 32);
}
```

### 有状态弹簧

`createSpring` 描述的是一段从 0 到 1 的固定运动。手势需要另外两件事：松手时的速度要接进动画，动画进行中目标还会变。`createSpringValue` 持有当前值、速度与目标，改目标时以当前位移与当前速度为初始条件重新求解，位置与速度都不跳变：

```ts
import { createSpringValue } from "@xihan-ui/motion";

const offset = createSpringValue({
  spring: "smooth",
  value: 0,
  target: sheetElement, // 取它所在的窗口驱动帧循环，并按它的 data-motion 作用域判断减弱动效
  onUpdate: (value) => { sheetElement.style.translate = `0 ${value}px`; },
});

// 拖动中跟手，直接落位
offset.set(dragY);
// 松手：按位移与速度决定关闭还是弹回，速度原样交给弹簧
const result = await offset.to(shouldClose ? sheetHeight : 0, { velocity: releaseVelocity });
// result 是 'rest'（落定）或 'interrupted'（被新的 to()、set()、stop() 打断）
```

- 在目标处带着速度松手也会运动：先被速度带离，再回到目标。
- 每一段运动是时间的闭式解，与帧率无关；帧由 `frameLoop` 驱动。
- 减弱动效下 `to()` 直接落到终态并以 `'rest'` 结算，跟手的 `set()` 不受影响。
- 刚度、阻尼、质量不大于 0，或任何数值不是有限数时立即抛 `TypeError`。

## 减弱动效

系统偏好之上叠加一层应用级 override，最终偏好 = override ?? 系统设置。传入元素时，最近祖先上的 `data-motion`（`reduce` / `default`）再优先一层，与 CSS 令牌的作用域一致。

```ts
import {
  onMotionPreferenceChange,
  resolveMotionPreference,
  setMotionOverride,
} from "@xihan-ui/motion";

resolveMotionPreference(); // 'no-preference' | 'reduce'
resolveMotionPreference(el); // 先看 el 最近祖先的 data-motion，再看 override 与系统设置

// 接到产品自己的“减弱动效”设置项；传 null 交还系统
setMotionOverride("reduce");

const off = onMotionPreferenceChange(preference => console.log(preference));
```

订阅只在最终值变化时回调：override 生效期间系统翻转不会触发，交还系统时才生效。

没有 `matchMedia` 的宿主（SSR、jsdom）一律按不减弱处理：`prefersReducedMotion()` 返回 `false`，`getMotionPreference()` 返回 `'no-preference'`。

JS 侧统一经 `resolveMotionPreference` 读取，并传入动效作用的元素：最近祖先上的 `data-motion` 与 CSS 的作用域一致地生效，其次是应用级 override，最后是系统设置。`@xihan-ui/core` 的贴底与平滑滚动、`headless` 的数字动画与走马灯自动播放、反馈服务的加载弧线与 `backgrounds` 的画面都按此读取，容器上写一次 `data-motion="reduce"`，CSS 与 JS 动效一起停。门禁 `check-reduced-motion-channel` 保证：系统信号 `(prefers-reduced-motion` 只在 motion 包的 `reduced-motion.ts` 与 core 的视觉环境探测 `visual-environment/env.ts` 两处出现，且 `resolveMotionPreference` 处处传参。

### 七轴控制器统一入口

应用根只设置一次视觉环境，解析后的 motion 会同时投影到 DOM，并经显式 sink 驱动 JS 动画与平滑滚动：

```ts
import { setMotionOverride } from "@xihan-ui/motion";
import {
  createMotionOverrideSink,
  createVisualEnvironmentController,
} from "@xihan-ui/tokens/runtime";

const visual = createVisualEnvironmentController({
  root: document.documentElement,
  motionSink: createMotionOverrideSink(setMotionOverride),
  initial: { motion: "system" },
});

visual.setPreference({ motion: "reduce" });
```

`motionSink` 只允许绑定 `documentElement` 根作用域。局部 VisualEnvironment 仍会写 `data-motion="reduce"`，让该子树的 CSS 令牌降级；它不会改全局 JS override，也不会影响兄弟树。需要直接控制全局 JS 且不使用视觉环境时，仍可显式调用 `setMotionOverride`。

## 播放动画

`animate` 是 Web Animations 的薄封装，统一处理三件事：减弱动效降级、宿主缺少 `Element.animate` 时的降级、结束时的结算方式。

```ts
import { animate } from "@xihan-ui/motion";

const handle = animate(el, [{ opacity: "0" }, { opacity: "1" }], {
  duration: 200,
  easing: "easeOut",
});

await handle.finished; // 'finished' | 'cancelled'
handle.cancel();
handle.finish();
```

`finished` 始终 resolve，被打断时也是：它返回结束方式，不抛出异常。调用方不需要为用户中途关闭弹窗编写 catch。

降级时不产生中间帧：按 `fill` 决定是否把末帧样式落到元素上，`finished` 立即以 `'finished'` 结算。降级只影响中间帧是否存在，不影响控制流：回调照常触发，`await` 照常返回。

## 补间与帧

供数值动画使用的纯函数与逐帧胶水。补间本身不感知帧，也不持有计时器，推进由调用方逐帧传入 `elapsed`。

```ts
import { frameLoop, frameNow, isTweenDone, tweenValueAt } from "@xihan-ui/motion";

const spec = { from: 0, to: 1000, duration: 800, easing: "easeOut" } as const;
const start = frameNow(window);

const stop = frameLoop(window, () => {
  const elapsed = frameNow(window) - start;
  render(tweenValueAt(spec, elapsed));
  if (isTweenDone(elapsed, spec.duration))
    stop();
});
```

边界一律收在终点：时长非正时立即满格，`elapsed` 为无效的时钟读数时也按满格，完成时返回终点本身而不是曲线计算的近似值。

## 相关

- [动画层](/guide/animations)：现成的进场与注意动效，构建于这一层之上
- [行为原语](/guide/behavior)：进出场时序、焦点域、滚动观察
- [设计令牌与主题](/guide/theme)：`--xh-motion-*` 时长与缓动令牌
