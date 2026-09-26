---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
'@xihan-ui/styles': minor
---

Marquee 新增暂停开关与暂停状态，悬停与聚焦暂停缺省开启。

- 新增部件 `autoplay-trigger`（Vue / React `XhMarqueeAutoplayTrigger`，Web Components `data-xh-part="autoplay-trigger"`，须写为 `<button>`）：窗口行尾的单图标按钮，指针、键盘与触屏都能停住滚动（WCAG 2.2.2）。可及名随状态切换为下一步的动作（`Pause scrolling` / `Resume scrolling`），`data-state` 投影 `running` / `paused`；不给内容时皮肤画暂停 / 播放图标。减弱动效与打印下随轨道一起收起。
- 暂停状态改由状态机持有：新增 `defaultPaused`、`translations`、`onPausedChange`（Vue `paused-change` 与 `update:paused`，Web Components `paused-change` 事件与 `setPaused()` 方法）；`paused` 变为受控属性，给了它，暂停开关只通知、由作者写回。新增导出 `marqueeMachine`、`MarqueeSchema`、`MarqueePausedChangeDetails`。
- `connectMarquee(props, normalize)` 改为 `connectMarquee(service, normalize)`，与其余带状态机的组件一致；`MarqueeApi` 新增 `paused`、`setPaused` 与 `getAutoplayTriggerProps`。
- `pauseOnHover` 缺省由关改为开，要关掉须显式写 `false`（Web Components 写 `pause-on-hover="false"`）。指针或焦点停在暂停开关上不计入悬停 / 聚焦暂停，按下「继续」即刻恢复滚动。
- 皮肤新增覆盖槽 `--xh-marquee-trigger-inset`、`--xh-marquee-trigger-bg`、`--xh-marquee-trigger-bg-hover`、`--xh-marquee-trigger-bg-active`、`--xh-marquee-icon-size`；开关压在走动的内容上，底取不透明的面，悬停 / 按下走同一承载面的不透明阶梯。`marquee.css` 因开关的定位、面、图标与减弱动效 / 打印规则增至 6362 字节，并引入动作控件配方。
