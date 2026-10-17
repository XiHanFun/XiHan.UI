---
'@xihan-ui/headless': minor
'@xihan-ui/vue': minor
'@xihan-ui/react': minor
'@xihan-ui/web-components': minor
---

库内表单控件统一新增 `ariaLabel`：没有可见标题时给控件一个不显示出来的名字，写成 `aria-label` 落在字段标签会接到的那个部件上（输入框、触发钮、组、滑块、投放区等）。名称的先后：放进字段时取字段的标签，其次是控件自己渲染的 `label` 部件，都不在时才用 `ariaLabel`。switch、checkbox、toggle-group 原先没有命名入口，这次一并有了。

- headless：text-field、checkbox、switch、radio-group、number-field、select、cascader、combobox、tree-select、date-picker、date-range-picker、time-picker、time-range-picker、color-picker、color-field、color-slider、color-swatch-picker、mention、expression-input、password-input、pin-input、date-field、time-field、editable、tags-input、checkbox-group、slider、rating、toggle-group、transfer、field-array、file-upload、image-cropper、signature-pad、listbox、tag-group、format-input 的 props 新增 `ariaLabel?: string`。
  - select、cascader、tree-select、color-picker 的名称原本是「标签 + 当前值」；只给 `ariaLabel` 时，名字链的第一段换成触发钮自己，名称是「`ariaLabel` + 当前值」。
  - 已有缺省名的部件（color-swatch-picker 的组、color-slider 的滑块、signature-pad 的画布、tag-group 的列表、image-cropper 的裁切框）由 `ariaLabel` 盖过缺省名。mention 给了 `translations.input` 时照旧由它命名。
  - transfer 的根平时只是容器，给了 `ariaLabel` 时作为一个具名的组（role=group）。field-array 只在表格排布下把它写在表格本体上。
  - `withFieldLabel` 并进字段标签时，去掉名字链里为取部件自身 `aria-label` 写的那段自引用，名称归字段的标签。
- vue：各控件的根组件新增 prop `ariaLabel`；模板里写 `aria-label` 也落到这个 prop 上，不再透传到根节点的 div。
- react：各控件的根组件新增 prop `ariaLabel`。
- web-components：表单控件读宿主上的 `aria-label` 特性当 `ariaLabel`（元素的 `ariaLabel` 属性由浏览器映射到同一个特性），写到承担名字的部件上，改了跟着变。宿主命名的监听收进元素基类，`<xh-table>` 把宿主命名转给根的那段也改用它。
