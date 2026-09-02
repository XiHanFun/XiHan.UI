---
"@xihan-ui/styles": patch
---

**修复**六份皮肤里九条交互伪类规则没排除禁用态：置灰的件悬停照常换底、按下照常缩，看着还能点。

这些件的禁用一律走 `aria-disabled` / `data-disabled` 而不是原生 `disabled`——禁用项要留在方向键行程里、要能被读屏念到为什么按不动，所以节点始终是可命中的，`:hover` 与 `:active` 一定命中。各自的置灰规则只写了 `cursor` 与 `opacity`，不复位 `background` / `scale`，于是交互反馈原样保留。按同库里已经写对的那几份（`float-button` / `steps` / `side-nav` / `menubar`）逐条补上守卫：button（另加挂起态，它走的也是 `aria-disabled`；原生置灰的那颗浏览器同样给 `:hover`）、tabs 常态与选中态两条、accordion、navigation-menu、approval 的授权项与批准/拒绝两颗、sortable 的拖拽把手。

navigation-menu 的展开档与 approval 拒绝钮的置灰档此前靠书写顺序压过悬停那条，加守卫后特指度不再相同：展开档一并补上同一道守卫，拒绝钮置灰档里那条为压 `:active` 而写的 `scale: 1` 随之删掉。
