---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
---

表格补列偏好：一份可序列化的状态 + 几个写入口。

```ts
interface TableColumnPreference {
  order?: string[]                                  // 列序
  hidden?: string[]                                 // 藏起来的列
  widths?: Record<string, number | string>          // 列宽覆盖
  sticky?: Record<string, boolean | 'start' | 'end'> // 冻结覆盖
}
```

`columnPreference` 给定即受控，`defaultColumnPreference` 非受控，
变更走 `onColumnPreferenceChange`。写入口四个：`setColumnHidden` / `moveColumn` /
`setColumnWidth` / `setColumnPreference`。

**存到哪儿归使用者**——存 localStorage、存后端、跟着用户设置同步，都是应用的事；
把存储通道焊进组件库只会让它绑死一种后端。库只负责把偏好算进生效列。

三条语义值得单说：
- `order` 只列一部分也成立：列到的排在前面，没列到的按原顺序跟在后面，
  于是「把某一列挪到最前」不必把全表列一遍。
- 隐藏列**不占列号**，其余列跟着重排——让它继续占，读屏会报出一个数不到的格子。
- 前缀列不受偏好摆布：它们是结构性的，由 `prefixColumns` 说了算。
