# 表单

一整张表的值、校验与提交：字段各自录入，表单负责汇总、校验和拦下不合格的提交。

## 何时使用

- 多个字段需要一起提交，且存在跨字段规则。
- 需要统一的校验时机与错误汇总。

## 何时不用

- 只有一两个立即生效的开关：直接改，别包表单。
- 只是要一格标签加控件：用[表单字段](./field)。

## 特性

- `validateOn` 决定何时校验：输入时、失焦时还是提交时。
- 支持异步校验、跨字段规则与手动触发入口。
- `validating` 表示仍有有效异步校验；任何字段变值、受控值更新、重置或卸载都会撤销旧快照的写回与提交资格，不自动重提。
- 校验器抛错或拒绝 Promise 时，`validationError` 保存 `{ cause, values, field }`，并发出 `validation-error` 事件（React/内核为 `onValidationError`）；`field=null` 表示整表提交。执行异常不会转换成字段错误或触发成功提交。
- 新校验、变值或重置会清除旧异常；重试由业务显式调用 `submit()`，不自动重试。Vue 默认插槽、React 函数式 children、Web Components 的 `validationError` 只读属性都能读取该状态。
- 字段身份是 `FormPath`：字符串（包括 `user.email`）永远是一整个键；只有显式数组（如 `['users', 0, 'email']`）才表示路径。数组路径由 `getFormPathValue` / `setFormPathValue` 读写，绝不经数组的逗号字符串落进 `Record`；`formPathKey` 用于稳定 DOM 身份，`formPathDisplay` 用于诊断文案。
- 嵌套的 `FieldArray` 以自身 `name` 作为根路径；追加、删除或换序时，Form 在 Headless 层同时迁移其子字段的 values、rules、errors、进行中的 validation 与已验证错误标记。字符串字段没有隐式下标，绝不会被这条迁移改写。
- `FormFieldGroup` 里的 TextField 会继承本字段的 `invalid` / `required` 以及整表的
  `disabled` / `readOnly`；没有写这四个实例属性才继承，显式写 `false` 可以顶掉最近状态。
  Field 再包一层时，状态继续落到 TextField 真正可聚焦的 input，而不是只停在包装节点。
- 错误汇总（`error-summary`）把所有错误列在一处，每条都能点回对应字段。
- "提醒但不拦下"是一档独立行为：警告级的问题不阻断提交。

## 组合

- 每格用[表单字段](./field)；分步表单与[步骤条](./steps)配合；行数可变的段落用[字段数组](./field-array)。

## 最佳实践

- 首次校验放在失焦而不是输入时：边打字边报红会让用户觉得自己一直在犯错。
- 提交失败后把焦点移到错误汇总或第一个出错字段。

## 反模式

- 提交按钮长期禁用直到全部合法：用户不知道还差什么。让他按下去，然后告诉他哪里不对。
- 校验规则只写在前端。
