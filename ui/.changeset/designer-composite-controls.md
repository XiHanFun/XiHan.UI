---
'@xihan-ui/designer-kit': minor
'@xihan-ui/designer-shell': minor
---

属性描述新增三种内建编辑方式：绑定字段 `dataField`、四边 `sides`、格式 `format`。属性面板自带它们的编辑器，描述里写上就能用，各款设计器不必再自己登记。

- `@xihan-ui/designer-kit/properties`：
  - `{ kind: 'dataField', kinds?, base? }` 的取值是字段路径的 `formatJsonPath` 写法，空串为没有绑定；字段树不写在描述里，由属性面板给出。
  - `{ kind: 'sides', ... }` 的取值是 `{ top, right, bottom, left }`，数值约束与 number 共用 `PropertyNumberConstraints`；新增 `PROPERTY_SIDES` 与 `PropertySides`。
  - `{ kind: 'format', kinds? }` 的取值是 `@xihan-ui/expression` 的格式说明，`checkPropertyValue` 用 `checkFormatSpec` 检查。
  - `checkPropertyValue` 的问题码新增 `invalid-value` 与 `unknown-key`；`BUILTIN_CONTROL_KINDS` 收进这三种，扩展再登记同名的编辑方式会在合并时报冲突。
- `@xihan-ui/designer-shell`：
  - `<xh-designer-properties>` 新增 `dataFields`。有字段树时，绑定字段是可搜索的树选择，按 `kinds` 与 `base` 列出字段，不能选的对象显示为禁用的分支；没有字段树时是输入字段路径的文本框。
  - 四边是「四边相同」开关加一个数字框，关掉后换成上、右、下、左四个，四边都按数值约束就地校验。
  - 格式用 `<xh-format-input>`，种类限在 `kinds`；不是必填时多一项「不设格式」，选它即清除。
  - 文案新增 `invalidDataField`、`sidesLinked`、`sides`、`sidesIncomplete`。
