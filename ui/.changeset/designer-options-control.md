---
"@xihan-ui/designer-kit": minor
"@xihan-ui/designer-shell": minor
---

**新增** 内建编辑方式 `options`（选项列表）与属性面板里的选项表。

- `PropertyControl` 加 `{ kind: 'options', requireLabel? }`：取值是选项数组，每项 `{ value, label?, disabled?, tone?, description? }`，与选择类组件的选项同一形状，按 `@xihan-ui/core/options` 的 `findOptionViolation` 严格检查。`value` 为空或缺失、`requireLabel` 时缺了文字报 `required`，`value` 重复报 `duplicate-value`；这两个码加进了 `PropertyValueIssueCode`，`duplicate-value` 也加进了通用问题码 `CommonIssueCode`，按问题码逐条写说明的产品要补这一条。四款设计器的说明统一用下面的译法，不带参数：
  中文「选项的值重复」，繁体中文「選項的值重複」，英文 "Duplicate option value"，日文「選択肢の値が重複しています」，
  韩文「옵션 값이 중복되었습니다」，德文 "Doppelter Optionswert"，西班牙文 "Valor de opción duplicado"，
  法文 « Valeur d’option en double »，葡萄牙文 "Valor de opção duplicado"，俄文 «Повторяющееся значение варианта»。`BUILTIN_CONTROL_KINDS` 含 `options`，产品自己登记的同名编辑方式要去掉。
- 新增 `findPropertyValueIssue(control, value)`：给出问题码，以及问题落在值里的哪一处（`PropertyValueIssue`）。选项列表的问题落在那一项的那个键上，如 `[2, 'value']`；`checkProperties` 报的路径随之接到这一处。
- `<xh-designer-properties>` 与 `createPropertyField` 的 `options` 是一张选项表：`<xh-field-array>` 的表格排布，三格依次是值、文字与禁用，可以新增、删除、上移与下移，键盘都能按到。落在某一项某一格的问题标在那一格的控件上（`aria-invalid` 与错误文字），只有里层问题时行下不重复。
- 属性面板的文案加 `optionColumns`（三列的列名）与 `optionCell`（一格控件的名字），十种语言包都已补齐。
