---
"@xihan-ui/react": minor
"@xihan-ui/core": patch
---

**新增第三个适配器 `@xihan-ui/react`，本批只交运行时接缝。**

`ReactiveRuntime` 的五个口子这次是第三份实现。React 与 Vue 不同类：它没有细粒度依赖追踪，只能整体重渲加提交后拉，所以接缝照的是 Web Components 那份，不是 Vue 那份。`cell` 变化推一个版本号喂 `useSyncExternalStore`；`track` 是拉式的，宿主每次提交后逐项比对依赖；`flush` 排队之后由提交后的 layout effect 取走，接不上提交时退到微任务里先 `flushSync` 逼出一次同步提交再跑。

**`flush` 是这一批唯一真正难的一格。** 它的契约是「跑在宿主提交完这次渲染、DOM 已经落定之后」，全仓 64 个调用点吃这条，其中浮层定位与模态背景失活两处写错了都不报错——浮层量到零尺寸就定位到左上角，背景收不到节点就永远 Tab 得出去。Vue 靠 `nextTick` 套 `nextTick`、WC 靠轮询 `updateComplete`，React 两者都没有。这次先写了一份 18 条的判据套件（`tests/support/runtime-contract.tsx`），再让三种策略各实现一遍拿它评分：提交后 effect 排空得 16/18，`requestAnimationFrame` 兜底得 13/18，`flushSync` 强制提交 18/18。判据本身也做过反向验证——拿一份故意写错的实现（推式 `track` 加微任务 `flush`）跑，红的正是预期那四条。

判据覆盖的是几种具体的写错方式，不是泛泛的冒烟：只在 props 上变、永不经过 `cell.set` 的值 `track` 看不看得见（推式实现在这里全线失效，受控回写跟着一起哑）；`flush` 在 React 事件内、事件外、消费方自己的 effect 里、以及回调里再次转移这四种时机是否都排在提交之后；受控判定有没有被首帧闭包冻住；StrictMode 走完 mount → cleanup → mount 之后状态与上下文会不会分叉。

停机后的 service 会静默丢弃一切事件，所以 StrictMode 那一轮走整台重建，与 WC 的 `MachineController` 同一做法；`useMachine` 返回的是身份稳定的门面而不是 service 本体，否则重建前的渲染闭包里抓到的旧 service 会让绑在 JSX 上的 `send` 全部落空。

`reactNormalize` 一并交了：11 项属性改名（`tabindex` 137 处、`readonly` 13 处、`for` 11 处等）、事件名按全小写索引归一（headless 里 `onKeyDown` 与 `onKeydown` 一类的两种写法并存共 48 处）、`onFocusIn` / `onFocusOut` 归到 `onFocus` / `onBlur`、两处字符串 `style` 解析成对象。

`@xihan-ui/core` 这一侧只改了对外自报的适配器名单。

**尚未交付**：组件、命令式服务、表单桥、SSR、一致性套件接线。React 侧的公开面这一批还是空的。

已知缺口，逐条记在案：外部组件在自己的 effect 或 ref 回调里调进 `send` 时，两面禁区旗盖不住，那一路会退化成不保证提交后；`flush` 回调自排回调的同轮上限是 100；`flushSync` 只保证 DOM 与 layout effect 落定，被动 effect 可能仍在后面；并发渲染下被丢弃的那次渲染同样会写脏 props 取值器，直到下一次渲染盖掉。
