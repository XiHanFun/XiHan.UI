---
'@xihan-ui/tokens': minor
'@xihan-ui/styles': patch
---

新增语义令牌 `--xh-overlay-toast-w`（28.75rem），Notification 的 toast 预设卡宽与叠放定位面改从它取值，不再在皮肤里写字面尺寸。像素不变；要让全站轻提示统一变宽或变窄，在根上改这一个令牌即可，单个实例照旧用 `--xh-notification-item-w` 覆盖。
