---
"@xihan-ui/styles": patch
---

**无层产物里 Action Control 三档字号在 reset 之后生效。** reset 层的每条选择器改由 `:where()` 包住，特指度压到 (0,0,0)。此前 `index.unlayered.css` 里 Family Recipe 的根规则（`[data-xh-action-control]`，(0,1,0)）排在 reset 段之前，而 reset 的 `font: inherit` 同为 (0,1,0)，靠源序把配方的 sm/md/lg 字号全压回 16px；有层版本靠层序不受影响。修法是压低 reset 而不是抬高配方，`check-layer-order` 门禁新增断言：reset 层剥去伪元素后必须整个由 `:where()` 包住，且无层产物里配方根规则仍排在 reset 之前。代价是无层模式下宿主的元素选择器 (0,0,1) 也压得过 reset，已写进文档站「皮肤与样式分层」。

reset.css 去注释压空白后由 475 字节涨到 566 字节（+19%）：每条选择器多一层 `:where()`，伪元素两条无法放进 `:where()` 而拆成独立规则；`.size-limit.css.json` 只重落 reset.css 这一条。
