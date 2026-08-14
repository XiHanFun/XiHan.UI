# 动画层

`@xihan-ui/animations` 是现成的动效：11 个进场预设、6 个注意预设，外加错开起播与文字拆分。零第三方依赖，框架无关，任何框架（或没有框架）都直接装、直接用。

它建在 [动效原语](/guide/motion) 之上——减弱动效的降级由那一层统一兜住，这一层不另开通道。

<XhDemo src="animations/01-presets" />

## 动画是配方，不是类名

一段动画是一份可 JSON 序列化的配方（`MotionSpec`）：若干视觉帧加一组时序参数。

```ts
import type { MotionSpec } from '@xihan-ui/animations'

const riseUp: MotionSpec = {
  frames: [
    { opacity: 0, y: 24, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1 },
  ],
  duration: 420,
  easing: 'emphasized',
}
```

一帧能改六样东西：`opacity` `x` `y` `scale` `rotate` `blur`。位移写数字按 px，写字符串原样透传（`'100%'`）。省略的字段表示这一帧不参与该属性的插值。

配方是纯数据，所以它能存进数据库、由界面下拉切换、被用户改完存回去。播放前一律过一道钳制（`clampSpec`）：越界钳住、非有限值丢弃、帧数与时长有上限，坏数据不炸播放。

摊成宿主认的关键帧时有一条规矩：**某个属性只要有一帧声明过，其余帧就补上它的中性值**。只在中间帧出现的属性，宿主会拿元素当前的计算值当端点，而那个值随皮肤而变——同一份配方在不同皮肤下就不是同一个动画了。

## 预设

进场一族把元素从"不在场"带到静息态：

`fade` `fade-up` `fade-down` `fade-start` `fade-end` `zoom-in` `zoom-out` `blur-in` `rise` `drop-in` `spin-in`

注意一族从静息态出发，回到静息态：

`shake` `pulse` `bounce` `wobble` `flash` `heartbeat`

两族都**不留值**：播完元素回到皮肤定义的样子，动画不接管静息态的外观。这也是它们能反复播的原因。

`fade-start` / `fade-end` 标了 `logical`，横向位移在 RTL 下自动取反；`fade-up` 这类纵向的不受影响。

## 播

```ts
import { createMotionPlayer } from '@xihan-ui/animations'

const motion = createMotionPlayer()

await motion.play(card, 'fade-up')
motion.play(input, 'shake') // 校验没过，抖一下
motion.play(el, { frames: [{ opacity: 0 }, { opacity: 1 }], duration: 500 }) // 直接给配方
```

同一元素上再播一次会先撤掉上一段——两段一起写同一批属性的话，后一段会从被改过的中间态起步。被撤掉的那次 `play` 以 `'cancelled'` 结算，不抛异常。

播放器上有开关、时长系数与预设表：

```ts
const motion = createMotionPlayer({
  enabled: true, // 接到用户偏好上，别替最终用户决定
  speed: 1, // 全局时长系数，越大越慢
  presets: myPresets, // 省略用内置的
})

motion.setEnabled(false) // 关掉时撤掉在播的，但 play 照常结算
motion.cancel(el) // 撤一个
motion.cancel() // 全撤
```

播未收录的名字不播、不抛，只产出一条诊断告警（见 [诊断通道](/guide/diagnostics)）。

## 错开起播

<XhDemo src="animations/02-stagger" />

```ts
await motion.playAll(list.children, 'rise', { stagger: 40, from: 'center' })
```

`from` 决定从哪一端铺开：`first` 从头、`last` 从尾、`center` 从中间往两边。间隔叠在给定的基础延迟上。任意一个被打断，整体就算被打断。

## 文字拆分

`splitText` 把一段文字拆成逐字或逐词的行内块，正好是 `playAll` 要的一组元素。

```ts
import { splitText } from '@xihan-ui/animations'

const { parts, restore } = splitText(title, { by: 'char' })
await motion.playAll(parts, 'fade-up', { stagger: 30 })
restore()
```

按码点切，不会把 emoji 拆成两半；空白原样保留，换行照常。每一段都是 `inline-block`——行内元素吃不到 `translate` 与 `scale`。

::: warning 无障碍
原文会挂到容器的 `aria-label`，拆出来的每一段标 `aria-hidden`——逐字的 `span` 会让部分读屏逐字念出来。

这意味着**容器的角色得支持命名**（标题、按钮、链接这类）。套在裸 `div` 上读屏可能读不到无障碍名，那种情况自己另给可访问文本。用完记得 `restore()`。
:::

## 倒着播

`reverseSpec` 把一份进场配方翻成退场配方：帧序反转、偏移量镜像。逐帧缓动会被丢弃——它描述的是"本帧到下一帧"，反转之后那个区间换了主人。

```ts
import { motionPresets, reverseSpec } from '@xihan-ui/animations'

await motion.play(el, reverseSpec(motionPresets['fade-up']))
```

要做的是**弹窗这类会挂载卸载的进出场**，别用这个——那需要在卸载前把动画播完，走 [行为原语](/guide/behavior) 的进出场时序，动画本身交给 CSS `@keyframes`。这里的退场适合元素常驻、只是隐藏的场景。

## 滚动进入视口再播

观察不是动画，不收在这个包里。用 `@xihan-ui/behavior` 的 `createViewportEntry` 观察，回调里调 `play`：

```ts
import { createViewportEntry } from '@xihan-ui/behavior'

createViewportEntry({
  scope,
  target: () => card,
  onEnter: () => void motion.play(card, 'rise'),
})
```

## 相关

- [动效原语](/guide/motion)：缓动、弹簧、减弱动效偏好
- [行为原语](/guide/behavior)：进出场时序、滚动观察
- [声音层](/guide/sound)：同一套"配方 + 预设 + 播放器"的形状，换成听觉
