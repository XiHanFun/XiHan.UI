---
"@xihan-ui/react": patch
---

**修十三个集合组件的离场焦点上报一次都发不出去。** 条目被移出 DOM 时浏览器不派 `focusout`，焦点无声地掉到 body 上，机器那一侧仍记着一个已经不存在的锚点——方向键从不在场的条目起步，容器也不再兜底进 Tab 序列。适配器本来靠「本节点当下正持有焦点」这个守卫在卸载时上报，但那段清理写在了 `useEffect` 里：React 对被删子树的 passive 清理排在 DOM 摘除**之后**，那时 `activeElement` 已经回到 body，守卫恒不成立。接线看着还在，全程零报错。

涉及 `cascader` `context-menu` `listbox` `menu` `radio-group` `rating` `segmented` `select` `steps` `tabs` `toggle-group` `tree-select`，一律改成 layout effect。以 `select` 为例：高亮所在的条目被摘掉之后，整份列表一个高亮都没有、也没有任何一个 `tabindex="0"` 的停靠点——新配的用例先复现了这一幕，改完才转绿。

`runtime/layout-effect.ts` 收下这个共享件，此前四个组件各抄了一份。

**同时补上 `check-focus-report`。** 判据：清理函数里读了 `getActiveElement` 的，必须是 layout effect，不许是 `useEffect`。这个缺陷是铺第二批时带进来的，一路复制到第十三个组件都没人发现——它不报错、不改 DOM、只在「持有焦点的条目恰好被摘掉」这一路上现形，共享一致性套件的 fixture 是固定的树，永远走不到那里。

Vue 与 Web Components 不受影响：两者的卸载钩子本就排在节点摘除之前。
