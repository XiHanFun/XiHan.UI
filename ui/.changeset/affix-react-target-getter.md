---
"@xihan-ui/react": minor
---

Affix 的 `target` 改为惰性取值函数。使用 `target={() => scrollRef.current}`，组件会在挂载效应执行时取得已经提交到 DOM 的滚动容器，避免首次渲染传入 `null` 后错误监听页面滚动。
