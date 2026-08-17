---
"@xihan-ui/headless": minor
"@xihan-ui/vue": patch
"@xihan-ui/web-components": patch
---

pin-input 新增 `pattern`：每格接受哪些字符可以自己定，不再只有 numeric / alphabetic / alphanumeric 三档。

`pattern` 收一段正则源码，内部补上首尾锚与 `u` 标志后逐个字符整格匹配——作者写 `[0-9A-Fa-f]`
就够，不必自己写锚点，代理对（emoji 这类）也匹得上。给了它就盖过 `type` 的准入表；
写坏了（编不成正则）**退回 `type` 的准入表而不是放行一切**，也不抛。

敲、粘贴、外部 `setValue` 三条写值的路都过同一份准入表。

`type` 保留原职：它仍然决定移动端弹哪种键盘。准入放宽到字母时记得把 `type` 一并改掉，
否则弹的还是数字键盘、那几个字符敲不进来——这一条写进了 props 说明与示例。
