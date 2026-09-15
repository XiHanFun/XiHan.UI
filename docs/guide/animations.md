# 动画层

`@xihan-ui/animations` 提供现成的动效：11 个进场预设、6 个注意预设，外加错开起播与文字拆分。零第三方依赖，框架无关，任何框架（或无框架）都可直接安装使用。

它建立在 [动效原语](/guide/motion) 之上：减弱动效的降级由该层统一处理，本层不另开通道。

<XhDemo src="animations/01-presets" />

## 动画是配方，不是类名

一段动画是一份可 JSON 序列化的配方（`MotionSpec`）：若干视觉帧加一组时序参数。

```ts
import type { MotionSpec } from "@xihan-ui/animations";

const riseUp: MotionSpec = {
  frames: [
    { opacity: 0, y: 24, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1 },
  ],
  duration: 420,
  easing: "emphasized",
};
```

一帧可以修改六个属性：`opacity` `x` `y` `scale` `rotate` `blur`。位移写数字按 px，写字符串原样透传（`'100%'`）。省略的字段表示该帧不参与该属性的插值。

配方是纯数据，因此可以存入数据库、由界面下拉切换、由用户修改后存回。播放前一律经过一道钳制（`clampSpec`）：越界钳住、非有限值丢弃、帧数与时长有上限，异常数据不会导致播放失败。

展开为宿主可识别的关键帧时有一条规则：某个属性只要有一帧声明过，其余帧就补上它的中性值。只在中间帧出现的属性，宿主会以元素当前的计算值作为端点，而该值随皮肤变化：同一份配方在不同皮肤下会成为不同的动画。

## 预设

进场一族把元素从不在场带到静息态：

`fade` `fade-up` `fade-down` `fade-start` `fade-end` `zoom-in` `zoom-out` `blur-in` `rise` `drop-in` `spin-in`

注意一族从静息态出发，回到静息态：

`shake` `pulse` `bounce` `wobble` `flash` `heartbeat`

两族都不保留终值：播完后元素回到皮肤定义的外观，动画不接管静息态。这也是它们可以反复播放的原因。

`fade-start` / `fade-end` 标了 `logical`，横向位移在 RTL 下自动取反；`fade-up` 这类纵向的不受影响。

## 播

```ts
import { createMotionPlayer } from "@xihan-ui/animations";

const motion = createMotionPlayer();

await motion.play(card, "fade-up");
motion.play(input, "shake"); // 校验未通过时抖动
motion.play(el, { frames: [{ opacity: 0 }, { opacity: 1 }], duration: 500 }); // 直接传配方
```

同一元素上再次播放会先撤销上一段：两段同时写同一批属性时，后一段会从被修改的中间态起步。被撤销的 `play` 以 `'cancelled'` 结算，不抛异常。

播放器上有开关、时长系数与预设表：

```ts
const motion = createMotionPlayer({
  enabled: true, // 接入用户偏好，不替最终用户决定
  speed: 1, // 全局时长系数，越大越慢
  presets: myPresets, // 省略时使用内置预设
});

motion.setEnabled(false); // 关闭时撤销正在播放的动画，但 play 照常结算
motion.cancel(el); // 撤销一个
motion.cancel(); // 全部撤销
```

播放未收录的名字不播放、不抛异常，只产出一条诊断告警（见 [诊断通道](/guide/diagnostics)）。

## 错开起播

<XhDemo src="animations/02-stagger" />

```ts
await motion.playAll(list.children, "rise", { stagger: 40, from: "center" });
```

`from` 决定从哪一端铺开：`first` 从头、`last` 从尾、`center` 从中间向两侧。间隔叠加在给定的基础延迟上。任意一个被打断，整体即视为被打断。

## 文字拆分

`splitText` 把一段文字拆为逐字或逐词的行内块，正好是 `playAll` 需要的一组元素。

```ts
import { splitText } from "@xihan-ui/animations";

const { parts, restore } = splitText(title, { by: "char" });
await motion.playAll(parts, "fade-up", { stagger: 30 });
restore();
```

按码点切分，不会把 emoji 拆成两半；空白原样保留，换行正常。每一段都是 `inline-block`：行内元素不受 `translate` 与 `scale` 影响。

::: warning 无障碍
原文会写入容器的 `aria-label`，拆出的每一段标记 `aria-hidden`：逐字的 `span` 会让部分读屏逐字朗读。

这意味着容器的角色必须支持命名（标题、按钮、链接等）。套在裸 `div` 上时读屏可能读不到无障碍名，此时需另行提供可访问文本。使用完毕后调用 `restore()`。
:::

## 反向播放

`reverseSpec` 把一份进场配方翻转为退场配方：帧序反转、偏移量镜像。逐帧缓动会被丢弃：它描述的是本帧到下一帧的过渡，反转之后该区间的归属改变。

```ts
import { motionPresets, reverseSpec } from "@xihan-ui/animations";

await motion.play(el, reverseSpec(motionPresets["fade-up"]));
```

弹窗这类会挂载卸载的进出场不使用它：那需要在卸载前播完动画，应使用 [行为原语](/guide/behavior) 的进出场时序，动画本身交给 CSS `@keyframes`。这里的退场适合元素常驻、只是隐藏的场景。

## 滚动进入视口后播放

观察不是动画，不收纳在本包中。用 `@xihan-ui/core` 的 `createViewportEntry` 观察，在回调中调用 `play`：

```ts
import { createViewportEntry } from "@xihan-ui/core";

createViewportEntry({
  scope,
  target: () => card,
  onEnter: () => void motion.play(card, "rise"),
});
```

## 相关

- [动效原语](/guide/motion)：缓动、弹簧、减弱动效偏好
- [行为原语](/guide/behavior)：进出场时序、滚动观察
- [声音层](/guide/sound)：同一套配方、预设、播放器的形态，换为听觉
