---
"@xihan-ui/styles": patch
---

**修复**九份皮肤的尺寸档挡在使用者槽前面，改一处视觉改不动。

**AI 族七份的档位直接给公开槽赋值。** `approval` / `code-view` / `diff-view` / `markdown-stream` / `message-feed` / `reasoning` / `tool-call` 的 `[data-size]` 三档写的是 `--xh-markdown-stream-font-size` 这类公开槽本身。自定义属性的解析先看元素自己身上有没有声明，档位声明就落在 root 上，作者在祖先上设的同名覆盖永远轮不到——改了没反应，也没有任何报错。三档改写 `--xh-_<组件>-*` 私有槽，缺省档写进 root 基础规则，公开槽只留在读处当首选。这一改还顺带把这批槽交给了 `check-size-ladder`（它认的是私有槽三档阶梯），门禁覆盖的阶梯从 496 组涨到 536 组。

**`icon` 的 sm / lg 档与 light / bold 档直接写终值**，绕过 `--xh-icon-size` 与 `--xh-icon-stroke`。写了 `size` / `weight` 的那一枚从此不认外层下发的直径与描边：放进 `icon-wrapper` 里，底座换档而里面的图元原地不动。两档取值改成 `var(--xh-icon-size, <该档默认>)` 的形状，使用者槽排在档值前面。

**`avatar` 的 sm / lg 档同样直接写终值**，绕过 `--xh-avatar-size` 与 `--xh-avatar-font-size`。`avatar-group` 正是靠下发这两个槽让一排头像齐平，组里但凡有一枚自己写了 `size="sm"`，整排就缺一个口——而这枚头像多大，作者在组上根本调不动。改法同 `icon`。单独摆的头像取不到这两个槽，仍按自己的档走。

没有删名、没有改名，也没有新增公开槽；此前显式设过这些槽却不生效的写法，现在开始生效。
