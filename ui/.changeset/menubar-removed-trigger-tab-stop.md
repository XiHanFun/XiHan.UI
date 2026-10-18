---
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

菜单栏（Menubar）持有焦点的入口被删掉时（换了数据、或作者移除了这个入口），菜单栏不再整条退出 Tab 序列：roving 锚点随之清掉，根节点重新留在 Tab 序列里，Tab 回来时落到第一个入口，与 Vue 一致。此前 React 与 Web Components 在浏览器不为被删节点派 focusout 时（jsdom、Firefox），锚点仍指着已删的入口，根节点和剩下的入口都是 `tabindex="-1"`。
