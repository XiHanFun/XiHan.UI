来源：https://ui.docs.xihanfun.com/guide/motion

# 动效原语

`@xihan-ui/motion` 是动效的基础层：缓动曲线与时长常量、不持有计时器的纯补间、逐帧循环、减弱动效偏好，以及解析解弹簧与 Web Animations 的薄封装。零第三方依赖，`import` 无副作用，SSR 安全。

安装任意一个适配器即自动获得它：`headless` 的数字动画与倒计时、`core` 的缓动表都从这里取值。需要自行编写动画时，它也可以单独安装。

## 缓动

CSS 侧的字符串与 JS 侧的采样函数在这里是同一份来源；取值的真源是令牌层的 `ease.standard / in / out` 与 `duration.fast / normal / slow`（`@xihan-ui/tokens` 的 primitive），这里的 `standard` / `easeIn` / `easeOut` 与 `durations` 三值逐字等于它们，由门禁 `check-motion-source` 比对。

```ts
import { cubicBezier, easing, resolveEasing } from "@xihan-ui/motion";

easing.easeOut; // 'cubic-bezier(0, 0, 0.2, 1)'

// 名字、CSS 串、函数三种写法统一成函数
resolveEasing("easeOut")(0.5); // 0.79…
resolveEasing("cubic-bezier(0.4, 0, 0.2, 1)")(0.5);
resolveEasing(t => t * t)(0.5); // 0.25
```

八条命名缓动：`linear` `standard` `emphasized` `decelerate` `accelerate` `easeIn` `easeOut` `easeInOut`。

三档时长（毫秒）：`durations.fast` 120、`durations.normal` 200、`durations.slow` 320。`animate()` 默认取 `durations.normal`，`@xihan-ui/animations` 的配方默认取 `durations.slow`。语义层在此之上定义统一点击触感：按下走 `--xh-motion-duration-press`（120ms）与 `--xh-motion-ease-press`，释放走 `--xh-motion-duration-release`（200ms）与 `--xh-motion-ease-release`，见[设计令牌与主题](/guide/theme#点击触感)。

`resolveEasing` 无法识别的写法退回线性：写法可能来自 DOM 特性或后端配置，是任意字符串，不应让整段动画停止。`cubicBezier` 用牛顿迭代反解参数，导数过小时退回二分。

`toLinearEasing` 把任意缓动函数采样为 CSS `linear()` 串，用于把只有 JS 能计算的曲线交回 CSS：

```ts
import { toLinearEasing } from "@xihan-ui/motion";

toLinearEasing(t => t ** 2, 5); // 'linear(0, 0.0625, 0.25, 0.5625, 1)'
```

## 弹簧

弹簧使用解析解，不是逐帧数值积分。给定质量、刚度、阻尼，任意时刻的位移可以 O(1) 直接计算，因此它可以被任意采样、可以离线烘焙为 `linear()` 串交给 CSS，不需要每帧回主线程写样式。

```vue
<script setup lang="ts">
import { animate, createSpring, springToLinearEasing } from "@xihan-ui/motion";
import { computed, onBeforeUnmount, ref, useTemplateRef } from "vue";

const duration = ref(0.5);
const bounce = ref(0.3);

const solver = computed(() => createSpring({ duration: duration.value, bounce: bounce.value }));

// 曲线画在 0..1 的归一化坐标里，y 轴翻过来让 1 在上方
const path = computed(() => {
  const spring = solver.value;
  const seconds = spring.durationMs / 1000;
  const points: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const value = spring(t * seconds);
    points.push(`${(t * 280).toFixed(1)},${(110 - value * 80).toFixed(1)}`);
  }
  return `M ${points.join(" L ")}`;
});

const box = useTemplateRef<HTMLElement>("box");
let handle: { cancel: () => void } | null = null;

function play() {
  const el = box.value;
  if (!el)
    return;
  handle?.cancel();
  const spring = solver.value;
  handle = animate(
    el,
    [{ translate: "0 0" }, { translate: "180px 0" }],
    { duration: spring.durationMs, easing: springToLinearEasing(spring, 48), fill: "forwards" },
  );
}

onBeforeUnmount(() => handle?.cancel());
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; width: 100%">
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 20px">
      <label style="display: flex; align-items: center; gap: 8px">
        时长 {{ duration.toFixed(2) }}s
        <input v-model.number="duration" type="range" min="0.15" max="1.2" step="0.05">
      </label>
      <label style="display: flex; align-items: center; gap: 8px">
        弹性 {{ bounce.toFixed(2) }}
        <input v-model.number="bounce" type="range" min="-0.8" max="0.8" step="0.05">
      </label>
    </div>

    <p style="margin: 0; font-size: 13px; opacity: 0.7">
      阻尼比 {{ solver.dampingRatio.toFixed(3) }} · 沉降 {{ Math.round(solver.durationMs) }}ms · 过冲
      {{ (solver.overshoot * 100).toFixed(1) }}%
    </p>

    <svg viewBox="0 0 280 120" style="width: 100%; height: 120px">
      <line x1="0" y1="30" x2="280" y2="30" stroke="var(--vp-c-divider)" stroke-dasharray="4 4" />
      <line x1="0" y1="110" x2="280" y2="110" stroke="var(--vp-c-divider)" />
      <path :d="path" fill="none" stroke="var(--vp-c-brand-1)" stroke-width="2" />
    </svg>

    <div style="display: flex; align-items: center; gap: 12px">
      <button
        type="button"
        style="
          padding: 6px 14px;
          border: 1px solid var(--vp-c-divider);
          border-radius: 8px;
          background: transparent;
          color: inherit;
          cursor: pointer;
        "
        @click="play"
      >
        播一次
      </button>
      <div
        style="
          position: relative;
          flex: 1;
          height: 40px;
          border: 1px dashed var(--vp-c-divider);
          border-radius: 8px;
        "
      >
        <div
          ref="box"
          style="
            position: absolute;
            top: 4px;
            left: 4px;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: var(--vp-c-brand-1);
          "
        />
      </div>
    </div>
  </div>
</template>
```

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

`bounce` 落在 (−1, 1)：正数减阻尼、负数加阻尼。五个预设 `snappy` `smooth` `gentle` `bouncy` `stiff` 直接按名字取。

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

## 减弱动效

系统偏好之上叠加一层应用级 override，最终偏好 = override ?? 系统设置。

```ts
import {
  onMotionPreferenceChange,
  resolveMotionPreference,
  setMotionOverride,
} from "@xihan-ui/motion";

resolveMotionPreference(); // 'no-preference' | 'reduce'

// 接到产品自己的“减弱动效”设置项；传 null 交还系统
setMotionOverride("reduce");

const off = onMotionPreferenceChange(preference => console.log(preference));
```

订阅只在最终值变化时回调：override 生效期间系统翻转不会触发，交还系统时才生效。

没有 `matchMedia` 的宿主（SSR、jsdom）一律按不减弱处理：`prefersReducedMotion()` 返回 `false`，`getMotionPreference()` 返回 `'no-preference'`。

这是仓库内唯一的探测通道：`@xihan-ui/core` 的 `RuntimeConfig.reducedMotion`（退场租约、贴底滚动）与平滑滚动、`headless` 的数字动画、反馈服务的加载弧线与 `backgrounds` 的画面都经 `resolveMotionPreference` 读取，应用级 override 一处设置、处处生效。门禁 `check-reduced-motion-channel` 保证：除 motion 包自身外，源码中不允许出现 `matchMedia('(prefers-reduced-motion')`。

### 七轴控制器统一入口

应用根只设置一次视觉环境，解析后的 motion 会同时投影到 DOM，并经显式 sink 驱动 JS 动画、Presence 与平滑滚动：

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

const spec = { from: 0, to: 1000, duration: 800, easing: "ease-out" } as const;
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
