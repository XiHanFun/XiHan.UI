---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

表单规则的 `min` / `max` 对字符串改按字素计数，和文本框的字数统计、`maxLength` 用同一把尺子。`@xihan-ui/headless` 同时公开这把尺子 `graphemeLength(text)`。

- 字素就是用户数得出来的「一个字」：组合 emoji（如 👨‍👩‍👧‍👦）、国旗、带变音符的字母各算一个。此前按 UTF-16 码元计，一个组合 emoji 会算成好几个字，与输入框里显示的字数对不上。
- 数组仍按元素个数比，数值仍比大小。
- `graphemeLength` 在没有 `Intl.Segmenter` 的引擎上退回按码点计数。
- 数据库按列长限制时（如 PostgreSQL 的 `varchar(n)` 按码点计），后端仍要自己校验长度。.NET 端用 `StringInfo.LengthInTextElements` 能得到同样的字数。

迁移：如果依赖原先按 UTF-16 计数的上下限，比如为了贴合数据库列宽，请改在 `validator` 里自行计数，并保留后端校验。
