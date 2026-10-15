---
'@xihan-ui/headless': minor
---

`@xihan-ui/headless` 新增不抛异常的码值检查，设计器保存模板、表单校验录入时可直接拿到问题码：

- `checkBarCodeValue(format, value, options?)`：能编码或内容为空串时返回 `undefined`，否则返回 `BarCodeValueIssue`，问题码为 `unknown-format`、`invalid-character`（带出字符）、`invalid-length`（带出接受的位数与收到的位数）、`invalid-check-digit`（带出应为与收到的校验位）、`invalid-number-system`（UPC-E）。
- `checkMatrixCodeValue(format, value, options?)`：选项为 `level`、`gs1`、`rectangular`、`columns`，返回 `MatrixCodeValueIssue`，问题码为 `unknown-format`、`invalid-level`、`invalid-columns`、`capacity-exceeded`。
- `QR_LEVELS`（`['L', 'M', 'Q', 'H']`）与 `matrixCodeLevelFit(format, level)`：判断纠错级别对码制是 `valid`、`invalid` 还是 `ignored`（data-matrix 没有级别可选）。

判据与 `connectBarCode` / `connectMatrixCode` 相同：检查返回问题时，组件落 `error` 态。组件的错误说明文字不变。
