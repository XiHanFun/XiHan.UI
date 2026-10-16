---
'@xihan-ui/headless': minor
'@xihan-ui/vue': patch
'@xihan-ui/react': patch
'@xihan-ui/web-components': patch
---

评分（Rating）的星在留空或只放了图标时也有可及名了。此前没给 `translations.item` 就不写名字，留空的星与只放了对读屏隐藏的图标的星都没有名字，读屏只念出「单选按钮」，axe 报 aria-toggle-field-name。

- 星里没有作者内容时写 `aria-label`：取 `translations.item(分值, 总档数)`；实例没给时取当前语言包的说法，英文缺省为「3 of 5 stars」。十份语言包都补上了 `rating.item`。
- 星里放了能提供名字的内容，或作者直接在星上写了 `aria-label` / `aria-labelledby` 时，照旧以作者的为名，不写缺省名，作者传了 `translations.item` 也不写。
- 新增导出 `hasNamingContent(element)`：判断一个节点的后代能不能提供名字或描述。非空文字与带非空 `aria-label` / `aria-labelledby` / `alt` / `title` 的后代算；带 `aria-hidden="true"` 或 `hidden` 的子树整棵不算；节点自身的属性不参与。`RatingItemProps` 新增可选的 `authored`，由适配器按它的判断传入。
- Web Components 在每次同步时判断星里的内容，星节点自己身上的名字按首次同步时作者写的认；Vue 在挂载与更新后判断，React 在布局副作用里判断，服务端直出的首帧按没有作者内容写缺省名，挂载后再按实际内容更正。

字段（Field）的说明部件改用同一判断决定进不进控件的描述链：此前只看有没有文字，说明里只放了对读屏隐藏的内容时仍被引用（读出来是空的），只放了带 `alt` 的图片时反而不被引用。Web Components 的说明部件里这几个属性变化时也会重新接线。
