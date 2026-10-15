---
'@xihan-ui/headless': minor
---

`@xihan-ui/headless` 新增码制列表常量 `BAR_CODE_FORMATS`（code128 / ean13 / ean8 / upca / upce / itf14 / code39）与 `MATRIX_CODE_FORMATS`（qr / data-matrix / pdf417 / aztec），与 `BarCodeFormat`、`MatrixCodeFormat` 一一对应，供属性面板列选项、宿主校验模板时直接取用，不必另抄一份。`connectBarCode` 与 `connectMatrixCode` 认码制时也改为读这两份列表。
