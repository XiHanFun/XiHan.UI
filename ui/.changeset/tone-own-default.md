---
'@xihan-ui/styles': major
'@xihan-ui/core': major
'@xihan-ui/headless': patch
---

**调整** 语气不再跨组件继承：有 `tone` 的组件没写 `tone` 时用组件自己的缺省语气，不接外层容器的。此前语气槽靠继承流到部件，这条继承同样越过组件边界：没写 `tone` 的 Button、Checkbox、Switch 放进 `tone="danger"` 的 Alert、Tabs，或一个写了 `data-tone="danger"` 的自定义节点里，都会被染成 danger。现在 `tone.css` 在这些组件的根（Menu、Tooltip 是内容部件）与浮层壳上把整族语气私有槽清回未声明，读槽处落回各自的缺省；组件自己的部件照旧跟根走，Flex、Grid、ScrollArea 这类没有 `tone` 的组件夹在组与条目之间也不挡继承。组给子组件的语气仍由组件显式下发：ButtonGroup 的段、TagGroup / TagsInput / 选择器的值标签、Menu 的子菜单，子组件自己写了的以子组件为准。依赖过外层继承的写法，在子组件上显式写 `tone`。边界名单逐个组件写（产物里各自落进组件的挂载类桶，不进通配桶），`tone.css` 去注释后由 4147 字节涨到 8716 字节。

**调整** Portal 视觉桥不再把 `data-tone` 带到浮层壳上，`createPortalVisualBridge` 只桥接八个视觉轴（主题、品牌、密度、对比度、动效、透明度、材质、方向）与局部覆盖的自定义属性。没写 `tone` 的 Tooltip、Popover 等从带语气的容器里打开时不再被染色；Select、Menu、Tooltip 等写了 `tone` 的组件本来就把语气写在定位层或内容部件上，不受影响。浮层里按「在自定义节点上使用语气」读 `--xh-tone-*` 的节点，要在自己身上写 `data-tone`。

**修复** Tabs 的「更多」下拉显式取标签页的 `tone`，不再靠视觉桥从标签页根上带过去。
