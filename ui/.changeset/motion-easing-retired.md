---
'@xihan-ui/motion': major
---

缓动表删去 `decelerate` 与 `accelerate`：组件库与令牌都不使用它们，也没有对应的令牌。引用过的改写成 `cubic-bezier()` 串：

| 旧名 | 替代写法 |
| --- | --- |
| `easing.decelerate` / `'decelerate'` | `'cubic-bezier(0, 0, 0, 1)'` |
| `easing.accelerate` / `'accelerate'` | `'cubic-bezier(0.3, 0, 1, 1)'` |

`EasingName` 类型随之少了这两个名字。
