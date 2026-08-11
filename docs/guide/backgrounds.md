# 背景层

`@xihan-ui/backgrounds` 是一层 WebGL2 背景效果与数据驱动粒子点云，框架无关、零第三方依赖。它是**可选**的：适配器把它声明为 optional peer，不用视觉效果的应用不会因为装了 `@xihan-ui/vue` 而多出一个 WebGL 引擎。

WebGL2 缺席时自动降级成 CSS 静态背景，不报错、不留白。

## 两条主线

1. **程序化效果**——传一个效果对象与一份参数，把它铺在任意元素的背景上；
2. **点云**——图片、文字、SVG、参数方程都能采样成点云，交给 `particles` 效果显示，两份点云之间自动形变过渡。

## 内置效果

14 个：`aurora` `beam` `flow-field` `fluid` `glass` `grain` `mesh` `nebula` `orb` `particles` `plasma` `ripple` `starfield` `wave`。

每个效果自带参数规格（数值、布尔、枚举、颜色四类），可以据此自动生成调参面板——playground 里的效果画廊就是这么做的。

## 基础用法

```ts
import { createBackgroundSurface } from '@xihan-ui/backgrounds'

const surface = createBackgroundSurface(el, {
  effect: 'aurora',
  params: { speed: 1.6 },
  quality: 'high',
  pointer: true, // 自动绑指针事件，想自己喂坐标就关掉
  autoplay: true,
  respectReducedMotion: true, // 系统开启减弱动态效果时冻结时间轴
  pauseOffscreen: true, // 滚出视口时暂停绘制
})

surface.setParams({ speed: 2 })
surface.setEffect('nebula')
surface.pause()
surface.destroy()
```

后两个选项默认开着，是让这层在真实页面里不成为负担的关键：看不见的画面不烧 GPU，声明了「减弱动态效果」的用户不会被动画晃到。

## 在 Vue 里用

Vue 侧的适配放在**单独的子入口** `@xihan-ui/vue/backgrounds`，三种用法从轻到重：

```vue
<script setup lang="ts">
import { useBackground, vBackground, XhBackground } from '@xihan-ui/vue/backgrounds'

const visual = useBackground({ effect: 'fluid' })
</script>

<template>
  <!-- 1. 指令：给任意元素或组件的根元素铺一层背景，一个字都不用改组件 -->
  <XhButton v-background="'aurora'">提交</XhButton>
  <div v-background="{ effect: 'aurora', params: { speed: 1.6 } }" />

  <!-- 2. 组件：插槽内容浮在效果之上，画布 pointer-events: none 不挡交互 -->
  <XhBackground effect="nebula" :params="{ density: 0.8 }">
    <h1>标题浮在效果上</h1>
  </XhBackground>

  <!-- 3. 组合式函数：自己拿画面实例，接自定义调度或调参面板 -->
  <div :ref="visual.attach" />
</template>
```

## 在自定义元素里用

同样是单独注册，不引这一行就不会把引擎打进包里：

```ts
import { defineXhBackground } from '@xihan-ui/web-components/backgrounds'

defineXhBackground()
```

## 点云

把任意东西采样成点，再让粒子摆成那个形状：

```ts
import { imageToCloud, shapeCloud, svgToCloud, textToCloud } from '@xihan-ui/backgrounds'

const cloud = await textToCloud('曦寒', { count: 8000 })
surface.setCloud(cloud, { duration: 1.2 }) // 与上一份点云之间形变过渡
```

| 来源 | 函数 |
| --- | --- |
| 文字 | `textToCloud` |
| 图片 | `imageToCloud` / `drawableToCloud` |
| SVG 路径 | `svgToCloud` / `pathToCloud` |
| 内置形状 | `shapeCloud`（`SHAPE_NAMES` 里列出全部） |
| 自定义 | `createCloud` + `normalizeCloud` / `resample` / `mergeClouds` |

点云工具还有 `boundsOf`（包围盒）、`lerpArrays`（插值）、`scatterShell`（球壳散布）、`createRng`（可复现随机）。

## 自定义效果

```ts
import { colorSpec, defineEffect, numberSpec, registerEffect } from '@xihan-ui/backgrounds'

const myEffect = defineEffect({
  name: 'my-effect',
  params: {
    // (label, min, max, step, default)
    speed: numberSpec('速度', 0, 4, 0.1, 1),
    tint: colorSpec('主色', '#3b82f6'),
  },
  shared: '/* 两个通道共用的 uniform 声明与函数 */',
  fragment: '/* 流场通道的片元着色器主体，含 main() */',
  uniforms: ctx => ({ /* 每帧算的 uniform */ }),
  fallback: params => 'linear-gradient(…)', // 无 WebGL2 时当 CSS background
  scale: 0.75, // 渲染分辨率倍率；柔和的画面调低可省掉大半像素
})

registerEffect(myEffect)
```

注册后就能按名字引用，和内置效果一样进调参面板。画质档位有 `auto` / `high` / `balanced` / `eco` 四挡，`auto` 按设备像素比与硬件并发数推断。

## 调度

所有画面共享一个调度器（`joinScheduler`），页面上开十个效果也只有一条 `requestAnimationFrame` 循环。`scheduledCount()` 可以查此刻有几个在跑。

## 相关

- [Vue 适配器](../adapters/vue)
- [Web Components 适配器](../adapters/wc)
