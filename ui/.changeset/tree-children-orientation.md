---
"@xihan-ui/headless": minor
---

树的节点补一条 `childrenOrientation`：由作者指定「我这一层子节点怎么排」。

```ts
const collection = [
  {
    value: 'approval',
    label: '审批中心',
    // 这层全是按钮：横排一行铺完
    childrenOrientation: 'horizontal',
    children: [
      { value: 'approval:audit', label: '审核' },
      { value: 'approval:revoke', label: '撤回' },
      { value: 'approval:delete', label: '删除' },
      { value: 'approval:export', label: '导出' },
    ],
  },
]
```

标了就以它为准，`vertical` 也压得过树级的 `leafOrientation`；没标才退回原来的结构判据
（`leafOrientation` 加「子节点全是叶子」）。纯新增，现有行为一点不变。

树级 `leafOrientation` 认的是结构，别处凑巧「子节点全是叶子」的层会跟着一起横过来，
还会随数据增减变来变去；节点标记落在哪一层，横排就只到哪一层。

根层不受影响，恒竖排。方向键照旧是层级操作，不随排布方向改写。
