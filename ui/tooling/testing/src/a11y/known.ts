import type { KnownViolations } from './run'

/** axe 存量违规登记表，两个适配器共用；修好一条即从表里删一条，否则判登记过期。 */
export const knownA11yViolations: KnownViolations = {
  // ARIA 属性挂在不支持它的角色上
  'calendar': { 'aria-allowed-attr': 'aria-selected 挂在 cell-trigger 上，该属性属于 gridcell' },
  'date-picker': { 'aria-allowed-attr': '同 calendar，日期网格的 aria-selected 落错元素' },
  'time-field': { 'aria-allowed-attr': '分段元素的角色不支持所挂的 ARIA 属性' },
  'time-picker': { 'aria-allowed-attr': '同 time-field' },
  'cascader': { 'aria-allowed-attr': 'aria-expanded 挂在 role=option 的条目上，option 不支持它' },
  'splitter': { 'aria-allowed-attr': 'aria-orientation 挂在无角色的 root 上，它不是全局属性' },
  'table': {
    'aria-conditional-attr': '行上的 aria-expanded 只在 treegrid 成立，当前 role 是 grid',
    'aria-required-children': 'grid 下出现了非 row 的直接子节点',
  },

  // 交互控件内部嵌套了交互控件
  'checkbox-group': {
    'nested-interactive': '条目在可交互控件内部又放了可聚焦元素，负 tabindex 挡不住读屏',
    'aria-toggle-field-name': 'fixture 没给条目名字，组件也没有从 label part 兜底接线',
  },
  'radio-group': { 'nested-interactive': '同 checkbox-group' },

  // 无障碍名缺失
  'switch': { 'button-name': 'fixture 未提供可访问名；switch 需要作者标注或组件从 label part 接线' },
  'checkbox': { 'button-name': '同 switch' },
  'progress': { 'aria-progressbar-name': '同上，progressbar 必须有名字' },
  'rating': { 'aria-toggle-field-name': '同上' },
  'image': { 'image-alt': 'fixture 未传 alt' },
  'avatar': { 'image-alt': '同 image，avatar 是 image 的预设' },
  'form': { label: 'fixture 里的裸 input 没有关联 label' },
  'pin-input': { label: '分格输入没有逐格的可访问名（本该由组件内置文案给出，文案层未落地）' },
}

/** 全组件通用登记，整轮至少命中一次即可。 */
export const knownA11yViolationsEverywhere: Readonly<Record<string, string>> = {
  'color-contrast': '默认皮肤多处前景/背景对比度低于 4.5:1，属令牌与皮肤问题，需成批调',
}

/** 步骤在浏览器里推不到终态的组件。 */
const replayExempt: Readonly<Record<string, string>> = {
  'breadcrumb': '扫描必须拦下跨文档跳转否则测试宿主被导航走，而用例断言的正是不拦下，同一文档里不可兼得',
  'context-menu': '真机里焦点没落到首个条目，jsdom 下落了；疑似真实焦点时序缺陷',
  'editable': '真机里 selectOnFocus 的全选被随后的指针操作收掉，选区停在 2~2；疑似真实缺陷',
}

/** Vue 适配器的基线。 */
export const vueA11yBaseline = {
  known: knownA11yViolations,
  knownEverywhere: knownA11yViolationsEverywhere,
  replayExempt: { ...replayExempt, 'tags-input': '真机里焦点没回到标签内输入框；疑似真实焦点时序缺陷' },
}

/** WC 适配器的基线，在共用表之上逐条列出 WC 独有的登记。 */
export const wcA11yBaseline = {
  known: {
    ...knownA11yViolations,
    // 必需子节点由作者手写
    steps: { 'aria-required-children': 'WC 侧作者手写的部件缺角色要求的直接子节点' },
  },
  knownEverywhere: knownA11yViolationsEverywhere,
  // tags-input 在 WC 侧步骤能放完，故不列入
  replayExempt,
}
