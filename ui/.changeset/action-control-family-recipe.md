---
'@xihan-ui/headless': minor
'@xihan-ui/styles': minor
---

建立由单一 JSON 真源生成的 Action Control Family Recipe，统一普通文字动作、icon-only / close、字段内嵌控制与浮动动作四种 profile 的 xs/sm/md/lg 视觉盒、状态、显示策略、逻辑方向和输入能力规则。

Button 首批迁入该配方：Headless 只投影 `data-xh-action-*` 稳定视觉角色，皮肤保留既有 variant / tone / size / shape 和公开覆盖槽；粗指针下文字动作仅扩块轴，方形动作双轴保持至少 44px，forced-colors 与 reduced-motion 分别复用系统色和全局动效语义令牌。
