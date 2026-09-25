---
'@xihan-ui/motion': minor
'@xihan-ui/tokens': minor
---

新增有状态弹簧 `createSpringValue`：持有当前值、速度与目标，`to(target, { velocity })` 中途改目标时以当前位移与速度为初始条件重新求解，位置与速度都不跳变，手势松手的速度可以原样交给动画；在目标处带着速度松手也会运动。每一段运动是时间的闭式解，与帧率无关；减弱动效下直接落到终态；非法参数立即抛 `TypeError`。

弹簧预设进入令牌：`--xh-motion-spring-<名>-stiffness / -damping`（snappy、smooth、gentle、bouncy、stiff，以及 liquid 档用的 toggle、lead、trail），`springPresets` 与令牌同源并由门禁双向对账。
