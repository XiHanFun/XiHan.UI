---
"@xihan-ui/motion": major
"@xihan-ui/headless": major
"@xihan-ui/vue": major
"@xihan-ui/web-components": major
---

**补间不再自带一套缓动曲线，改从共用的那张表取。** `tween.ts` 从前写死四条曲线（`ease-in` 是 `t³`、`ease-out` 是 `1-(1-t)³`），与 `easing.ts` 里同名的那几条**不是同一条曲线**——同一个动作用 CSS 声明和用 JS 逐帧算，走出来的路径不一样。现在补间经 `resolveEasing` 取曲线，JS 侧只剩 `easing.ts` 一张表，而它逐值对着设计令牌，由 `check-motion-source` 对账。

**删掉的公开面（`@xihan-ui/motion`）**：

| 删掉 | 改用 |
| --- | --- |
| `TweenEasing` 类型 | `EasingName`（曲线名）或 `EasingFunction`（自带函数） |
| `tweenEasings` 曲线表 | `easing` 曲线串表 + `resolveEasing` |
| `resolveTweenEasing` | `resolveEasing` |

`TweenSpec.easing` 现在收三种写法：曲线名、`cubic-bezier(...)` / `linear` 串，或函数本身。`@xihan-ui/headless` 随之不再转出 `TweenEasing`，改转 `EasingName`。

**破坏性：`number-animation` 的 `easing` 换了取值域。** 从前的四档 `linear` / `ease-in` / `ease-out` / `ease-in-out` 里，只有 `linear` 还认；另外三个不再是已知曲线名，会退回线性。逐条改成曲线表里的名字：

| 从前 | 改成 |
| --- | --- |
| `ease-in` | `easeIn` |
| `ease-out` | `easeOut` |
| `ease-in-out` | `easeInOut` |

同时可选的还有 `standard` / `emphasized` / `decelerate` / `accelerate` / `outStrong`，以及直接写一条 `cubic-bezier(...)` 串。曲线换过之后数字滚动的路径与同名 CSS 声明一致。

**对账面加一条。** `check-motion-source` 从四对缓动常量扩到五对，把 `ease.in-out` ↔ `easing.easeInOut` 也纳入逐字比对——令牌那条 `$description` 早就写着两者同值，此前没人拦。
