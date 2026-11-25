---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Rating「再点一次清零」从 `allowClear` 改叫 `clearable`，与 TextField、ColorField、FormatInput 的 `clearable` 同一个词：单词能说清的能力开关用 `-able`。缺省仍是开着，写 `clearable={false}` 关掉。

| 旧名 | 新名 |
| --- | --- |
| `allowClear`（WC attribute `allow-clear`） | `clearable`（WC attribute `clearable`） |
