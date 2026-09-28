---
'@xihan-ui/styles': patch
---

PasswordInput 强度条改为数值角色的动效：填充不再按 25 / 50 / 75 / 100% 改 `inline-size`、换档硬切，而是铺满轨道、按档位比例平移，由轨道圆角裁掉未完成的那一截（`--xh-motion-duration-move` / `--xh-motion-ease-continuous`，只走合成）；危险 → 警示 → 成功三段底色换档走 `--xh-motion-duration-micro` 淡变；平移乘 `--xh-direction-sign`，RTL 下从行首（右侧）长出。
