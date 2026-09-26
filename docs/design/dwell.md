# 停留时长

提示延迟、自动播放间隔、轻提示停留、滚动条隐藏延迟这类时间是等待，不是动效：它们决定一件事什么时候发生，不决定变化本身怎么过渡。停留时长作为组件属性给出缺省值，不经动效令牌，也不受减弱动效影响——减弱动效去掉的是运动，不是让提示更早消失或更晚出现。

唯一的例外是自动播放：持续变化的内容在减弱动效下不自己起播。Carousel 在减弱动效下不自动轮播，用户按播放开关照常播放。

## 悬停与长按

| 组件 | 属性 | 缺省 | 说明 |
| --- | --- | ---: | --- |
| Tooltip | `openDelay` / `closeDelay` | 700 / 300ms | 悬停与聚焦打开前的等待、离开后的保留；触屏长按到展开同样等 `openDelay`，长按打开后抬起手指再保留 1500ms |
| HoverCard | `openDelay` / `closeDelay` | 700 / 300ms | 同 Tooltip |
| Menu 子菜单 | `hoverOpenDelay` / `hoverCloseDelay` | 100 / 300ms | 悬停展开子菜单前的等待；指针在安全三角里停滞超过关闭延迟即放弃 |
| NavigationMenu | `delayDuration` / `skipDelayDuration` | 200 / 300ms | 悬停展开前的等待；收起后这段时间内碰到另一个入口直接展开 |
| Pagination 省略位浮层 | `openDelay` / `closeDelay` | 200 / 300ms | 悬停省略位打开页码浮层 |
| ContextMenu | `longPressDelay` | 700ms | 触屏长按打开菜单 |

## 反馈

| 组件 | 属性 | 缺省 | 说明 |
| --- | --- | ---: | --- |
| Toast | `duration` | 4000ms | 停多久自动收起；`loading` 或不大于 0 时不自动收起；悬停、聚焦、`paused` 与页面闲置时按住计时，恢复后从剩余时间接着走 |
| Notification | `duration` | 5000ms | 同 Toast；单条没写取组件属性，都没写取缺省 |
| Clipboard | `timeout` | 3000ms | 复制成功态保留多久回到初始态；不大于 0 时不回落 |

轻提示与通知卡片上的倒计时条在减弱动效下按秒分段显示，这改变的是画法，停留时长不变。

## 自动播放、自动前进与周期

| 组件 | 属性 | 缺省 | 说明 |
| --- | --- | ---: | --- |
| Carousel | `autoplay` | 4000ms | 写 `true` 取缺省间隔，写数字即间隔；悬停与聚焦暂停，恢复后重新计满一个间隔；减弱动效下不自动起播 |
| QuestionFlow | `autoAdvanceDelay` | 480ms | 单选题选定后自动到下一题前的等待；只前进到下一题，末题不替用户提交 |
| Timer | `interval` | 1000ms | 显示刷新的周期，最小 16ms；到期由另一个精确计时器判定，不受它影响 |
| LoadingBar | `trickleSpeed` | 200ms | 进度自动爬升的节拍；不大于 0 时不爬升 |
| NumberField | `changeDelay` / `changeInterval` | 300 / 50ms | 按住步进按钮多久开始连发、连发的间隔 |

## 其他等待

| 组件 | 属性 | 缺省 | 说明 |
| --- | --- | ---: | --- |
| Scrollbar、ScrollArea | `hideDelay` | 600ms | 停止滚动与离开后多久隐藏；`Infinity` 不隐藏 |
| Image | `fallbackDelay` | 0 | 加载多久还没好才显示回退内容；`Infinity` 加载期间不显示 |
| Approval | `timeoutMs` | 无 | 不设就不计时；设了到点按超时处理 |

首字母检索（Menu、Select、Listbox、Tree 等集合）在最后一次按键 350ms 后清空已输入的前缀，这是内部取值，不作为属性开放。

## 与动效的分界

- 停留时长决定何时开始、何时结束，由组件属性给；变化本身的时长与曲线由[动效令牌](/design/motion#令牌)给，组件不写固定毫秒。
- NumberAnimation 的 `duration` 是补间时长，属于动效：减弱动效下直接落到终值。
- Marquee 的 `speed` 是速率，不是停留。

## 相关

- [动效](/design/motion) · [组件家族与模式](/design/patterns)
