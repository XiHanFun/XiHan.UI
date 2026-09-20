---
'@xihan-ui/react': patch
---

**命令式服务在组件 `useEffect` 里懒建后，第一条命令不再被当成「宿主没挂」静默丢掉。** 宿主树用 `flushSync` 提交，但从 effect 里懒建时 React 正处在提交上下文，`flushSync` 只能排队，宿主要等那轮 effect 跑完才渲；机器与端口跟着宿主的渲染体走，`createToastService()` 之后紧接着的 `toast.danger()` 返回空 id、什么也不弹。

toast 与 notification 服务的队列机器改由服务自己持有、建好即 start，端口随即接上；宿主组件只订阅与渲染，什么时候提交都不再影响命令能否入队。
