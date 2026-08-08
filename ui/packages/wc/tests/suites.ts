// WC 适配器的套件清单：行为宿主模型下，部件由作者手写，
// 若干组件的 fixture 与 Vue 侧不同构，需在此改写后再喂给运行方。
// jsdom 一致性与浏览器无障碍扫描共用这一份，两边跑的是同一批组件。
import type { ConformanceSuite, FixtureNode } from '@xihan-ui/testing'
import { accordionSuite, alertSuite, anchorSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, calendarSuite, carouselSuite, cascaderSuite, checkboxGroupSuite, checkboxSuite, clipboardSuite, codeBlockSuite, collapsibleSuite, colorPickerSuite, comboboxSuite, composerSuite, contextMenuSuite, dateFieldSuite, datePickerSuite, editableSuite, emptyStateSuite, fieldSuite, fileUploadSuite, formSuite, hoverCardSuite, iconSuite, imageSuite, listboxSuite, loadingBarSuite, menubarSuite, menuSuite, navigationMenuSuite, numberFieldSuite, paginationSuite, pinInputSuite, popoverSuite, progressSuite, radioGroupSuite, ratingSuite, scrollAreaSuite, selectSuite, separatorSuite, skeletonSuite, sliderSuite, spinnerSuite, splitterSuite, stepsSuite, switchSuite, tableSuite, tabsSuite, tagsInputSuite, textFieldSuite, threadSuite, timeFieldSuite, timePickerSuite, toasterSuite, toastSuite, toggleGroupSuite, toggleSuite, toolbarSuite, tooltipSuite, tourSuite, transferSuite, treeSelectSuite, treeSuite, virtualizerSuite } from '@xihan-ui/testing'

// switch 无 portal/presence 分歧，复用共享用例、只把 fixture 换成 WC 行为宿主形态
// （用户显式写 root/thumb 角色节点，Vue 版 XhSwitch 是内部渲染 thumb）。
// 受控用例排除：HTML 布尔属性表达不了 undefined（checked=false 会被 harness 抹成缺省=非受控），
// 与 WC dialog 受控 open 同因延后，待 controlled 属性机制（设计 §11.2.9b）。
const wcSwitchSuite: ConformanceSuite = {
  ...switchSuite,
  fixture: { ...switchSuite.fixture, children: [{ part: 'thumb', tag: 'span' }] },
}

// checkbox 与 switch 同因：受控用例排除，fixture 换成行为宿主形态（indicator 由用户显式写）。
const wcCheckboxSuite: ConformanceSuite = {
  ...checkboxSuite,
  fixture: { ...checkboxSuite.fixture, children: [{ part: 'indicator', tag: 'span' }] },
}

// collapsible 的 fixture 三个 part 本就由用户显式写，两侧同构、整份复用；
// 只排除受控 open（布尔属性表达不了 undefined，与 switch/dialog 同因）。
const wcCollapsibleSuite: ConformanceSuite = {
  ...collapsibleSuite,
}

// toggle 与 switch 同因：受控用例排除；fixture 只有 root 一个 part，两侧同构。
const wcToggleSuite: ConformanceSuite = {
  ...toggleSuite,
}

// progress 的 track/range 在 Vue 版由组件内部渲染，WC 版由作者手写，故只换 fixture；
// 用例断言全在 root 上，两侧同一份。
const wcProgressSuite: ConformanceSuite = {
  ...progressSuite,
  fixture: { ...progressSuite.fixture, children: [{ part: 'track', children: [{ part: 'range' }] }] },
}

// icon 的 glyph 空壳在 Vue 版由组件内部渲染，WC 版要作者手写，故只换 fixture；
// 铺设后两侧 DOM 形状相同，用例整份复用。空壳写成 <g> 而不是 <div>：
// SVG 图元挂在非 SVG 命名空间里什么都不显示。
const wcIconSuite: ConformanceSuite = {
  ...iconSuite,
  fixture: { part: 'root', tag: 'svg', children: [{ part: 'glyph', tag: 'g' }] },
}

// code-block 的语言标注在 headless 侧叫 lang，WC 侧的属性必须叫 code-lang——
// lang 是 HTML 全局属性，写上去等于声明整块内容的自然语言，`lang="cs"`（C#）
// 会让读屏按捷克语念代码。harness 按 kebab 把 prop 名落成属性名，所以这里改 prop 键。
function renameLangProp(props: Readonly<Record<string, unknown>> | undefined): Record<string, unknown> | undefined {
  if (!props || !('lang' in props))
    return props as Record<string, unknown> | undefined
  const { lang, ...rest } = props
  return { ...rest, codeLang: lang }
}

const wcCodeBlockSuite: ConformanceSuite = {
  ...codeBlockSuite,
  cases: codeBlockSuite.cases.map(c => ({ ...c, props: renameLangProp(c.props) })),
}

// 集合类组件的作者侧禁用声明一律用 aria-disabled，不用原生 disabled：
// 原生 disabled 会留在 DOM 里进快照（BASE_ATTRS 恒采集），顶掉共享期望里的 'disabled': null
// ——那条期望正是"集合条目绝不输出原生 disabled"的守卫；而且原生禁用的按钮不可聚焦，
// 会让"禁用条目仍可聚焦、仍是方向键起点"的规格在 WC 上直接不成立。
// Vue 侧 disabled 是组件 prop、不落 DOM，所以只有 WC 侧的 fixture 需要改写这一处。
function ariaDisable(node: FixtureNode): FixtureNode {
  if (!node.attrs || !('disabled' in node.attrs))
    return node
  const attrs: Record<string, string> = { ...node.attrs, 'aria-disabled': 'true' }
  delete attrs.disabled
  return { ...node, attrs }
}

function mapTree(node: FixtureNode, fn: (n: FixtureNode) => FixtureNode): FixtureNode {
  const mapped = fn(node)
  return mapped.children ? { ...mapped, children: mapped.children.map(c => mapTree(c, fn)) } : mapped
}

function authorDisabled(suite: ConformanceSuite): ConformanceSuite {
  return {
    ...suite,
    fixture: mapTree(suite.fixture, ariaDisable),
    // 用例级 fixture 是"从默认树派生"的函数，且常整棵重建（忽略入参），故要改写它的产出
    cases: suite.cases.map((c) => {
      const derive = c.fixture
      return derive ? { ...c, fixture: (base: FixtureNode) => mapTree(derive(base), ariaDisable) } : c
    }),
  }
}

// radio-group：Vue 版由 XhRadioGroupItem 内部装配 hidden-input 与 indicator，
// WC 版要作者手写，且顺序须与 Vue 的渲染顺序一致（order 断言逐字比对）。
const wcRadioGroupSuite: ConformanceSuite = authorDisabled({
  ...radioGroupSuite,
  fixture: {
    part: 'root',
    children: [
      { part: 'label', tag: 'span', text: '尺寸' },
      ...(['a', 'b', 'c'] as const).map((value): FixtureNode => ({
        part: 'item',
        attrs: value === 'b' ? { value, disabled: '' } : { value },
        children: [
          { part: 'hidden-input', tag: 'input' },
          { part: 'indicator', tag: 'span' },
          { part: 'item-text', tag: 'span', text: value.toUpperCase() },
        ],
      })),
    ],
  },
})

// tabs / accordion 的 part 本就全由作者显式写，两侧同构，只改禁用声明的写法。
const wcTabsSuite = authorDisabled(tabsSuite)
const wcAccordionSuite = authorDisabled(accordionSuite)

// tooltip / popover 的受控 open 与 switch 等同因排除：HTML 布尔属性表达不了 undefined。
const wcTooltipSuite: ConformanceSuite = {
  ...tooltipSuite,
}

// 条目禁用同样改用 aria-disabled 声明；受控 open 与 switch 等同因排除。
// select 的表单影子 select 在 Vue 侧由根部件自行装配、且排在 root 的第一个子节点；
// WC 侧要作者手写这个空壳（元素只按当前值补选项），位置也得对齐，order 断言逐字比对。
function withHiddenSelect(node: FixtureNode): FixtureNode {
  if (node.part !== 'root')
    return node
  return { ...node, children: [{ part: 'hidden-select', tag: 'select' }, ...(node.children ?? [])] }
}

// 条目禁用同样改用 aria-disabled 声明；受控 open 与 switch 等同因排除。
const wcSelectSuite: ConformanceSuite = authorDisabled({
  ...selectSuite,
  fixture: withHiddenSelect(selectSuite.fixture),
  cases: selectSuite.cases
    .map((c) => {
      const derive = c.fixture
      return derive ? { ...c, fixture: (base: FixtureNode) => withHiddenSelect(derive(base)) } : c
    }),
})

// field 两个 part 的标签名在 Vue 侧由组件定死（label 渲染 <label>，control 无渲染、
// 把属性并到作者写的那个 <input> 上），WC 侧则是作者标 data-xh-part 标到哪算哪。
// 照抄共享 fixture 会得到 <div part=label> 与 <div part=control>：for 从一个非 label
// 指向一个不可标注的元素，两头都断，点标题不聚焦、读屏也念不出控件的名字。
// 这里把标签名补成元素文档要求作者写的那两个。
const FIELD_TAGS: Record<string, string> = { label: 'label', control: 'input' }

function nativeFieldTags(node: FixtureNode): FixtureNode {
  const tag = node.part ? FIELD_TAGS[node.part] : undefined
  if (tag)
    return { part: node.part, tag, text: node.text, attrs: node.attrs }
  if (!node.children)
    return node
  return { ...node, children: node.children.map(nativeFieldTags) }
}

const wcFieldSuite: ConformanceSuite = {
  ...fieldSuite,
  fixture: nativeFieldTags(fieldSuite.fixture),
  cases: fieldSuite.cases.map((c) => {
    const derive = c.fixture
    return derive ? { ...c, fixture: (base: FixtureNode) => nativeFieldTags(derive(base)) } : c
  }),
}

const wcMenuSuite: ConformanceSuite = authorDisabled({
  ...menuSuite,
})

const wcPopoverSuite: ConformanceSuite = {
  ...popoverSuite,
}

// rating 的星档是集合条目，禁用声明同样改 aria-disabled。
const wcRatingSuite = authorDisabled(ratingSuite)

// 三个集合类新件与既有的 tabs/accordion 同因：条目禁用改用 aria-disabled 声明。
// checkbox-group 另有一处与 radio-group 相同的分歧：每个条目里那份随表单提交的隐藏
// checkbox，Vue 版由 XhCheckboxGroupItem 自己装配，WC 版要作者手写；位置也得对齐到
// 条目的第一个子节点，因为 order 断言是逐字比对的。
function withItemHiddenInput(node: FixtureNode): FixtureNode {
  if (node.part === 'item')
    return { ...node, children: [{ part: 'item-hidden-input', tag: 'input' }, ...(node.children ?? [])] }
  if (!node.children)
    return node
  return { ...node, children: node.children.map(withItemHiddenInput) }
}

const wcCheckboxGroupSuite = authorDisabled({
  ...checkboxGroupSuite,
  fixture: withItemHiddenInput(checkboxGroupSuite.fixture),
  cases: checkboxGroupSuite.cases.map((c) => {
    const derive = c.fixture
    return derive ? { ...c, fixture: (base: FixtureNode) => withItemHiddenInput(derive(base)) } : c
  }),
})
const listboxSuiteWc = authorDisabled(listboxSuite)
const wcToggleGroupSuite = authorDisabled(toggleGroupSuite)

// closable 缺省为真，而 HTML 布尔属性表达不了 false：harness 摘掉属性等于"没指定"，
// 元素会退回缺省。与 switch/checkbox 同因，这一条用例在 WC 侧排除。
const wcToastSuite: ConformanceSuite = {
  ...toastSuite,
}

// 本批集合类与既有 tabs/accordion 同因：条目禁用改用 aria-disabled 声明。
const wcStepsSuite = authorDisabled(stepsSuite)
const wcToolbarSuite = authorDisabled(toolbarSuite)
const wcTreeSuite = authorDisabled(treeSuite)

// 这两个既是集合、又是浮层：条目禁用改声明之外，受控 open 与 switch 等同因排除。
const wcComboboxSuite = authorDisabled({
  ...comboboxSuite,
})

const wcContextMenuSuite = authorDisabled({
  ...contextMenuSuite,
})

const wcHoverCardSuite: ConformanceSuite = {
  ...hoverCardSuite,
}

// 同一份规格喂给 WC 适配器实现，逐帧核对。separator/badge 无状态无受控，整份复用。
// 三个集合类组件的受控值是字符串/数组（不像布尔那样表达不了 undefined），受控用例可原样跑。

export const wcSuites: readonly ConformanceSuite[]
  = [
    anchorSuite,
    avatarSuite,
    badgeSuite,
    breadcrumbSuite,
    buttonSuite,
    calendarSuite,
    carouselSuite,
    clipboardSuite,
    wcCodeBlockSuite,
    composerSuite,
    dateFieldSuite,
    datePickerSuite,
    editableSuite,
    fileUploadSuite,
    wcIconSuite,
    imageSuite,
    listboxSuiteWc,
    navigationMenuSuite,
    numberFieldSuite,
    paginationSuite,
    pinInputSuite,
    scrollAreaSuite,
    separatorSuite,
    sliderSuite,
    splitterSuite,
    tagsInputSuite,
    textFieldSuite,
    threadSuite,
    timeFieldSuite,
    timePickerSuite,
    toasterSuite,
    alertSuite,

    emptyStateSuite,

    skeletonSuite,

    spinnerSuite,

    wcAccordionSuite,
    wcCheckboxGroupSuite,
    wcCheckboxSuite,
    wcCollapsibleSuite,
    wcComboboxSuite,
    wcContextMenuSuite,
    wcFieldSuite,
    wcHoverCardSuite,
    wcMenuSuite,
    wcPopoverSuite,
    wcProgressSuite,
    wcRadioGroupSuite,
    wcRatingSuite,
    wcSelectSuite,
    wcStepsSuite,
    wcSwitchSuite,
    wcTabsSuite,
    wcToastSuite,
    wcToggleGroupSuite,
    wcToggleSuite,
    wcToolbarSuite,
    wcTooltipSuite,
    cascaderSuite,
    colorPickerSuite,
    formSuite,
    loadingBarSuite,
    menubarSuite,
    tableSuite,
    tourSuite,
    transferSuite,
    virtualizerSuite,
    wcTreeSuite,
    treeSelectSuite,
  ]
