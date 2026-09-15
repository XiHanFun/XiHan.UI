# 声音层

`@xihan-ui/sound` 是一层纯 Web Audio 的程序化 UI 音效：零音频文件、零第三方依赖、框架无关。点击、成功、报错等提示音不是加载 MP3，而是在播放瞬间用振荡器与噪声实时合成：整个包比一个音频文件更小。

它是独立的：不依赖任何适配器，任何框架（或无框架）都可直接安装使用。

下面的示例会实际发声，建议先调低音量。

<XhDemo src="sound/01-play" />

## 声音是配方，不是文件

一段声音是一份可 JSON 序列化的声明式配方（`SoundSpec`）：若干并行发声层，每层一条增益包络，可带音高包络、滤波与混响送出。

```ts
import type { SoundSpec } from "@xihan-ui/sound";

const ding: SoundSpec = {
  layers: [
    {
      kind: "oscillator",
      wave: "sine",
      frequency: [{ time: 0, value: 1046.5 }], // C6
      gain: [
        { time: 0, value: 0 },
        { time: 0.01, value: 0.25 }, // 10ms 起音，避免爆音
        { time: 0.3, value: 0, curve: "exp" }, // 指数衰减
      ],
    },
  ],
  space: 0.2, // 混响送出量
};
```

配方是纯数据，这带来三点：主题可以整套替换、用户配置可以持久化再回放、调音界面可以直接编辑它，例如：

<XhDemo src="sound/04-designer" />

播放前配方一律经过一道钳制（`clampSpec`）：越界钳住、类型不符回落、未知形态丢弃，异常数据不会导致播放失败，也不会产出刺耳或超长的声音。

## 语义名与主题

主题把语义名映射到配方。内置 14 个语义名：

`click` `tap` `toggle-on` `toggle-off` `open` `close` `success` `error` `warning` `info` `notification` `send` `receive` `complete`

内置三套主题，每套都覆盖全部语义名：

| 主题 | 性格 |
| --- | --- |
| `defaultSoundTheme` | 清亮乐音系：C 大调琶音、高频短敲、适度混响 |
| `minimalSoundTheme` | 短促干净、无混响，整段不超过 0.3 秒，只标记事件不渲染情绪 |
| `softSoundTheme` | 低音区正弦、慢起音、厚混响，提示可被听见但不惊扰 |

自定义主题即普通对象展开：

```ts
import { defaultSoundTheme, defineSoundTheme } from "@xihan-ui/sound";

const mine = defineSoundTheme({
  ...defaultSoundTheme,
  click: ding, // 替换一个，其余沿用
});
```

## 基础用法

```ts
import { createSoundPlayer, softSoundTheme } from "@xihan-ui/sound";

const sound = createSoundPlayer({
  volume: 0.5, // 主音量 0..1
  enabled: true, // 接入用户偏好，不替最终用户决定
  throttle: 50, // 同名声音的最小重触发间隔（毫秒）
});

sound.play("success");
sound.play("click", { volume: 0.5 }); // 单次音量系数
sound.play(ding); // 配方对象直接播放，不经过主题

sound.setTheme(softSoundTheme);
sound.setVolume(0.3);
sound.setEnabled(false);
sound.dispose();
```

音频上下文惰性创建：首次实际播放时才创建，从不发声的页面不为它付出任何代价。SSR 或没有 Web Audio 的环境中所有调用静默退化为空操作，不需要条件守卫。

## 在 Vue 中使用

Vue 侧的适配放在单独的子入口 `@xihan-ui/vue/sound`，两种用法：给命令式反馈服务配声，或给单个元素配声。

### 给通知与确认框配声

`withToastSound` / `withDialogSound` 包装现有的服务，调用点不需修改：

```ts
import { createSoundPlayer, softSoundTheme } from "@xihan-ui/sound";
import { createDialogService, createToastService } from "@xihan-ui/vue";
import { setSoundPlayer, withDialogSound, withToastSound } from "@xihan-ui/vue/sound";

// 更换主题、接入用户偏好；不设置时使用默认播放器
setSoundPlayer(createSoundPlayer({ theme: softSoundTheme, enabled: userPrefs.sound }));

export const toast = withToastSound(createToastService());
export const dialog = withDialogSound(createDialogService());

toast.success("已保存"); // 视觉 + 听觉，返回值与原服务完全一致
await dialog.confirm({ title: "删除这条记录？" });
```

<XhDemo src="sound/02-toast" />

默认映射：

| 调用 | 声音 |
| --- | --- |
| `toast.info/success/warning/danger` | 同名语义声（`danger` 对应 `error`） |
| `toast.loading` | 不发声（加载中只是过渡态） |
| `toast.update(id, { tone })` | 新语气的声音，`loading: true` 仍开启时除外：上传完成时应发声，修改文案不应发声 |
| `dialog.confirm` | `open` |
| `dialog.info/success/warning/error` | 同名语义声 |
| 关闭、消失 | 不发声 |

逐项改写，传 `null` 即该类静音：

```ts
withToastSound(createToastService(), {
  sounds: { success: "complete", danger: null },
});
```

这两个服务挂在 body 下的独立应用中，无法获取组件树的注入：音效开关要么使用 `setSoundPlayer` 设置的播放器，要么通过 `options.player` 单独传入。

服务默认在首次用户手势时解锁音频上下文（`autoUnlock`），因为通知常来自请求拦截器或推送等非手势场景，不解锁则无法发声。

### 给单个元素配声

<XhDemo src="sound/03-directive" />

指令挂在 `click` 上而不是 `pointerdown`：键盘按 Enter / Space 激活也应发声，按下后拖开取消的不应发声。带 `disabled` / `aria-disabled` / `data-disabled` 的元素不发声。

`@xihan-ui/sound` 是可选 peer：不安装时主入口不引用它，应用中不会多出音频引擎。

## 在 React 中使用

React 侧的适配同样放在单独的子入口 `@xihan-ui/react/sound`。服务层与 Vue 完全同名同形：

```ts
import { createSoundPlayer, softSoundTheme } from "@xihan-ui/sound";
import { createDialogService, createToastService } from "@xihan-ui/react";
import { setSoundPlayer, withDialogSound, withToastSound } from "@xihan-ui/react/sound";

// 更换主题、接入用户偏好；不设置时使用默认播放器
setSoundPlayer(createSoundPlayer({ theme: softSoundTheme, enabled: userPrefs.sound }));

export const toast = withToastSound(createToastService());
export const dialog = withDialogSound(createDialogService());

toast.success("已保存"); // 视觉 + 听觉，返回值与原服务完全一致
await dialog.confirm({ title: "删除这条记录？" });
```

默认映射、逐项改写与 `autoUnlock` 的口径与上表一致：两侧包装的是同一份语义。

给单个元素配声的方式不同：指令是 Vue 独有的介质，React 侧对应的是 `useSoundOnPress`，返回一个挂到元素 `ref` 上的回调：

```tsx
import { useSoundOnPress } from "@xihan-ui/react/sound";

<button ref={useSoundOnPress()}>提交</button>
<button ref={useSoundOnPress("send")}>发送</button>
<div ref={useSoundOnPress({ sound: "toggle-on", volume: 0.6 })} />;
```

监听同样挂在 `click` 上而不是 `pointerdown`：键盘按 Enter / Space 激活也应发声，按下后拖开取消的不应发声。带 `disabled` / `aria-disabled` / `data-disabled` 的元素不发声。

传入的值每次渲染时读取：更换语义名、音量、播放器都不必解绑重绑，按下时取当前值。ref 回调本身常驻，React 不会因重渲染反复解绑重绑。

给库内组件配声时，把回调挂到它转发的 ref 上；组件不转发 ref 时，包一层自己的元素，声音随该次点击的冒泡触发。

## 自动播放策略

浏览器要求用户先与页面交互，音频上下文才允许发声。播放器的处理：

- 点击、切换这类手势触发的声音天然合规：手势本身已解锁上下文；
- 上下文仍被挂起时，只保留最近一声待发，恢复后补发该声，不会把积压的提示音一次全部播放；
- 通知这类非手势的声音需要发声时，需在任意一次用户手势中先调用 `sound.unlock()` 提前解锁。

```ts
// 应用入口处：首次交互解锁，之后 SignalR 推送的通知即可发声
window.addEventListener("pointerdown", () => sound.unlock(), { once: true });
```

声音默认是打扰。把 `enabled` 与音量接入用户偏好并持久化，优先提供关闭入口：这是应用的责任，播放器只负责让开关随时生效。

## 调音

三个包络工厂简化常用形状：

```ts
import { flat, glide, strike } from "@xihan-ui/sound";

strike(0.3, 0.005, 0.2); // 敲击：5ms 起音到 0.3，再 200ms 指数衰减
flat(880); // 恒定值（音高 880Hz）
glide(440, 880, 0.12); // 滑音：120ms 从 440 滑到 880
```

层可以叠加：琶音是几层错开 `delay` 的正弦，风声是一层扫频 lowpass 的噪声，按键是一层三角波加少量 highpass 白噪。配方可用的原料：振荡器四种波形、白噪与粉噪、双二阶滤波五型（`lowpass` `highpass` `bandpass` `notch` `peaking`）、共享混响总线，整包不到 5 kB。

## 相关

- [背景层](./backgrounds)：同为 `features/` 组的可选能力层，视觉对偶
