# 会话线程 <Badge type="info" text="thread" />

AI 对话组件。三层同源：无头内核给出解剖与状态机，Vue 组件与自定义元素只是它的两层外壳，行为完全一致。

## 产物

| 层 | 值 |
| --- | --- |
| 自定义元素 | `<xh-thread>` |
| Vue 组件 | `XhThreadContent` `XhThreadLiveRegion` `XhThreadRoot` `XhThreadScrollButton` `XhThreadViewport` |
| 组合式函数 | `useThread` |
| 状态机 | `threadMachine` |
| 皮肤 | `@xihan-ui/styled/thread.css` |

## 解剖

部件名即 `data-part` 属性值，也是皮肤的选择器。加粗的是必备部件，不渲染它组件不工作（Web Components 适配器会在诊断通道上报 `wc.missing-part`）。

`data-scope="thread"`：**`root`** · **`viewport`** · **`content`** · `scroll-button` · `live-region`

## Props

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | `ThreadStatus` |  | 这一轮的运行态，由宿主传入。 |
| `threshold` | `number` |  | 距底多少 px 视为在底，缺省用粘底原语的默认值。 |
| `translations` | `Partial<ThreadTranslations>` |  |  |
| `onStickChange` | `(details: ThreadStickChangeDetails) => void` |  | 粘底状态变化时通知宿主。 |

## 状态机

**状态**：`idle`

**事件**：`STICK.CHANGE` · `SCROLL_TO_BOTTOM`

## connect API

`useThread` 产出的对象。`getXxxProps()` 铺到对应部件的宿主元素上，其余是可读状态与操作入口。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `ThreadStatus` |  |
| `atBottom` | `boolean` |  |
| `sticking` | `boolean` |  |
| `showScrollButton` | `boolean` | 是否显示回到底部按钮，不在底部时为 true。 |
| `scrollToBottom` | `() => void` |  |
| `getRootProps` | `() => T['element']` |  |
| `getViewportProps` | `() => T['element']` |  |
| `getContentProps` | `() => T['element']` |  |
| `getScrollButtonProps` | `() => T['button']` |  |
| `getLiveRegionProps` | `() => T['element']` |  |

## 键盘

规格出处：[W3C APG](https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/)

| 按键 | 生效条件 | 行为 |
| --- | --- | --- |
| `Tab` | 焦点进入消息区 | 消息区自身可聚焦，方向键/PageUp/PageDown 交给浏览器滚动，组件不接管 |
| `Space` / `Enter` | 焦点在"回到底部"按钮上 | 滚回底部并重新粘附 |
