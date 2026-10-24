---
'@xihan-ui/headless': minor
---

**新增** 菜单的 `translations.trigger`：触发按钮里只放图标（皮肤画的字形、没有文字）时，名字写在这里，落成按钮的 `aria-label`；菜单容器仍经 `aria-labelledby` 指回触发器，跟着取到同一个名字。不写时照旧由按钮里的文字命名。它取自实例自己的内容，语言包不收。
