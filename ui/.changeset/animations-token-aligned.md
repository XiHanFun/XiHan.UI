---
'@xihan-ui/animations': major
---

预设改取动效令牌，播放器在入口校验配方。

- 预设的时长、位移与曲线取自 `@xihan-ui/motion` 的语义常量，与令牌同值：`fade` 取 `enter`（200ms，原 240ms）；带位移的淡入、缩放与模糊取 `slide`（320ms）与 `--xh-motion-distance-lg`（16px，原 12px）；`rise` / `drop-in` / `spin-in` 取 `slide + enter`（520ms）、位移 24px、曲线 `--xh-motion-ease-emphasis`；注意一族统一取 `--xh-motion-duration-attention`（640ms，原 520–900ms）。
- `bounce` 的逐帧缓动此前以 `easeOut` 这类名字直接交给 `Element.animate`，真实浏览器会拒绝整段关键帧；`toKeyframes` 现在把逐帧缓动名换成 CSS 写法。
- 删除 `clampSpec`，新增 `validateMotionSpec`：配方越界不再被悄悄钳住或补值，`play` / `playAll` 合上本次选项与时长系数之后校验，不合法时同步抛 `RangeError`（缓动写法不合法抛 `TypeError`），不起播。任意一秒内闪烁超过三次（WCAG 2.3.1）同样拒播；`peakFlashesPerSecond` 给出一份配方任意一秒内最多闪几次。新增常量 `MAX_ITERATIONS`、`MAX_FLASHES_PER_SECOND`。
- `createMotionPlayer` 的 `speed` 不在 (0, 100] 内、`playAll` 的 `stagger` 为负或非有限时抛错，不再退回缺省值。
- `playAll` 的缺省间隔改取 `--xh-motion-stagger-step`（40ms，原 60ms）。

迁移：原先依赖钳制的配方先调用 `validateMotionSpec` 找出越界字段；要保持旧的节奏，给 `play` 传 `duration`，或给 `playAll` 传 `stagger: 60`。
