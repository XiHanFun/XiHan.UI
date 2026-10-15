---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
'@xihan-ui/styles': minor
---

日历族（CalendarPicker、CalendarRangePicker、DatePicker、DateRangePicker）的周、月、季度、年视图改为按行渲染。`role="grid"` 底下得是 `role="row"`、`gridcell` 得落在行里；此前周期格直接铺进网格，读屏报不出格子落在第几行第几列，axe 判 `aria-required-children` 与 `aria-required-parent`。

- 面板的 `cells`（平铺）改为 `rows`：按 `CALENDAR_PERIOD_COLUMNS` 切好的行，周一行一格，月与年一行三格，季度一行四格；日视图下为空数组。平铺的 `periods` 照旧给，只作数据用。
- 新增顶层 `rows`（首个面板的周期行，与 `weeks` 对应）：Vue 插槽载荷、React children 载荷与 Web Components 的只读属性同步提供。
- `buildPeriodGrid` 的返回值 `cells` 改为 `rows`；新增 `calendarPeriodRows(periods, view)`，给作者自备的格子列表（比如一页铺开两百年的年份）按视图的列数切行。
- `week-row` 带上 `data-view`，皮肤按它换列数；周期视图下网格只排行，不再直接排格子。

迁移：周期视图把 `panel.cells`（或平铺的 `periods`）换成 `panel.rows` / `rows`，一行写一个 `week-row`，格子放进行里。

```vue
<XhCalendarPickerGrid>
  <XhCalendarPickerWeekRow v-for="row in rows" :key="row[0].key">
    <XhCalendarPickerCell v-for="period in row" :key="period.key" :value="period.start">
      <XhCalendarPickerCellTrigger>{{ period.label }}</XhCalendarPickerCellTrigger>
    </XhCalendarPickerCell>
  </XhCalendarPickerWeekRow>
</XhCalendarPickerGrid>
```

自备格子列表的写法：`calendarPeriodRows(myPeriods, 'year')` 切好再照上面渲染。
