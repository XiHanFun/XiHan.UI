---
'@xihan-ui/headless': minor
---

带子项的组件，条目契约本身支持逐条语气：数据里写一个 `tone`，这一条就按该族颜色表达。

此前语气只有整份一份（根上的 `tone`），它决定的是控件、浮层与作者内容的族色，条目一律走家族中性档。想把"移到回收站"标红、把已失效的选项标灰橙，只能放弃 `collection` 退回手写部件，再在条目上写颜色散值——于是每个产品各自一套红。

十二个组件的节点契约同时补上这一项，形状完全一致：

| 组件 | 写在哪 |
| --- | --- |
| Menu / ContextMenu / Command | 条目节点 |
| Menubar | 条目节点（顶层入口不接） |
| Listbox / Select / Combobox / Mention | 选项 / 候选节点 |
| Cascader / Tree / TreeSelect / SideNav | 任一层节点 |
| Transfer | 条目节点 |

```ts
const actions = [
  { value: 'copy', label: '复制' },
  { value: 'delete', label: '移到回收站', tone: 'danger', separatorBefore: true },
]
```

条目随之带上 `data-tone`，由 Collection Item 家族解算：静息只换字色，悬停 / 键盘高亮 / 按下逐档换语气淡底。没写 `tone` 的条目与此前完全一致。

四条边界由家族与契约一起钉住：

- **选中 / 当前压过语气，`disabled` 压过一切。** 选中是集合的结构事实，语气只是该条自身的性质。
- **不向下传导。** 树、级联、侧栏里写在哪一层就只作用于哪一层，子节点各自声明。
- **根上的 `tone` 不下发给条目。** Menu 与 ContextMenu 的这句文档此前写成了"决定条目高亮使用哪族颜色"，与实现不符，一并改正——家族的中性档本来就不读语气族色。
- **Menubar 顶层入口与其他 `nav` 语境不接语气**：那里的条目表达的是位置而不是动作。

三个适配器无需改动：投影在连接层，`collection` 与手写部件两条路都走同一份属性。不提供 `collection` 时连接层不发这个属性，作者直接写在条目部件上的 `data-tone` 原样留着。

彩字不是唯一通道：破坏性命令与失效选项仍要配图标，Menu 的"破坏性命令"示例按这个口径给出。
