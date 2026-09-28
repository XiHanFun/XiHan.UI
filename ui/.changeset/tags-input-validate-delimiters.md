---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

TagsInput 新增准入判定 `validate`、拒收报告 `onTagReject` 与一组断词符。

- `delimiter` 可以给一组（`string | string[]`）：打出、粘贴或 Enter 提交时其中任何一个都断词，hidden-input 的提交串用第一个拼接；空数组与空串一样是关掉断词。Web Components 的 `delimiter` 属性仍是单个字符串，一组走 property。
- `validate(tag, { value, tags })`：用户提交的每个新标签（Enter、断词、粘贴、失焦加入、`addValue` 与就地编辑）逐个调用，返回拒绝码（一个或一组）即拒收。有一个被拒这一次提交就整体不生效、文本原样留在框里；粘贴里有被拒的就不接管，照常粘进框里。就地编辑按 Enter 被拒时留在编辑态、焦点留在编辑框，编辑框失焦时被拒则撤销改写。`setValue` 的整份替换不经过它。
- `onTagReject`（Vue / Web Components 事件 `tag-reject`）：`{ tags: { tag, reasons }[] }`，原因是 `duplicate`（已在集合里，照常被消费掉、值不变）、`too-many-tags`（到了 `max`）或 `validate` 返回的自定义码。
- headless 导出 `tagsDelimiters`、`editRejection` 与类型 `TagsInputRejectReason`、`TagsInputRejectCode`、`TagsInputRejection`、`TagsInputTagRejectDetails`、`TagsInputValidateContext`；`appendTags` 的结果新增 `rejections`（含重复项），`rejected` 同时收下被 `validate` 拒收的标签；`splitTags` 与 `tagsDelimiter` 接受一组断词符；`EDIT.SUBMIT` 事件新增可选 `blur`。
