---
'@xihan-ui/styles': patch
---

Field / Fieldset 的校验换色与错误文案补上动效：Field 标签与说明换色走 `--xh-motion-duration-micro`，与 Fieldset 组标题同一档；错误文案出现时淡入（`--xh-motion-duration-enter`），首帧就报错的直接呈现。收起的错误文案不再交给浏览器的 `display: none`，改成不可见、不进可及树、不占位的盒；Field 没有说明占着那一行时，收起的错误文案自己留在流里占住预留的一行（取代根上的 `::after` 占位），退场在这一行里淡出（`--xh-motion-duration-exit`），播完才藏起，外框高度前后不变。带说明的 Field 与 Fieldset 收起时那一行当场交还说明或收起，错误文案随即让位。
