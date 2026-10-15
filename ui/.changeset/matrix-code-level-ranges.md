---
'@xihan-ui/headless': minor
---

`@xihan-ui/headless` 新增 `MATRIX_CODE_LEVEL_RANGES` 与类型 `MatrixCodeLevelRange`：pdf417 的纠错级别为 `{ min: 0, max: 8, step: 1 }`，aztec 的纠错百分比为 `{ min: 5, max: 95, step: 1 }`，供属性面板做数字输入、宿主校验模板时取用。`matrixCodeLevelFit` 与 `checkMatrixCodeValue` 按这份范围判断，组件的错误说明里的上下限也取自它。
