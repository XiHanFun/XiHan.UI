---
'@xihan-ui/headless': minor
'@xihan-ui/web-components': patch
---

日历的四颗翻页钮（上一页、下一页、快速向前、快速向后）有了缺省的读屏名，按当前视图给出：日视图翻一页是一个月、快速翻页是一年，月与季度视图是一年与十年，年视图是十年与一百年。日历、日历范围选择、日期选择器与日期范围选择器都适用；作者在按钮上自己写了名字时以作者的为准。

- headless：新增 `CalendarNavTranslations`（`prevTrigger`、`nextTrigger`、`prevYearTrigger`、`nextYearTrigger`，参数是当前视图），日历与日历范围选择的文案类型继承它，日期选择器与日期范围选择器随之继承；十种内建语言包都已补齐。
- web-components：元素基类新增受保护的 `withAuthoredName()`：作者在部件上写了 `aria-label` / `aria-labelledby` 时，组件给的缺省名不盖过它，四颗翻页钮与字段数组的表格本体都改用它，与 Vue / React 里作者属性排在组件属性之后同一效果。
