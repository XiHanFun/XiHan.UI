---
'@xihan-ui/core': minor
'@xihan-ui/styles': minor
---

液态面的按下形变：按住液态面时面朝手指鼓出、沿指向拉长、另一个方向压扁（不低于 `--xh-motion-scale-squash`），拖离时越拉越长、按越界衰减趋近上限；松手由 `spring-toggle` 带回原形。形变由 core 写成私有槽 `--xh-_liquid-deform`，FloatButton 触发器与 BackTop 的液态面拿它当 transform；减弱动效下不形变。
