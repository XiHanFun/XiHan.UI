---
'@xihan-ui/headless': major
'@xihan-ui/vue': major
'@xihan-ui/react': major
'@xihan-ui/web-components': major
---

**破坏性** Virtualizer 的主轴方向从布尔 `horizontal` 改成 `orientation: 'vertical' | 'horizontal'`（缺省 vertical），与其余 27 个组件的轴向同一个写法；Api 上的 `horizontal` 随之改成已解析的 `orientation`。投影的 `data-orientation` 不变。

| 旧写法 | 新写法 |
| --- | --- |
| `horizontal`（Vue / React / WC attribute） | `orientation="horizontal"` |
| `api.horizontal` | `api.orientation === 'horizontal'` |
