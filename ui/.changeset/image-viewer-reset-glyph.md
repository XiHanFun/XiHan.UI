---
'@xihan-ui/icons': minor
'@xihan-ui/tokens': minor
'@xihan-ui/styles': patch
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
---

看片工具条的复原钮不写内容时改由皮肤画图标，与其余六颗变换钮一致：此前 Vue / React 在钮里塞「1:1」文字，工具条上只有它是字。图标集新增 `undo`（U 形回转箭头，与旋转的整圈箭头区分开），令牌新增 `--xh-glyph-mark-undo`；可及名仍取语言包里的「复原」，高对比档与其余工具钮同一条系统色补救。Web Components 由作者写空的 `reset-trigger` 按钮即可。
