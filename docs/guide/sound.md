# 声音层

`@xihan-ui/sound` 是一层纯 Web Audio 的程序化 UI 音效：零音频文件、零第三方依赖、框架无关。点击、成功、报错这些提示音不是加载 MP3，而是在播放的瞬间用振荡器与噪声实时合成出来——整个包比一张音频文件还小。

它是**独立**的：不依赖任何适配器，任何框架（或没有框架）都直接装、直接用。

下面的示例都会真的出声，先把音量调小一点。

<XhDemo src="sound/01-play" />

## 声音是配方，不是文件

一段声音是一份可 JSON 序列化的声明式配方（`SoundSpec`）：若干并行发声层，每层一条增益包络，可带音高包络、滤波与混响送出。

```ts
import type { SoundSpec } from '@xihan-ui/sound'

const ding: SoundSpec = {
  layers: [
    {
      kind: 'oscillator',
      wave: 'sine',
      frequency: [{ time: 0, value: 1046.5 }], // C6
      gain: [
        { time: 0, value: 0 },
        { time: 0.01, value: 0.25 }, // 10ms 起音，避免爆音
        { time: 0.3, value: 0, curve: 'exp' }, // 指数衰减
      ],
    },
  ],
  space: 0.2, // 混响送出量
}
```

配方是纯数据，这带来三件事：主题可以整套替换、用户配置可以持久化再回放、调音界面可以直接编辑它——比如下面这个：

<XhDemo src="sound/04-designer" />
播放前配方一律过一道钳制（`clampSpec`）：越界钳住、类型不对回落、未知形态丢弃，坏数据不炸播放、也不会产出刺耳或超长的声音。

## 语义名与主题

主题把语义名映射到配方。内置 14 个语义名：

`click` `tap` `toggle-on` `toggle-off` `open` `close` `success` `error` `warning` `info` `notification` `send` `receive` `complete`

内置三套主题，每套都覆盖全部语义名：

| 主题 | 性格 |
| --- | --- |
| `defaultSoundTheme` | 清亮乐音系：C 大调琶音、高频短敲、适度混响 |
| `minimalSoundTheme` | 短促干净、无混响，整段不超过 0.3 秒，只标记事件不渲染情绪 |
| `softSoundTheme` | 低音区正弦、慢起音、厚混响，提示要被听见但不许惊到人 |

自定义主题就是普通对象展开：

```ts
import { defaultSoundTheme, defineSoundTheme } from '@xihan-ui/sound'

const mine = defineSoundTheme({
  ...defaultSoundTheme,
  click: ding, // 换掉一个，其余沿用
})
```

## 基础用法

```ts
import { createSoundPlayer, softSoundTheme } from '@xihan-ui/sound'

const sound = createSoundPlayer({
  volume: 0.5, // 主音量 0..1
  enabled: true, // 接到用户偏好上，别替最终用户决定
  throttle: 50, // 同名声音的最小重触发间隔（毫秒）
})

sound.play('success')
sound.play('click', { volume: 0.5 }) // 单次音量系数
sound.play(ding) // 配方对象直接播，不经过主题

sound.setTheme(softSoundTheme)
sound.setVolume(0.3)
sound.setEnabled(false)
sound.dispose()
```

音频上下文**惰性创建**：第一次真正播放才建，从不出声的页面不为它付任何代价。SSR 或没有 Web Audio 的环境里所有调用静默退化成空操作，不用条件守卫。

## 在 Vue 里用

Vue 侧的适配放在**单独的子入口** `@xihan-ui/vue/sound`，两种用法：给命令式反馈服务配声，或给单个元素配声。

### 给通知与确认框配声

`withToastSound` / `withDialogSound` 包一层现成的服务，**调用点一行都不用改**：

```ts
import { createSoundPlayer, softSoundTheme } from '@xihan-ui/sound'
import { createDialogService, createToastService } from '@xihan-ui/vue'
import { setSoundPlayer, withDialogSound, withToastSound } from '@xihan-ui/vue/sound'

// 换主题、接用户偏好；不设置就用一个默认播放器
setSoundPlayer(createSoundPlayer({ theme: softSoundTheme, enabled: userPrefs.sound }))

export const toast = withToastSound(createToastService())
export const dialog = withDialogSound(createDialogService())

toast.success('已保存') // 视觉 + 听觉，返回值与原服务完全一致
await dialog.confirm({ title: '删除这条记录？' })
```

<XhDemo src="sound/02-toast" />

默认映射：

| 调用 | 声音 |
| --- | --- |
| `toast.info/success/warning/error` | 同名语义声 |
| `toast.loading` | 不发声（加载中只是过渡态） |
| `toast.update(id, { type })` | 新类型的声音，`loading` 除外——上传完成那一刻该响，改文案不该响 |
| `dialog.confirm` | `open` |
| `dialog.info/success/warning/error` | 同名语义声 |
| 关闭、消失 | 不发声 |

逐项改写，给 `null` 即这一类静音：

```ts
withToastSound(createToastService(), {
  sounds: { success: 'complete', error: null },
})
```

这两个服务挂在 body 下的独立应用里，拿不到组件树的注入——音效开关要么走 `setSoundPlayer` 的那个播放器，要么给 `options.player` 单独传一个。

服务默认还会在**首次用户手势**时解锁音频上下文（`autoUnlock`），因为通知常来自请求拦截器或推送这类非手势场景，不解锁就发不出声。

### 给单个元素配声

<XhDemo src="sound/03-directive" />

指令挂在 `click` 上而不是 `pointerdown`：键盘敲 Enter / Space 激活也要响，按下又拖开取消的那种不该响。带 `disabled` / `aria-disabled` / `data-disabled` 的元素不发声。

`@xihan-ui/sound` 是**可选** peer：不装它，主入口一行都不引，应用里不会多出一个音频引擎。

## 自动播放策略

浏览器要求用户先与页面交互，音频上下文才允许出声。播放器对此的态度：

- 点击、切换这类**手势触发**的声音天然合规——手势本身就解锁了上下文；
- 上下文仍被挂起时，只保留**最近一声**待发，恢复后补那一声，绝不把积压的提示音一口气倒出来；
- 通知这类**非手势**的声音要能响，需在任意一次用户手势里先调 `sound.unlock()` 提前解锁。

```ts
// 应用入口处：首次交互解锁，之后 SignalR 推来的通知就能出声
window.addEventListener('pointerdown', () => sound.unlock(), { once: true })
```

声音默认是打扰。把 `enabled` 与音量接到用户偏好里持久化，首选给出「关」的入口——这层礼貌是应用的责任，播放器只负责让开关随时生效。

## 调音

三个包络工厂把常用形状写短：

```ts
import { flat, glide, strike } from '@xihan-ui/sound'

strike(0.3, 0.005, 0.2) // 敲击：5ms 起音到 0.3，再 200ms 指数衰减
flat(880) // 恒定值（音高 880Hz）
glide(440, 880, 0.12) // 滑音：120ms 从 440 滑到 880
```

层可以叠：琶音是几层错开 `delay` 的正弦，风声是一层扫频 lowpass 的噪声，按键是一层三角波加一撮 highpass 白噪。配方能用的原料：振荡器四种波形、白噪与粉噪、双二阶滤波五型（`lowpass` `highpass` `bandpass` `notch` `peaking`）、共享混响总线，整包不到 5 kB。

## 相关

- [背景层](./backgrounds)——同为 `features/` 组的可选能力层，视觉对偶
