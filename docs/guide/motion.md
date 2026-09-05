# 动效原语

`@xihan-ui/motion` 是动效的地基层：缓动曲线与时长常量、不持有计时器的纯补间、逐帧循环、减弱动效偏好，以及解析解弹簧与 Web Animations 的薄封装。零第三方依赖，`import` 无副作用，SSR 安全。

装了任意一个适配器就自动拿到它——`headless` 的数字动画与倒计时、`core` 的缓动表都从这里取。要自己写动画的话，它也可以单独装。

## 缓动

CSS 侧的字符串与 JS 侧的采样函数在这里是同一份来源；取值的真源是令牌层的 `ease.standard / in / out` 与 `duration.fast / normal / slow`（`@xihan-ui/tokens` 的 primitive），这里的 `standard` / `easeIn` / `easeOut` 与 `durations` 三值逐字等于它们，由门禁 `check-motion-source` 比对。

```ts
import { cubicBezier, easing, resolveEasing } from '@xihan-ui/motion'

easing.easeOut // 'cubic-bezier(0, 0, 0.2, 1)'

// 名字、CSS 串、函数三种写法统一成函数
resolveEasing('easeOut')(0.5) // 0.79…
resolveEasing('cubic-bezier(0.4, 0, 0.2, 1)')(0.5)
resolveEasing(t => t * t)(0.5) // 0.25
```

八条命名缓动：`linear` `standard` `emphasized` `decelerate` `accelerate` `easeIn` `easeOut` `easeInOut`。

三档时长（毫秒）：`durations.fast` 120、`durations.normal` 200、`durations.slow` 320。`animate()` 缺省取 `durations.normal`，`@xihan-ui/animations` 的配方缺省取 `durations.slow`。

`resolveEasing` 认不出的写法退回线性——写法可能来自 DOM 特性或后端配置，那是一个任意字符串，不该让一段动画整个不动。`cubicBezier` 用牛顿迭代反解参数，导数过小时退回二分。

`toLinearEasing` 把任意缓动函数采样成 CSS `linear()` 串，用来把 JS 才算得出的曲线交回 CSS：

```ts
import { toLinearEasing } from '@xihan-ui/motion'

toLinearEasing(t => t ** 2, 5) // 'linear(0, 0.0625, 0.25, 0.5625, 1)'
```

## 弹簧

弹簧走解析解，不是逐帧数值积分。给定质量、刚度、阻尼，任意时刻的位移可以 O(1) 直接算出来——所以它能被任意采样、能离线烘焙成 `linear()` 串交给 CSS，而不必每帧回主线程写样式。

<XhDemo src="motion/01-spring" />

两种参数写法。物理参数直给：

```ts
import { createSpring } from '@xihan-ui/motion'

const spring = createSpring({ stiffness: 380, damping: 30, mass: 1 })
spring(0.1) // 0.1 秒时的归一化位移，0 起 1 止，欠阻尼时可越过 1
spring.durationMs // 沉降到静止阈值要多久
spring.dampingRatio // <1 欠阻尼、=1 临界阻尼、>1 过阻尼
spring.overshoot // 最大过冲量，不过冲为 0
```

感知参数更好调——只说"多久"和"弹不弹"：

```ts
createSpring({ duration: 0.4, bounce: 0.3 }) // 弹
createSpring({ duration: 0.4, bounce: 0 }) // 临界阻尼，全程单调不过冲
createSpring({ duration: 0.4, bounce: -0.5 }) // 过阻尼，慢慢靠过去
```

`bounce` 落在 (−1, 1)：正数减阻尼、负数加阻尼。五个预设 `snappy` `smooth` `gentle` `bouncy` `stiff` 直接按名字取。

沉降时长按阻尼比分三支算，不是一个公式套到底——欠阻尼看包络衰减、临界阻尼要解一个含 t 的指数方程、过阻尼由较慢的那个根主导。三支各有断言，并与 dt=0.1ms 的四阶龙格-库塔积分逐点对拍。

烘焙给 CSS：

```ts
import { createSpring, springToLinearEasing, supportsLinearEasing } from '@xihan-ui/motion'

const spring = createSpring('bouncy')
if (supportsLinearEasing()) {
  el.style.animationDuration = `${spring.durationMs}ms`
  el.style.animationTimingFunction = springToLinearEasing(spring, 32)
}
```

## 减弱动效

系统偏好之上叠一层应用级 override，最终偏好 = override ?? 系统设置。

```ts
import {
  onMotionPreferenceChange,
  resolveMotionPreference,
  setMotionOverride,
} from '@xihan-ui/motion'

resolveMotionPreference() // 'no-preference' | 'reduce'

// 接到产品自己的"减弱动效"设置项上；传 null 交还给系统
setMotionOverride('reduce')

const off = onMotionPreferenceChange(preference => console.log(preference))
```

订阅只在最终值真的变了才回调：override 压住期间系统翻转不会触发，交还系统那一刻才浮现。

没有 `matchMedia` 的宿主（SSR、jsdom）一律按「不减弱」：`prefersReducedMotion()` 返回 `false`，`getMotionPreference()` 返回 `'no-preference'`。

这是仓内唯一的探测通道：`@xihan-ui/core` 的 `RuntimeConfig.reducedMotion`（退场租约、贴底滚动）与平滑滚动、`headless` 的数字动画、反馈服务的加载弧线与 `backgrounds` 的画面都经 `resolveMotionPreference` 读，应用级 override 一处设、处处生效。门禁 `check-reduced-motion-channel` 守着：除 motion 包自身外，源码里不许再出现 `matchMedia('(prefers-reduced-motion')`。

### 减弱动效的两步

JS 与 CSS 是两条线，应用要减弱动效得各走一步：

1. **JS 侧**：在全局配置里写 `motion: 'reduce'`（Vue `provideXhConfig({ motion: 'reduce' })`，WC `setXhConfig({ motion: 'reduce' })` 或 `<xh-config motion="reduce">`），适配器收到就调 `setMotionOverride`；不经配置直接调 `setMotionOverride('reduce')` 也一样。配置里没写这个字段就不碰 override。
2. **CSS 侧**：把 `data-motion="reduce"` 打到容器上。`tokens.css` 在 `@media (prefers-reduced-motion: reduce)` 之外还生成一份 `:where([data-motion='reduce'])` 块，重映射同一批 `--xh-motion-*` 语义令牌（时长 1ms、位移 0、缩放 1）。打在 `<html>` 上即全局，打在某个容器上即局部。

配置不绑 DOM 节点，所以第二步由作者自己打；系统开了 prefers-reduced-motion 时两条线都自动降级，不必做任何事。

## 播一段

`animate` 是 Web Animations 的薄封装，把三件事收口：减弱动效降级、宿主缺 `Element.animate` 时的降级、结束时的结算方式。

```ts
import { animate } from '@xihan-ui/motion'

const handle = animate(el, [{ opacity: '0' }, { opacity: '1' }], {
  duration: 200,
  easing: 'easeOut',
})

await handle.finished // 'finished' | 'cancelled'
handle.cancel()
handle.finish()
```

`finished` 永远 resolve，被打断也是——它给的是结束方式，不是异常。调用方不必为"用户中途关掉了弹窗"写一个 catch。

降级时不产生中间帧：按 `fill` 决定要不要把末帧样式落到元素上，`finished` 立即以 `'finished'` 结算。**降级只影响中间帧存不存在，不影响控制流**——回调照常触发，`await` 照常返回。

## 补间与帧

给数值动画用的纯函数与逐帧胶水。补间自己不认识帧、也不持有计时器，推进由调用方逐帧喂 `elapsed`。

```ts
import { frameLoop, frameNow, isTweenDone, tweenValueAt } from '@xihan-ui/motion'

const spec = { from: 0, to: 1000, duration: 800, easing: 'ease-out' } as const
const start = frameNow(window)

const stop = frameLoop(window, () => {
  const elapsed = frameNow(window) - start
  render(tweenValueAt(spec, elapsed))
  if (isTweenDone(elapsed, spec.duration)) stop()
})
```

边界都按"宁可收在终点"处理：时长非正即刻满格，`elapsed` 是坏掉的时钟读数也按满格，走完那一刻返回终点本身而不是曲线算出来的近似值。

## 相关

- [动画层](/guide/animations)：现成的进场与注意动效，建在这一层之上
- [行为原语](/guide/behavior)：进出场时序、焦点域、滚动观察
- [设计令牌与主题](/guide/theme)：`--xh-motion-*` 时长与缓动令牌
