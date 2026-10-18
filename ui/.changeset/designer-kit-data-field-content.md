---
'@xihan-ui/designer-kit': minor
---

**新增** `DataField` 的可选项 `content`（类型 `DataFieldContent`：`'text' | 'image' | 'barcode' | 'qrcode'`，全部取值见 `DATA_FIELD_CONTENTS`），说明一个 `value` 字段的值代表什么：文字、图片地址、一维条码的内容或二维码的内容。设计器据此决定把字段放上画布时生成哪种元素、用哪种控件，不写时按文本。它与数据类型 `type` 互不相干：`type` 管条件编辑与格式化，`content` 管生成什么。写了不认识的取值时，与未知的 `kind` 一样抛 `RangeError`。
