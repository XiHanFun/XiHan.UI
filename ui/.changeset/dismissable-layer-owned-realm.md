---
'@xihan-ui/core': major
---

DismissableLayer 现在严格使用 RuntimeConfig Scope 所属 Window 构造全部可取消事件、安排武装微任务与焦点抑制帧，并要求 `layerRegistry.ownerDocument`、Scope Document 与 Window 三者同域。iframe、画中画窗口和顶层 CustomEvent 全局缺失时，事件仍保持目标 realm 的正确身份。

未登记到指定 registry 的 layer、非 HTMLElement、跨 Document 的动态 layer node、非冻结的 registry 快照，以及缺少 CustomEvent、queueMicrotask 或动画帧能力的宿主现在会明确失败，不再借 ambient DOM 或调度能力。

keydown、pointerdown 与 focusin 监听改为创建期间同步事务化注册，微任务只负责武装交互。任一 add 或 queue 失败都会同步按 LIFO 完整回滚，使 Headless 浮层外壳继续撤销已经登记的 Layer。正常 dispose 先进入终态，再按动画帧、focus、pointer、keydown 全量清理；单错原样上抛，多错按顺序聚合并以首错为 cause。`onDismiss` 抛错时即使焦点抑制帧清理也失败，业务原异常仍位于聚合首位。

首次 node getter 也受初始化快照约束：让 layer 退栈或成功 ABA 会在零监听状态同步失败，失败登记补偿回同一 snapshot 则可继续。Escape、pointer 与 focus 表决固定 LayerRegistry 的冻结快照和该次节点。DOM 与选项回调期间只要层栈快照或节点换代，旧决定便失效；成功补偿回原 snapshot 的失败登记不误伤原票。pointer/focus 在提交前还会针对同一快照重算动态 branches 与 surfaces，避免回调刚把目标纳入逻辑分支后仍误关浮层。pointer 建帧后的票据复核与 `onDismiss` 共用主异常优先的清理边界，getter 失败同样会立即撤帧。延迟注册的 setTimeout 兜底已移除。
