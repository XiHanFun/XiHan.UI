# @xihan-ui/animations

现成的进场与注意动效：11 个进场预设、6 个注意预设，错开起播与文字拆分。零第三方依赖，框架无关。一段动画是一份可序列化的配方，能存进数据库、由界面下拉切换。

**谁会装它**：想让元素进场、想让某个控件"抖一下"提示用户的人直接装它。减弱动效的降级由 `@xihan-ui/motion` 统一兜住，本包不另开一条通道。

## 用法

```ts
import { createMotionPlayer, splitText } from '@xihan-ui/animations'

const motion = createMotionPlayer()

await motion.play(card, 'fade-up')
await motion.playAll(list.children, 'rise', { stagger: 40 })
motion.play(input, 'shake') // 校验没过，抖一下

// 逐字进场
const { parts, restore } = splitText(title)
await motion.playAll(parts, 'fade-up', { stagger: 30 })
restore()
```

预设不留值：播完元素回到皮肤定义的样子，动画不接管静息态的外观。要自定义就直接给配方：

```ts
motion.play(el, { frames: [{ opacity: 0, y: 40 }, { opacity: 1, y: 0 }], duration: 500, easing: 'emphasized' })
```

## 两件要知道的事

`fade-start` / `fade-end` 标了 `logical`，横向位移在 RTL 下自动取反；`fade-up` / `fade-down` 这类纵向的不受影响。

`splitText` 把原文挂到容器的 `aria-label`、把拆出来的每一段标 `aria-hidden`——逐字的 `span` 会让部分读屏逐字念出来。要拿到无障碍名，容器的角色得支持命名（标题、按钮、链接这类）；套在裸 `div` 上读屏可能读不到，那种情况自己另给可访问文本。

滚动进入视口再播，用 `@xihan-ui/behavior` 的 `createViewportEntry` 观察，回调里调 `play`——观察不是动画，不收在这个包里。

## 装

```bash
pnpm add @xihan-ui/animations
```

完整文档见 [https://ui.docs.xihanfun.com](https://ui.docs.xihanfun.com)。这个包属于 `features/` 组，组的含义见仓库里的 `ui/packages/README.md`。

许可：MIT
