---
'@xihan-ui/core': major
---

移除零调用的公开 `dispatchCancelable`。它直接使用 ambient `CustomEvent` 构造器，无法保证事件与目标元素属于同一 Window；在 iframe、画中画窗口和多 realm 页面中会产生错误的事件身份。

这项能力没有通用替代函数。调用方应从事件目标所属 Document 取得 Window，使用该 Window 的 `CustomEvent` 构造器创建可取消事件，派发后读取 `event.defaultPrevented`：

```ts
const win = target.ownerDocument.defaultView
if (!win)
  throw new Error('事件目标没有活动 Window')
const event = new win.CustomEvent(type, { bubbles: false, cancelable: true, detail })
target.dispatchEvent(event)
const accepted = !event.defaultPrevented
```
