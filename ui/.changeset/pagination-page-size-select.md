---
"@xihan-ui/headless": minor
"@xihan-ui/vue": minor
"@xihan-ui/web-components": minor
"@xihan-ui/styles": minor
---

每页条数控制器随分页一起给了。

```vue
<XhPaginationPageSizeSelect v-slot="{ options }">
  <option v-for="o in options" :key="o" :value="String(o)">{{ o }} 条 / 页</option>
</XhPaginationPageSizeSelect>
```

用**原生 `<select>`** 而不是再造一个浮层：档位就那么几档，浮层带不来什么，
却要多接一层定位、消解与键盘；原生控件在 Web Components 侧也一样能用，键盘天然可达。
不给插槽时按 `pageSizeOptions` 渲染默认档位。

受控时会把 DOM 的选中项同步回填：宿主不写回的话，用户改过的原生 select 与真正生效的
档位会对不上，而 vdom 那边没有变化就不会打补丁——这一条两个适配器共用。
