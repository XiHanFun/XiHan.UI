---
"@xihan-ui/headless": patch
---

select / combobox / popselect 的条目 `pointerleave` 改按「还在不在容器里」判早退，条目之间有间距时高亮不再一跨一闪。

此前三家判的是 `relatedTarget` 有没有落在另一个条目上。条目紧贴时这条判据成立，一旦条目之间留出间距，指针从 A 挪到 B 途中会先落在缝上，`relatedTarget` 是容器而不是相邻条目，于是每跨一条就清一次高亮——select 与 popselect 还会顺手把焦点还给容器，`aria-activedescendant` 与 roving tabindex 跟着反复变更，读屏一路播报。

改用 menu / context-menu 一直在用的判据：`relatedTarget` 仍在本浮层容器里就早退。select 取 `list`（指针挪到 footer 上仍按离开处理），combobox 与 popselect 取 `content`。指针真的移出列表时 `relatedTarget` 落在容器之外或为空，照旧清高亮、归还焦点。
