# @xihan-ui/motion

动效原语：缓动曲线的单一真源、不持有计时器的纯补间、逐帧循环、减弱动效偏好与应用级 override、解析解弹簧，以及 Web Animations 的薄封装。零第三方依赖，import 无副作用，SSR 安全。

**谁会装它**：装了任意一个适配器就自动拿到，做不了取舍。要单独用它的多半是自己写动画的人。

## 用法

```ts
import { animate, createSpring, resolveMotionPreference } from '@xihan-ui/motion'

// 播一段，减弱动效偏好下自动不产生中间帧
const handle = animate(el, [{ opacity: '0' }, { opacity: '1' }], { duration: 200, easing: 'easeOut' })
await handle.finished // 'finished' | 'cancelled'

// 弹簧：解析解，可任意采样，可烘焙成 CSS linear()
const spring = createSpring({ duration: 0.4, bounce: 0.2 })
spring(0.1) // 0.1 秒时的归一化位移
spring.durationMs // 沉降毫秒数
```

减弱动效的最终偏好 = 应用级 override ?? 系统 `prefers-reduced-motion`。把 `setMotionOverride()` 接到产品自己的"减弱动效"设置项上，别替最终用户决定。

## 装

```bash
pnpm add @xihan-ui/motion
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `engine/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
