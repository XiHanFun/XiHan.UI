# 背景层

`@xihan-ui/backgrounds` 是一层 WebGL2 背景效果与数据驱动粒子点云，框架无关、零第三方依赖。它是**可选**的：适配器把它声明为 optional peer，不用视觉效果的应用不会因为装了 `@xihan-ui/vue` 而多出一个 WebGL 引擎。

WebGL2 缺席时自动降级成 CSS 静态背景，不报错、不留白。

## 两条主线

1. **程序化效果**——传一个效果对象与一份参数，把它铺在任意元素的背景上；
2. **点云**——图片、文字、SVG、参数方程都能采样成点云，交给 `particles` 效果显示，两份点云之间自动形变过渡。

## 内置效果

14 个：`aurora` `beam` `flow-field` `fluid` `glass` `grain` `mesh` `nebula` `orb` `particles` `plasma` `ripple` `starfield` `wave`。

每个效果自带参数规格（数值、布尔、枚举、颜色四类），可以据此自动生成调参面板——playground 里的效果画廊就是这么做的。

这 14 个**不自动注册**。按名字取用前要先注册；直接传效果对象则不需要，见下。

## 基础用法

两条路，按场景选。

**传效果对象**——不经过注册表，没引到的效果会被打包器摇掉。只用一两个效果时选它：

```ts
import { auroraEffect, createBackgroundSurface, nebulaEffect } from '@xihan-ui/backgrounds'

const surface = createBackgroundSurface(el, {
  effect: auroraEffect,
  params: { speed: 1.6 },
  quality: 'high',
  pointer: true, // 自动绑指针事件，想自己喂坐标就关掉
  autoplay: true,
  respectReducedMotion: true, // 系统开启减弱动态效果时冻结时间轴
  pauseOffscreen: true, // 滚出视口时暂停绘制
})

surface.setParams({ speed: 2 })
surface.setEffect(nebulaEffect)
surface.pause()
surface.destroy()
```

**按名字**——适合参数存在配置里、由界面下拉切换。名字要先注册：

```ts
import { auroraEffect, createBackgroundSurface, nebulaEffect, registerBuiltinEffects, registerEffects } from '@xihan-ui/backgrounds'

registerBuiltinEffects() // 14 个内置效果全部注册
registerEffects([auroraEffect, nebulaEffect]) // 或者只注册用到的这两个

createBackgroundSurface(el, { effect: 'aurora' })
```

内置效果不自动注册，是因为注册表一旦静态引上这 14 个，任何用到 `createBackgroundSurface` 的应用都会把它们全打进包——实测约 35 kB（gzip 约 8.6 kB），占整包四成。没注册就按名字取会抛错，错误信息会点名该调哪个函数、以及那个效果的导出名叫什么。合法的内置名字可以从 `BUILTIN_EFFECT_NAMES` 取，它是纯字符串清单，引它不会把效果对象带进包。

后两个选项默认开着，是让这层在真实页面里不成为负担的关键：看不见的画面不烧 GPU，声明了「减弱动态效果」的用户不会被动画晃到。

## 宿主的定位

`target` 传容器元素时，画布是绝对定位的，所以容器必须是它的定位祖先。库的做法是：

- 容器自己已有定位（内联写的、类名写的都算）——**一个字都不动**；
- 容器量出来是 `static`——写一句内联 `position: relative` 兜底；
- 容器还没进文档——**先不挂画布、也不写定位**。此时 `getComputedStyle` 什么都算不出来，写下去会压过你用类名写的定位且撤不回来。等容器进文档拿到盒子，库再来定这一次。

所以容器的定位写在类名里是安全的，不必为了这层背景改成内联样式。

## 在 Vue 里用

Vue 侧的适配放在**单独的子入口** `@xihan-ui/vue/backgrounds`，三种用法从轻到重：

```vue
<script setup lang="ts">
import { auroraEffect, fluidEffect, nebulaEffect } from '@xihan-ui/backgrounds'
import { useBackground, vBackground, XhBackground } from '@xihan-ui/vue/backgrounds'

const visual = useBackground({ effect: fluidEffect })
</script>

<template>
  <!-- 1. 指令：给任意元素或组件的根元素铺一层背景，一个字都不用改组件 -->
  <XhButton v-background="auroraEffect">提交</XhButton>
  <div v-background="{ effect: auroraEffect, params: { speed: 1.6 } }" />

  <!-- 2. 组件：插槽内容浮在效果之上，画布 pointer-events: none 不挡交互 -->
  <XhBackground :effect="nebulaEffect" :params="{ density: 0.8 }">
    <h1>标题浮在效果上</h1>
  </XhBackground>

  <!-- 3. 组合式函数：自己拿画面实例，接自定义调度或调参面板 -->
  <div :ref="visual.attach" />
</template>
```

Vue 子入口**不替你注册**内置效果。要在模板里写字符串名（`v-background="'aurora'"`、`effect="nebula"`），先在应用入口调一次 `registerBuiltinEffects()` 或 `registerEffects([...])`。

## 在自定义元素里用

同样是单独注册，不引这一行就不会把引擎打进包里：

```ts
import { defineXhBackground } from '@xihan-ui/web-components/backgrounds'

defineXhBackground()
```

`defineXhBackground()` 会把内置效果一并注册进注册表，所以 `<xh-background effect="aurora">` 直接可用；代价是这条入口一定带上全部 14 个效果。

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

注册后就能按名字引用，和已注册的内置效果一样进调参面板。画质档位有 `auto` / `high` / `balanced` / `eco` 四挡，`auto` 按设备像素比与硬件并发数推断。

## 调度

所有画面共享一个调度器（`joinScheduler`），页面上开十个效果也只有一条 `requestAnimationFrame` 循环。`scheduledCount()` 可以查此刻有几个在跑。

## 相关

- [Vue 适配器](../adapters/vue)
- [Web Components 适配器](../adapters/web-components)
