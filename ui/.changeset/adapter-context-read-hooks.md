---
'@xihan-ui/vue': major
'@xihan-ui/react': major
---

**破坏性** Vue 与 React 的部件上下文统一成「读钩子全部公开、提供方一律不出包」：上下文只由库内部件提供，自行编写的部件放进现成组件后用读钩子取所在组件的 `api` 与部件身份，两端读钩子同名。

- Vue 不再导出 54 个 `provide*`：`provideAffix`、`provideApproval`、`provideAvatarGroup`、`provideBackTop`、`provideCitation`、`provideCitationSource`、`provideColorField`、`provideColorSlider`、`provideColorSwatchPicker`、`provideContextMenuSub`、`provideDescriptions`、`provideDiffView`、`provideExpressionInput`、`provideField`、`provideFieldArray`、`provideFieldArrayItem`、`provideFlex`、`provideFloatButton`、`provideGrid`、`provideImageViewer`、`provideInfiniteScroll`、`provideInputGroup`、`provideLayout`、`provideList`、`provideLog`、`provideMarkdownStream`、`provideMarquee`、`provideMatrixCode`、`provideMention`、`provideMentionItem`、`provideMenu`、`provideMenuGroup`、`provideMenuSub`、`provideMenubarSub`、`provideMessageFeed`、`provideMessageFeedItem`、`provideNotification`、`provideNotificationItem`、`providePageHeader`、`providePopconfirm`、`providePromptInput`、`provideQuestionFlow`、`provideReasoning`、`provideResizable`、`provideScrollbar`、`provideSideNav`、`provideSideNavNode`、`provideSortable`、`provideStatistic`、`provideTimeline`、`provideTimelineItem`、`provideToolCall`、`provideTypography`、`provideWatermark`。全局配置的 `provideXhConfig` 照旧导出；要让子树不再继承外层字段，用 `XhFieldBoundary` 或 `clearFieldContext()`。
- React 不再导出 `FieldProvider`、`NotificationProvider`、`NotificationItemProvider`。断开外层字段改用 `XhFieldBoundary`。
- Vue 的读钩子改成与 React 同名：

| 旧名 | 新名 |
| --- | --- |
| `useTimelineItem` | `useTimelineItemContext` |

- **新增** Vue 补导出其余各部件的读钩子（如 `useAccordionContext`、`useAccordionItemContext`、`useSelectItemContext`），ExpressionInput 补上条目读钩子 `useExpressionInputItemContext`；React 补导出 `useButtonGroupContext`、`useCascaderContentContext`、`useColorPickerTagContext`、`useDatePickerTagContext`、`useDateRangePickerColumnGroupContext`、`useDateRangePickerSegmentGroupContext`、`useDateRangePickerTimeColumnContext`、`useFormContext`、`useOptionalFormContext`、`useOptionalFormField`、`useSideNavGroupContext`、`useSideNavItemContext`、`useTimePickerTagContext`、`useTreeSelectContentContext`。两端各 205 个，名字一一对应。
