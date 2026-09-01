// WC 适配器的套件清单：行为宿主模型下，部件由作者手写，
// 若干组件的 fixture 与 Vue 侧不同构，需在此改写后再喂给运行方。
// jsdom 一致性与浏览器无障碍扫描共用这一份，两边跑的是同一批组件。
import type { ConformanceSuite, FixtureNode } from '@xihan-ui/testing'
import { accordionSuite, affixSuite, alertSuite, anchorSuite, approvalSuite, avatarGroupSuite, avatarSuite, backTopSuite, badgeSuite, breadcrumbSuite, buttonGroupSuite, buttonSuite, calendarSuite, cardSuite, carouselSuite, cascaderSuite, checkboxGroupSuite, checkboxSuite, clipboardSuite, codeBlockSuite, codeViewSuite, collapsibleSuite, colorPickerSuite, comboboxSuite, composerSuite, contextMenuSuite, countdownSuite, dateFieldSuite, datePickerSuite, descriptionsSuite, diffViewSuite, downloadTriggerSuite, dynamicInputSuite, editableSuite, ellipsisSuite, emptyStateSuite, fieldsetSuite, fieldSuite, fileUploadSuite, flexSuite, floatButtonSuite, floatingPanelSuite, formSuite, gradientTextSuite, gridSuite, heatmapSuite, highlightSuite, hotkeysSuite, hoverCardSuite, iconSuite, iconWrapperSuite, imageCropperSuite, imageSuite, infiniteScrollSuite, jsonViewerSuite, layoutSuite, listboxSuite, listSuite, loadingBarSuite, logSuite, markdownStreamSuite, marqueeSuite, masonrySuite, mentionSuite, menubarSuite, menuSuite, messageFeedSuite, navigationMenuSuite, notificationSuite, numberAnimationSuite, numberFieldSuite, pageHeaderSuite, paginationSuite, passwordInputSuite, pinInputSuite, popconfirmSuite, popoverSuite, popselectSuite, progressSuite, promptInputSuite, qrCodeSuite, questionFlowSuite, radioGroupSuite, ratingSuite, reasoningSuite, resizableSuite, resultSuite, scrollAreaSuite, scrollbarSuite, segmentedSuite, selectSuite, separatorSuite, sideNavSuite, signaturePadSuite, skeletonSuite, sliderSuite, sortableSuite, spaceSuite, spinnerSuite, splitterSuite, statisticSuite, stepsSuite, switchSuite, tableSuite, tabsSuite, tagsInputSuite, tagSuite, textFieldSuite, threadSuite, timeFieldSuite, timelineSuite, timePickerSuite, timerSuite, timeSuite, toastSuite, toggleGroupSuite, toggleSuite, toolbarSuite, toolCallSuite, tooltipSuite, tourSuite, transferSuite, treeSelectSuite, treeSuite, typographySuite, virtualizerSuite, watermarkSuite } from '@xihan-ui/testing'

// switch 无 portal/presence 分歧，复用共享用例、只把 fixture 换成 WC 行为宿主形态
// （用户显式写 root/thumb 角色节点，Vue 版 XhSwitch 是内部渲染 thumb）。
// 受控用例排除：HTML 布尔属性表达不了 undefined（checked=false 会被 harness 抹成缺省=非受控），
// 与 WC dialog 受控 open 同因延后，待受控属性机制落地。
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

const wcCodeViewSuite: ConformanceSuite = {
  ...codeViewSuite,
  cases: codeViewSuite.cases.map(c => ({ ...c, props: renameLangProp(c.props) })),
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
// mention：候选禁用由作者写 disabled 属性声明，与其它集合类组件同因
const wcMentionSuite = authorDisabled(mentionSuite)
const wcTabsSuite = authorDisabled(tabsSuite)
const wcAccordionSuite = authorDisabled(accordionSuite)

// tooltip / popover 的受控 open 与 switch 等同因排除：HTML 布尔属性表达不了 undefined。
const wcTooltipSuite: ConformanceSuite = {
  ...tooltipSuite,
}

// 条目禁用同样改用 aria-disabled 声明；受控 open 与 switch 等同因排除。
// select 的表单影子 select 在 Vue 侧由根部件自行装配、且排在 root 的第一个子节点；
// WC 侧要作者手写这个空壳（元素只按当前值补选项），位置也得对齐，order 断言逐字比对。
// 用例级 fixture 有两种：整棵重建（此时树里没有影子）与从默认树派生（此时影子已在树里）。
// 后者再补一个就成了两份 hidden-select——元素只接线头一份，第二份是个裸 <select>，
// 既没名字也没藏起来，读屏能走到它。补之前先看有没有，两种写法都只得到一份。
function withHiddenSelect(node: FixtureNode): FixtureNode {
  if (node.part !== 'root')
    return node
  const children = node.children ?? []
  if (children.some(c => c.part === 'hidden-select'))
    return node
  return { ...node, children: [{ part: 'hidden-select', tag: 'select' }, ...children] }
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
// 与 withHiddenSelect 同因：从默认树派生的用例级 fixture 里影子已在，补之前先看有没有。
function withHiddenInput(node: FixtureNode): FixtureNode {
  if (node.part === 'item') {
    const children = node.children ?? []
    if (children.some(c => c.part === 'hidden-input'))
      return node
    return { ...node, children: [{ part: 'hidden-input', tag: 'input' }, ...children] }
  }
  if (!node.children)
    return node
  return { ...node, children: node.children.map(withHiddenInput) }
}

const wcCheckboxGroupSuite = authorDisabled({
  ...checkboxGroupSuite,
  fixture: withHiddenInput(checkboxGroupSuite.fixture),
  cases: checkboxGroupSuite.cases.map((c) => {
    const derive = c.fixture
    return derive ? { ...c, fixture: (base: FixtureNode) => withHiddenInput(derive(base)) } : c
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

// segmented 的段是集合条目，禁用声明与 tabs/radio-group 同因改用 aria-disabled。
const wcSegmentedSuite = authorDisabled(segmentedSuite)

// masonry 的列与项在 Vue 版由组件铺出来，WC 版元素不生成结构：作者写 root、若干空的
// column 容器与一批 item，元素只负责把 item 搬进 column。故只换 fixture，用例整份复用。
// 三列对三项，缺省档位下每项各占一列。
const wcMasonrySuite: ConformanceSuite = {
  ...masonrySuite,
  fixture: {
    part: 'root',
    children: [
      ...[0, 1, 2].map((): FixtureNode => ({ part: 'column' })),
      ...['甲', '乙', '丙'].map((text): FixtureNode => ({ part: 'item', text })),
    ],
  },
}

// side-nav 折叠态弹出面板的定位层在 Vue 版由 branch-content 组件内部装配并搬到浮层落点，
// WC 版要作者手写在顶层 branch 里、包着 branch-content；平铺态不渲染它（connect 会把它整层藏掉），
// 面板内嵌套的分支也不要它。故只对 collapsed 且没关掉弹出的用例，把 list 直属分支的
// branch-content 包进 positioner。
function withPopoutPositioner(node: FixtureNode, parent?: FixtureNode): FixtureNode {
  if (node.part === 'branch' && parent?.part === 'list' && node.children) {
    return {
      ...node,
      children: node.children.map(c => (c.part === 'branch-content' ? { part: 'positioner', children: [c] } : c)),
    }
  }
  if (!node.children)
    return node
  return { ...node, children: node.children.map(c => withPopoutPositioner(c, node)) }
}

function popoutCase(c: ConformanceSuite['cases'][number]): boolean {
  return c.props?.collapsed === true && c.props.collapsedPopout !== false
}

const wcSideNavSuite: ConformanceSuite = {
  ...sideNavSuite,
  cases: sideNavSuite.cases.map((c) => {
    if (!popoutCase(c))
      return c
    const derive = c.fixture
    return { ...c, fixture: (base: FixtureNode) => withPopoutPositioner(derive ? derive(base) : base) }
  }),
}

// 同一份规格喂给 WC 适配器实现，逐帧核对。separator/badge 无状态无受控，整份复用。
// 三个集合类组件的受控值是字符串/数组（不像布尔那样表达不了 undefined），受控用例可原样跑。

export const wcSuites: readonly ConformanceSuite[]
  = [
    anchorSuite,
    approvalSuite,
    avatarSuite,
    badgeSuite,
    breadcrumbSuite,
    buttonSuite,
    calendarSuite,
    carouselSuite,
    clipboardSuite,
    wcCodeBlockSuite,
    wcCodeViewSuite,
    composerSuite,
    dateFieldSuite,
    datePickerSuite,
    editableSuite,
    fileUploadSuite,
    wcIconSuite,
    imageSuite,
    listboxSuiteWc,
    navigationMenuSuite,
    notificationSuite,
    numberFieldSuite,
    paginationSuite,
    pinInputSuite,
    scrollAreaSuite,
    scrollbarSuite,
    separatorSuite,
    sliderSuite,
    sortableSuite,
    splitterSuite,
    tagsInputSuite,
    textFieldSuite,
    threadSuite,
    timeFieldSuite,
    timePickerSuite,
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
    toolCallSuite,
    wcTooltipSuite,
    cascaderSuite,
    colorPickerSuite,
    formSuite,
    loadingBarSuite,
    menubarSuite,
    messageFeedSuite,
    tableSuite,
    tourSuite,
    transferSuite,
    virtualizerSuite,
    wcTreeSuite,
    treeSelectSuite,
    // 第一档与第二档新增的组件：部件全部由作者显式写，两侧 fixture 同构，整份复用
    affixSuite,
    avatarGroupSuite,
    backTopSuite,
    buttonGroupSuite,
    cardSuite,
    descriptionsSuite,
    flexSuite,
    gradientTextSuite,
    gridSuite,
    iconWrapperSuite,
    infiniteScrollSuite,
    layoutSuite,
    listSuite,
    logSuite,
    pageHeaderSuite,
    popconfirmSuite,
    popselectSuite,
    reasoningSuite,
    resizableSuite,
    resultSuite,
    statisticSuite,
    timelineSuite,
    typographySuite,
    promptInputSuite,
    qrCodeSuite,
    questionFlowSuite,
    countdownSuite,
    dynamicInputSuite,
    ellipsisSuite,
    floatButtonSuite,
    highlightSuite,
    markdownStreamSuite,
    marqueeSuite,
    numberAnimationSuite,
    timeSuite,
    watermarkSuite,
    wcMentionSuite,
    spaceSuite,
    tagSuite,
    wcSegmentedSuite,
    wcMasonrySuite,
    passwordInputSuite,
    fieldsetSuite,
    jsonViewerSuite,
    timerSuite,
    heatmapSuite,
    diffViewSuite,
    downloadTriggerSuite,
    hotkeysSuite,
    imageCropperSuite,
    signaturePadSuite,
    floatingPanelSuite,
    wcSideNavSuite,
  ]
