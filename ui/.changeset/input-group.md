---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

**新增** `input-group` 组件（输入组）：Vue 与 Web Components 两侧同时可用。

它收编的是一份此前只存在于示例里的写法：输入框与它的前后缀、动作钮拼成一个盒。
拼法有四处要拿捏——中缝合并、首尾圆角、聚焦那一段的层叠顺序、前后缀块与邻座同高——
照抄示例意味着每个使用者各写一遍，四处各写各的，这正是同一套控件长出两种模样的来源。

承诺的部分：`root` 负责中缝与两端圆角，`item` 是不可交互的前后缀块，档位跟着组内控件
自己的 `data-size` 走（组上写 `size` 可以直接指定）。覆盖入口是 `--xh-input-group-radius`
与 `--xh-input-group-item-*`。

实现细节、不作承诺的部分：段的识别只认直接子节点与它下面那一层的控件盒；更深的节点是
控件自己的内部结构，本组件不去动它。
