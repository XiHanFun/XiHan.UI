---
'@xihan-ui/headless': minor
---

`@xihan-ui/headless` 新增 `compileFormPattern(source, { flags?, allowedFlags?, fullMatch?, maxLength? })`。正则以字符串形式保存在模板或服务端下发的规则里时，用它编译成表单规则 `pattern` 所需的 `RegExp`。

- 编译成功返回 `{ ok: true, regex }`。
- 编译失败返回 `{ ok: false, code }`，不抛异常：
  - `invalid-flags`：标志不在允许范围内，或有重复。缺省只允许 `imsu`。`g` 与 `y` 带状态，不在缺省范围内。
  - `too-long`：源码超过长度上限，缺省 1000。
  - `invalid-pattern`：源码不是合法的正则。
- `fullMatch` 把源码包成 `^(?:源码)$`，按整串匹配。源码要先能单独编译，带着 `a)|(b` 这类不配对写法的源码，无法借包装绕过检查。
- 只检查语法，不判断回溯开销。来自不受信方的正则，仍要在服务端限时执行。
