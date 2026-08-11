---
"@xihan-ui/web-components": minor
---

Web Components 侧接上表单重置。

上一版只接了 Vue：`MachineController` 里一处都没有，`xh-radio-group` 这类元素放进 `<form>` 点重置
一动不动。机器那侧 17 条 `FORM.RESET` 声明全在，事件却永远送不进去。

`MachineController` 现在在 `hostConnected` 里挂桥、`hostDisconnected` 里撤桥。元素自己就是锚点
（Light DOM），断连再重连会重建——搬出表单再搬回来仍然认新那份表单的重置。桥挂在 `mount` 之后：
挂上就可能有事件送进来，而 mount 之前送会撞上 `SEND_BEFORE_MOUNT`。

**门禁补上了让这次假绿成为可能的那一半。** `check-form-reset` 此前只查 headless 声明了事件，
不查适配器接没接——所以 WC 一直没接线，它一直是绿的。现在多一条总闸检查：两个适配器各自唯一的
接入点必须还在。桥一拆，17 个组件的重置会一起静默失效而每一条声明看着都还在，这正是逐组件检查
天生看不见的那类。拆掉 WC 那座桥实跑过，如期变红。
