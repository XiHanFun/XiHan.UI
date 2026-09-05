---
"@xihan-ui/core": major
"@xihan-ui/web-components": major
---

**删掉废弃登记与探测整套。** 它当初是为了兑现「废弃保留期」而建的：把移走的旧名登记进一张表，dev 构建下扫一遍样式表与 DOM，旧用法经诊断通道收到一条带迁移方向的 `warn`。本库不设废弃期，那条承诺已经撤销，这套东西也随之没有位置——它从落地到现在，登记表一条都没登过。名字被移走之后唯一的告知渠道是更新日志：每次移除都在 changeset 里把旧名与替换写法逐条列全，可以直接照着在自己的代码库里全文搜索。

**破坏性：`@xihan-ui/kernel/deprecations` 这个子入口已删，从它导入的一切都不再存在。**

| 已删 | 种类 |
| --- | --- |
| `registerDeprecation` | 函数 |
| `deprecationEntries` | 函数 |
| `findDeprecatedPart` | 函数 |
| `startDeprecationScan` | 函数 |
| `resetDeprecations` | 函数 |
| `DeprecatedEntry` | 类型 |
| `DeprecationMedium` | 类型 |
| `DeprecationScanOptions` | 类型 |

`DIAGNOSTIC_CODES` 上的五个码一并删除：`deprecatedCssVar`（`deprecated.css-var`）、`deprecatedLayer`（`deprecated.layer`）、`deprecatedSelector`（`deprecated.selector`）、`deprecatedAttribute`（`deprecated.attribute`）、`deprecatedPart`（`deprecated.part`）。按码过滤诊断的地方要把这五个去掉。

Web Components 侧两处随之变了：`defineXhElements()` 在 dev 里不再启动扫描（锁步版本检查照旧）；部件契约校验遇到解剖外的角色名只报 `wc.unknown-part` 一条，不再额外报 `deprecated.part`。
