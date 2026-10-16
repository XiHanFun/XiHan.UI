---
'@xihan-ui/viz': minor
---

新增 `pivotWider(rows, { key, by, value, columnName? })`：把长表转成宽表，供图表按某个维度拆出多条系列。

- `key` 相同（按 `valueKey` 判同，可为多个字段）的行合成一行，结果行保留这些字段，次序是身份首次出现的次序。
- `by` 的每个取值（缺失值也算一个）把 `value` 字段展开成一列；`value` 给多个字段时每个字段各展开一组列。
- 返回 `{ rows, columns }`，`columns` 逐列给出列名、对应的取值与来源字段；没有对应长表行的格子不写。
- 同一身份在同一取值上出现两次，或展开出的列名与身份字段、彼此重名时抛 `XH_VIZ_DUPLICATE_KEY`。
