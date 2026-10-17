---
'@xihan-ui/expression': minor
---

为表达式编辑器补齐三样能力：

- 函数签名新增 `params`：参数的英文键，如 `IF` 是 `condition`、`whenTrue`、`whenFalse`，编辑器按键取显示文字，用来提示 `IF(条件, 真值, 假值)` 这样的参数。内置函数全部给出；`table.lookup(name)` 一并返回。宿主函数可以不给，给出时是小写字母开头的英文键，互不重复，个数等于 `maxArgs`，不限个数时等于 `max(minArgs, 1)`，不符时登记即抛 `TypeError`。
- `scanTokens(source)`：容错的词法扫描，与解析器同一套词法，遇到错误不中断，未闭合的字符串一直到源码末尾，不认识的字符单独成一个 `unknown` 词。编辑器用它判断光标是否落在字符串或数字里。
- `createExpressionCheck(engine, options?)`：用引擎的 `compile` 做检查，返回 `(source) => issues`，编译失败时是全部问题，成功时为空数组，可直接作为表达式输入框的 `check`。
