<script setup lang="ts">
import { createThemeController } from '@xihan-ui/system/runtime'
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhAvatarFallback,
  XhAvatarImage,
  XhAvatarRoot,
  XhBadge,
  XhBreadcrumbEllipsis,
  XhBreadcrumbItem,
  XhBreadcrumbLink,
  XhBreadcrumbList,
  XhBreadcrumbRoot,
  XhBreadcrumbSeparator,
  XhButton,
  XhCheckbox,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemControl,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
  XhCheckboxGroupTrigger,
  XhClipboardControl,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardLabel,
  XhClipboardRoot,
  XhClipboardTrigger,
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
  XhComboboxClearTrigger,
  XhComboboxContent,
  XhComboboxControl,
  XhComboboxEmpty,
  XhComboboxInput,
  XhComboboxItem,
  XhComboboxItemIndicator,
  XhComboboxItemText,
  XhComboboxLabel,
  XhComboboxPositioner,
  XhComboboxRoot,
  XhComboboxTrigger,
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuItemText,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuSeparator,
  XhContextMenuTrigger,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
  XhDrawerCloseTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
  XhEditableArea,
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
  XhFileUploadClearTrigger,
  XhFileUploadDropzone,
  XhFileUploadHiddenInput,
  XhFileUploadItem,
  XhFileUploadItemDeleteTrigger,
  XhFileUploadItemGroup,
  XhFileUploadItemName,
  XhFileUploadItemPreview,
  XhFileUploadItemSizeText,
  XhFileUploadLabel,
  XhFileUploadRoot,
  XhFileUploadTrigger,
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
  XhImageFallback,
  XhImageImage,
  XhImageRoot,
  XhListboxContent,
  XhListboxItem,
  XhListboxItemGroup,
  XhListboxItemGroupLabel,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
  XhMenuArrow,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuTrigger,
  XhNumberFieldDecrementTrigger,
  XhNumberFieldIncrementTrigger,
  XhNumberFieldInput,
  XhNumberFieldLabel,
  XhNumberFieldRoot,
  XhPaginationEllipsis,
  XhPaginationItem,
  XhPaginationNextTrigger,
  XhPaginationPrevTrigger,
  XhPaginationRoot,
  XhPinInputHiddenInput,
  XhPinInputInput,
  XhPinInputLabel,
  XhPinInputRoot,
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhProgress,
  XhRadioGroupItem,
  XhRadioGroupItemText,
  XhRadioGroupLabel,
  XhRadioGroupRoot,
  XhRatingControl,
  XhRatingHiddenInput,
  XhRatingItem,
  XhRatingLabel,
  XhRatingRoot,
  XhSelectContent,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
  XhSeparator,
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhStepsContent,
  XhStepsDescription,
  XhStepsIndicator,
  XhStepsItem,
  XhStepsList,
  XhStepsRoot,
  XhStepsSeparator,
  XhStepsTitle,
  XhStepsTrigger,
  XhSwitch,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
  XhTagsInputClearTrigger,
  XhTagsInputControl,
  XhTagsInputHiddenInput,
  XhTagsInputInput,
  XhTagsInputItem,
  XhTagsInputItemDeleteTrigger,
  XhTagsInputItemInput,
  XhTagsInputItemPreview,
  XhTagsInputItemText,
  XhTagsInputLabel,
  XhTagsInputRoot,
  XhTextFieldClearTrigger,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
  XhToastActionTrigger,
  XhToastCloseTrigger,
  XhToastDescription,
  XhToasterGroup,
  XhToasterRoot,
  XhToastRoot,
  XhToastTitle,
  XhToggle,
  XhToggleGroupItem,
  XhToggleGroupRoot,
  XhToolbarGroup,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from '@xihan-ui/vue'
import { computed, ref } from 'vue'

const theme = createThemeController()
const mode = ref(theme.getState().mode)
function toggleTheme() {
  const next = mode.value === 'light' ? 'dark' : 'light'
  theme.setPreference({ mode: next })
  mode.value = next
}

const wifi = ref(true)
const agree = ref(false)
const bold = ref(false)
const progress = ref(40)
const plan = ref('standard')
const tab = ref('overview')
const panels = ref<string[]>(['a'])
const picked = ref('')
function onMenuSelect(details: { value: string }) {
  picked.value = details.value
}

const fruit = ref<string | null>(null)
const fruits = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'blueberry', label: '蓝莓' },
  { value: 'cherry', label: '樱桃（缺货）', disabled: true },
  { value: 'durian', label: '榴莲' },
]
const invalid = ref(false)
const qty = ref('3')

const nickname = ref('')
const nicknameInvalid = ref(false)

const pinCode = ref<string[]>(['', '', '', '', '', ''])
function pinCodeText() {
  return pinCode.value.join('')
}
function pinCodeComplete() {
  return pinCode.value.every(char => char !== '')
}

const toppingItems = [
  { value: 'cheese', label: '芝士' },
  { value: 'bacon', label: '培根' },
  { value: 'truffle', label: '松露（套餐自带，改不动）', disabled: true },
  { value: 'basil', label: '罗勒' },
]
const toppingValues = toppingItems.map(t => t.value)
const toppings = ref<string[]>(['cheese', 'truffle'])

const alignItems = [
  { value: 'left', label: '左对齐' },
  { value: 'center', label: '居中（禁用）', disabled: true },
  { value: 'right', label: '右对齐' },
]
const align = ref<string | null>('left')
const markItems = [
  { value: 'bold', label: 'B' },
  { value: 'italic', label: 'I' },
  { value: 'underline', label: 'U（禁用）', disabled: true },
]
const marks = ref<string[]>(['bold'])

const volume = ref([60])
const price = ref([200, 800])
const brightness = [30]

const score = ref(3)
const scoreHover = ref<number | null>(null)
function onScoreHover(details: { value: number | null }) {
  scoreHover.value = details.value
}

// 连打检索按 item-text 的首字母匹配，条目文本因此都以拉丁词开头（多给几个 B 开头的才轮转得出来）
const cityGroups: { value: string, label: string, items: { value: string, label: string, disabled?: boolean }[] }[] = [
  {
    value: 'asia',
    label: '亚洲',
    items: [
      { value: 'bangkok', label: 'Bangkok 曼谷' },
      { value: 'beijing', label: 'Beijing 北京' },
      { value: 'busan', label: 'Busan 釜山（禁用）', disabled: true },
      { value: 'chengdu', label: 'Chengdu 成都' },
    ],
  },
  {
    value: 'europe',
    label: '欧洲',
    items: [
      { value: 'barcelona', label: 'Barcelona 巴塞罗那' },
      { value: 'berlin', label: 'Berlin 柏林' },
      { value: 'bern', label: 'Bern 伯尔尼' },
      { value: 'london', label: 'London 伦敦' },
    ],
  },
]
const cities = ref<string[]>(['beijing'])
const citiesMultiple = ref(false)

const pageNo = ref(1)

const drawerSides = ['top', 'right', 'bottom', 'left'] as const
const drawerLabels: Record<(typeof drawerSides)[number], string> = {
  top: '从上方',
  right: '从右侧',
  bottom: '从下方',
  left: '从左侧',
}
const drawerTranslations = { close: '关闭' }
const drawerOpened = ref('')
function onDrawerOpenChange(side: (typeof drawerSides)[number], open: boolean): void {
  drawerOpened.value = open ? side : ''
}

// 关闭按钮的文案。提到外面存一份：写在模板里每渲染一次都是个新对象，白白惊动一轮 props
const toastTranslations = { close: '关闭' }

// 命令由 XhToasterRoot 的插槽作用域交下来，就是 useToaster 摊出来的那几个
function startUpload(
  create: (options: Record<string, unknown>) => string,
  update: (id: string, options: Record<string, unknown>) => void,
): void {
  create({ id: 'upload', type: 'loading', title: '正在上传', description: '3 个文件排队中' })
  // 改一条已经在队列里的
  window.setTimeout(update, 1200, 'upload', { description: '已传 2 / 3' })
  // 同一个 id 再 create 一次同样是就地改写，位置不动
  window.setTimeout(create, 2400, { id: 'upload', type: 'success', title: '上传完成', description: '3 个文件已入库' })
}

// 城市文本里拉丁词与中文各写一份：本页匹配的是整条文本，两边都筛得动。
// 条目给足十几条，浮层的滚动与检索才试得出来
const comboCities: { value: string, label: string, disabled?: boolean }[] = [
  { value: 'amsterdam', label: 'Amsterdam 阿姆斯特丹' },
  { value: 'bangkok', label: 'Bangkok 曼谷' },
  { value: 'barcelona', label: 'Barcelona 巴塞罗那' },
  { value: 'beijing', label: 'Beijing 北京' },
  { value: 'berlin', label: 'Berlin 柏林' },
  { value: 'busan', label: 'Busan 釜山（禁用）', disabled: true },
  { value: 'chengdu', label: 'Chengdu 成都' },
  { value: 'chicago', label: 'Chicago 芝加哥' },
  { value: 'dubai', label: 'Dubai 迪拜' },
  { value: 'hangzhou', label: 'Hangzhou 杭州' },
  { value: 'istanbul', label: 'Istanbul 伊斯坦布尔' },
  { value: 'london', label: 'London 伦敦' },
  { value: 'melbourne', label: 'Melbourne 墨尔本' },
  { value: 'osaka', label: 'Osaka 大阪' },
  { value: 'paris', label: 'Paris 巴黎' },
  { value: 'seattle', label: 'Seattle 西雅图' },
  { value: 'shanghai', label: 'Shanghai 上海' },
  { value: 'toronto', label: 'Toronto 多伦多' },
]

// 筛掉哪些条目是本页自己算的：组件只管高亮、选中与空态，它不认识“筛”这件事
function filterComboCities(query: string) {
  const q = query.trim().toLowerCase()
  return q === '' ? comboCities : comboCities.filter(c => c.label.toLowerCase().includes(q))
}

// 值一律按数组接：单选走的是同一条回调，选中集合恒为至多一条
const comboValue = ref<string[]>([])
const comboQuery = ref('')
const comboFiltered = computed(() => filterComboCities(comboQuery.value))

const comboMultiValue = ref<string[]>([])
const comboMultiQuery = ref('')
const comboMultiFiltered = computed(() => filterComboCities(comboMultiQuery.value))

const stack = ref<string[]>(['Vue', 'TypeScript', 'Vite'])

const editableName = ref('阿旺')
const editableNameCommitted = ref(editableName.value)
const signature = ref('且将新火试新茶')
const signatureCommitted = ref(signature.value)
function onNicknameCommit(details: { value: string }): void {
  editableNameCommitted.value = details.value
}
function onSignatureCommit(details: { value: string }): void {
  signatureCommitted.value = details.value
}

// 文案里有函数（删除按钮的可及名要带上文件名），提到外面存一份：
// 写在模板里每渲染一次都是个新对象，白白惊动一轮 props
const uploadTranslations = {
  dropzone: '把文件拖到这里，或点开系统选择框',
  deleteFile: (file: File) => `删除 ${file.name}`,
  clearFiles: '清空全部文件',
}
const uploadRejectText: Record<string, string> = {
  'type': '类型不在允许范围内',
  'size-too-large': '超过单个 512 KB 的上限',
  'size-too-small': '小于下限',
  'too-many-files': '列表最多只放得下 3 个',
}
const uploadCount = ref(0)
const uploadReject = ref('')
function onUploadFilesChange(details: { files: File[] }): void {
  uploadCount.value = details.files.length
}
// 一批里同时有收下的和被拒的是常态，accept 先到：先把上一次的原因清掉，随后那条 reject 再写新的
function onUploadAccept(): void {
  uploadReject.value = ''
}
function onUploadReject(details: { files: { file: File, reasons: string[] }[] }): void {
  uploadReject.value = details.files
    .map(item => `${item.file.name}（${item.reasons.map(r => uploadRejectText[r] ?? r).join('、')}）`)
    .join('；')
}

// 树数据是层级元信息（aria-level / aria-posinset / aria-setsize）与检索用名字的唯一事实源，
// 下面的标记只管长相，两者必须同源：标记里有、这份数据里没有的节点报不出层级，也进不了导航。
// 连打检索按 label 首字母匹配，文件名因此都以拉丁字母开头（两个 d 开头的才轮转得出来）
const projectTree = [
  {
    value: 'src',
    label: 'src',
    children: [
      {
        value: 'components',
        label: 'components',
        children: [
          { value: 'button', label: 'Button.vue' },
          { value: 'dialog', label: 'Dialog.vue' },
          { value: 'field', label: 'Field.vue' },
        ],
      },
      {
        value: 'utils',
        label: 'utils',
        children: [
          { value: 'dom', label: 'dom.ts' },
          { value: 'format', label: 'format.ts' },
        ],
      },
      { value: 'main', label: 'main.ts' },
    ],
  },
  {
    value: 'docs',
    label: 'docs',
    children: [
      { value: 'guide', label: 'guide.md' },
      { value: 'api', label: 'api.md' },
    ],
  },
  // children 给了空数组照样算分支：「暂时没有子项的目录」与文件在 ARIA 上不是一回事，前者要报 aria-expanded
  { value: 'dist', label: 'dist', children: [] },
  // 禁用只声明在这里，标记里不必再抄一遍：组件据此打 aria-disabled（不是原生 disabled，禁用行仍要能当方向键的起点）
  { value: 'lockfile', label: 'pnpm-lock.yaml（禁用）', disabled: true },
  { value: 'readme', label: 'README.md' },
]
const treeExpanded = ref<string[]>(['src'])
const treeSelected = ref<string[]>([])
function onTreeExpandedChange(details: { value: string[] }): void {
  treeExpanded.value = details.value
}
function onTreeSelectionChange(details: { value: string[] }): void {
  treeSelected.value = details.value
}

const toolbarLocked = ref(false)
const toolbarCommand = ref('（无）')
// 工具条不接管条目的点击：这条回显是按钮自己记的。
// 整条禁用时也由作者自己不响应——工具条只负责把 aria-disabled 与导航停掉
function runToolbarCommand(name: string): void {
  if (toolbarLocked.value)
    return
  toolbarCommand.value = name
}

const orderStep = ref(0)
const orderSteps = [
  { title: '收货信息', description: '收货人与地址' },
  { title: '支付方式', description: '在线支付或货到付款' },
  { title: '开具发票', description: '抬头与税号' },
  { title: '确认下单', description: '核对金额与优惠' },
]

// linear 那台只写标题不写说明：触发器是两列网格，说明缺席时右列的第二行是零高，不会留白
const auditStep = ref(0)
const auditSteps = [
  { title: '上传资料' },
  { title: '人工审核' },
  { title: '开通服务' },
]

// HoverCard：卡片本体承载交互，"关注"这颗按钮就在卡片里——点它卡片不收起，这正是它与 Tooltip 的分界
const hoverCardOpen = ref(false)
const hoverCardFollowing = ref(false)
function onHoverCardOpenChange(details: { open: boolean }): void {
  hoverCardOpen.value = details.open
}

const contextPicked = ref('')
function onContextMenuSelect(details: { value: string }): void {
  contextPicked.value = details.value
}

// Clipboard：状态与失败原因分开存。失败时 copy-error 先到、随后那条回 idle 的 status-change 才来，
// 合在一处会把刚报出来的原因当场冲掉
const apiToken = 'xh_live_9f2c7a41b6d84e05'
const clipboardStatus = ref('idle')
const clipboardError = ref('')
const clipboardStatusText: Record<string, string> = { idle: '待命', copying: '写入中', copied: '已复制' }
function clipboardStatusLabel(): string {
  return clipboardStatusText[clipboardStatus.value] ?? clipboardStatus.value
}
function onClipboardStatus(details: { status: string }): void {
  if (details.status === 'copying')
    clipboardError.value = ''
  clipboardStatus.value = details.status
}
function onClipboardError(details: { error: unknown }): void {
  clipboardError.value = details.error instanceof Error ? details.error.message : String(details.error)
}

// 内嵌一张 SVG 当“正常加载”那一例：演示页不联网也看得到加载成功那一态
const demoImageSrc = 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%209%22%3E%3Crect%20width=%2216%22%20height=%229%22%20fill=%22%23475569%22/%3E%3Cpath%20d=%22M0%209%206%203%2016%209z%22%20fill=%22%2394a3b8%22/%3E%3C/svg%3E'
const imageStatus = ref({ ok: '—', broken: '—', none: '—' })
function onImageStatus(key: 'ok' | 'broken' | 'none', details: { status: string }): void {
  imageStatus.value[key] = details.status
}
</script>

<template>
  <main class="wrap">
    <header>
      <h1>XiHan.UI · Vue</h1>
      <button id="theme" @click="toggleTheme">
        切换主题
      </button>
    </header>
    <p class="lead">
      这些是 Vue 组件，和 Web Components 版共用同一套 headless（machine + connect）。
    </p>

    <section>
      <h2>Button</h2>
      <div class="row">
        <XhButton variant="solid">
          Solid
        </XhButton>
        <XhButton>Subtle</XhButton>
        <XhButton variant="outline">
          Outline
        </XhButton>
        <XhButton variant="ghost">
          Ghost
        </XhButton>
        <XhButton disabled>
          Disabled
        </XhButton>
        <XhButton loading>
          Loading
        </XhButton>
        <XhButton size="lg">
          Large
        </XhButton>
      </div>
    </section>

    <section>
      <h2>Dialog</h2>
      <p class="lead">
        点击打开：焦点陷入内容、Esc 或点遮罩关闭、关闭后焦点回到触发按钮。
      </p>
      <XhDialogRoot v-slot="{ setOpen }">
        <XhDialogTrigger>打开对话框</XhDialogTrigger>
        <XhDialogContent>
          <XhDialogTitle>确认操作</XhDialogTitle>
          <XhDialogDescription>
            由 dialog 状态机驱动的模态框——与 Web Components 版是同一套 headless 逻辑，仅适配器不同。
          </XhDialogDescription>
          <div class="row end">
            <XhButton variant="ghost" @click="setOpen(false)">
              取消
            </XhButton>
            <XhButton variant="solid" @click="setOpen(false)">
              确定
            </XhButton>
          </div>
          <XhDialogCloseTrigger>✕</XhDialogCloseTrigger>
        </XhDialogContent>
      </XhDialogRoot>
    </section>

    <section>
      <h2>Switch</h2>
      <div class="row" style="gap: 16px;">
        <label class="row" style="gap: 8px;">
          <XhSwitch v-model:checked="wifi" aria-label="Wi-Fi" />
          <span>Wi-Fi {{ wifi ? '开' : '关' }}</span>
        </label>
        <label class="row" style="gap: 8px;">
          <XhSwitch :default-checked="false" aria-label="非受控开关" />
          <span>非受控</span>
        </label>
        <label class="row" style="gap: 8px;">
          <XhSwitch disabled aria-label="禁用开关" />
          <span>禁用</span>
        </label>
      </div>
    </section>

    <section>
      <h2>Checkbox</h2>
      <div class="row" style="gap: 16px;">
        <label class="row" style="gap: 8px;">
          <XhCheckbox v-model:checked="agree" aria-label="同意条款" />
          <span>同意条款（{{ agree ? '已勾选' : '未勾选' }}）</span>
        </label>
        <label class="row" style="gap: 8px;">
          <XhCheckbox default-checked aria-label="默认勾选" />
          <span>默认勾选</span>
        </label>
        <label class="row" style="gap: 8px;">
          <XhCheckbox disabled aria-label="禁用" />
          <span>禁用</span>
        </label>
      </div>
    </section>

    <section>
      <h2>Collapsible</h2>
      <XhCollapsibleRoot>
        <XhCollapsibleTrigger>展开详情 ▾</XhCollapsibleTrigger>
        <XhCollapsibleContent>
          <p class="lead" style="margin: 8px 0 0;">
            折叠面板由 open/closed 状态机驱动，支持受控 v-model:open；收起时内容以 hidden 移出无障碍树。
          </p>
        </XhCollapsibleContent>
      </XhCollapsibleRoot>
    </section>

    <section>
      <h2>Separator</h2>
      <div class="row" style="gap: 0;">
        <span>左</span>
        <XhSeparator orientation="vertical" style="block-size: 16px; margin-inline: 12px;" />
        <span>中</span>
        <XhSeparator orientation="vertical" style="block-size: 16px; margin-inline: 12px;" />
        <span>右</span>
      </div>
      <XhSeparator style="margin-block: 16px;" />
      <span class="lead">上面是水平分隔线。</span>
    </section>

    <section>
      <h2>Toggle</h2>
      <div class="row" style="gap: 16px;">
        <XhToggle v-model:pressed="bold" aria-label="加粗">
          B
        </XhToggle>
        <span class="lead">{{ bold ? '已按下' : '未按下' }}（aria-pressed 驱动）</span>
        <XhToggle default-pressed aria-label="默认按下">
          I
        </XhToggle>
        <XhToggle disabled aria-label="禁用">
          U
        </XhToggle>
      </div>
    </section>

    <section>
      <h2>Progress</h2>
      <XhProgress :value="progress" />
      <div class="row" style="margin-block-start: 12px;">
        <XhButton variant="subtle" @click="progress = Math.max(0, progress - 20)">
          −20
        </XhButton>
        <XhButton variant="subtle" @click="progress = Math.min(100, progress + 20)">
          +20
        </XhButton>
        <span class="lead">{{ progress }} / 100</span>
      </div>
    </section>

    <section>
      <h2>Badge</h2>
      <div class="row">
        <XhBadge variant="solid">
          Solid
        </XhBadge>
        <XhBadge variant="subtle">
          Subtle
        </XhBadge>
        <XhBadge variant="outline">
          Outline
        </XhBadge>
      </div>
    </section>

    <section>
      <h2>RadioGroup</h2>
      <p class="lead">
        四个方向键都能切换（与横竖排无关）；组内只有一个 Tab 停靠点，方向键跳过禁用项。
      </p>
      <XhRadioGroupRoot v-model:value="plan">
        <XhRadioGroupLabel>套餐</XhRadioGroupLabel>
        <XhRadioGroupItem value="free">
          <XhRadioGroupItemText>免费版</XhRadioGroupItemText>
        </XhRadioGroupItem>
        <XhRadioGroupItem value="standard">
          <XhRadioGroupItemText>标准版</XhRadioGroupItemText>
        </XhRadioGroupItem>
        <XhRadioGroupItem value="pro" disabled>
          <XhRadioGroupItemText>专业版（禁用）</XhRadioGroupItemText>
        </XhRadioGroupItem>
      </XhRadioGroupRoot>
      <span class="lead">当前：{{ plan }}</span>
    </section>

    <section>
      <h2>Tabs</h2>
      <p class="lead">
        automatic 模式：方向键移动焦点并顺带切换；横排时上下键放行给页面。
      </p>
      <XhTabsRoot v-model:value="tab">
        <XhTabsList>
          <XhTabsTrigger value="overview">
            概览
          </XhTabsTrigger>
          <XhTabsTrigger value="usage">
            用法
          </XhTabsTrigger>
          <XhTabsTrigger value="api" disabled>
            API（禁用）
          </XhTabsTrigger>
        </XhTabsList>
        <XhTabsContent value="overview">
          概览面板：与 Vue/WC 共用同一份 tabs 机器。
        </XhTabsContent>
        <XhTabsContent value="usage">
          用法面板：面板常挂，靠 hidden 显隐，滚动位置与表单态留得住。
        </XhTabsContent>
        <XhTabsContent value="api">
          API 面板。
        </XhTabsContent>
      </XhTabsRoot>
    </section>

    <section>
      <h2>Accordion</h2>
      <p class="lead">
        不用 roving：每个标题都是正常 Tab 停靠点，方向键额外在标题间移动焦点。
      </p>
      <XhAccordionRoot v-model:value="panels" multiple>
        <XhAccordionItem value="a">
          <XhAccordionHeader>
            <XhAccordionTrigger>第一节</XhAccordionTrigger>
          </XhAccordionHeader>
          <XhAccordionContent>展开集合是 string[]，multiple 时可并存。</XhAccordionContent>
        </XhAccordionItem>
        <XhAccordionItem value="b">
          <XhAccordionHeader>
            <XhAccordionTrigger>第二节</XhAccordionTrigger>
          </XhAccordionHeader>
          <XhAccordionContent>方向键只在标题间搬焦点，永不进内容区。</XhAccordionContent>
        </XhAccordionItem>
        <XhAccordionItem value="c">
          <XhAccordionHeader>
            <XhAccordionTrigger>第三节</XhAccordionTrigger>
          </XhAccordionHeader>
          <XhAccordionContent>首尾不回绕。</XhAccordionContent>
        </XhAccordionItem>
      </XhAccordionRoot>
      <span class="lead">展开：{{ panels.join(', ') || '（无）' }}</span>
    </section>

    <section>
      <h2>Tooltip</h2>
      <p class="lead">
        悬停等 700ms 才出（防误触）；聚焦立即出，且此时鼠标移出不会收走它。指针停在提示上也不收起。
      </p>
      <div class="row" style="gap: 24px;">
        <XhTooltipRoot placement="top">
          <XhTooltipTrigger>上方（默认延时）</XhTooltipTrigger>
          <XhTooltipPositioner>
            <XhTooltipContent>
              提示走的是同一份 tooltip 机器
              <XhTooltipArrow />
            </XhTooltipContent>
          </XhTooltipPositioner>
        </XhTooltipRoot>
        <XhTooltipRoot placement="right" :open-delay="0">
          <XhTooltipTrigger>右侧（无延时）</XhTooltipTrigger>
          <XhTooltipPositioner>
            <XhTooltipContent>
              placement 由定位引擎落定，空间不够会自动翻面
              <XhTooltipArrow />
            </XhTooltipContent>
          </XhTooltipPositioner>
        </XhTooltipRoot>
      </div>
    </section>

    <section>
      <h2>Menu</h2>
      <p class="lead">
        Enter / Space / ArrowDown 展开并落到首项，ArrowUp 落到末项；方向键跳过禁用项，Escape 关闭并归还焦点。
      </p>
      <XhMenuRoot @select="onMenuSelect">
        <XhMenuTrigger>操作</XhMenuTrigger>
        <XhMenuPositioner>
          <XhMenuContent>
            <XhMenuItem value="copy">
              复制
            </XhMenuItem>
            <XhMenuItem value="paste">
              粘贴
            </XhMenuItem>
            <XhMenuSeparator />
            <XhMenuItem value="delete" disabled>
              删除（禁用）
            </XhMenuItem>
          </XhMenuContent>
          <XhMenuArrow />
        </XhMenuPositioner>
      </XhMenuRoot>
      <span class="lead">最近选中：{{ picked || '（无）' }}</span>
    </section>

    <section>
      <h2>Popover</h2>
      <p class="lead">
        点击展开、Escape 或点外部关闭；展开时焦点进入内容，关闭后回到触发按钮。非模态不陷焦点。
        下方空间不够时引擎会自动翻到上方（flip）。
      </p>
      <XhPopoverRoot placement="bottom-start">
        <XhPopoverTrigger>打开浮层</XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>订阅设置</XhPopoverTitle>
            <XhPopoverDescription>
              role=dialog，四处 ARIA 互指；定位与 Tooltip 共用同一个引擎。
            </XhPopoverDescription>
            <!-- close-trigger 是右上角的图标按钮（定宽定高），放图标而非文案 -->
            <XhPopoverCloseTrigger aria-label="关闭">
              ✕
            </XhPopoverCloseTrigger>
            <XhPopoverArrow />
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>
    </section>

    <section>
      <h2>Select</h2>
      <p class="lead">
        Enter / Space / 方向键展开，展开后方向键与 Home / End 移高亮、连打字母检索、Enter 选中；
        收起时直接连打字母即可就地换值。列表用的是与 Popover 同一个定位引擎。
      </p>
      <XhSelectRoot v-model:value="fruit" name="fruit" placeholder="请选择">
        <XhSelectLabel>水果</XhSelectLabel>
        <XhSelectTrigger>
          <XhSelectValueText />
          <XhSelectIndicator>▾</XhSelectIndicator>
        </XhSelectTrigger>
        <XhSelectPositioner>
          <XhSelectContent>
            <XhSelectItem v-for="f in fruits" :key="f.value" :value="f.value" :disabled="f.disabled">
              <XhSelectItemText>{{ f.label }}</XhSelectItemText>
              <XhSelectItemIndicator>✓</XhSelectItemIndicator>
            </XhSelectItem>
          </XhSelectContent>
        </XhSelectPositioner>
      </XhSelectRoot>
      <span class="lead">当前值：{{ fruit || '（未选）' }}</span>
    </section>

    <section>
      <h2>Avatar</h2>
      <p class="lead">
        图片取回成功才显图，失败或没有 src 则显回退内容——两者始终只有一个可见，不会闪一下再换。
        第二个的地址故意写坏，用来看回退。
      </p>
      <div class="row">
        <XhAvatarRoot src="https://avatars.githubusercontent.com/u/1?v=4" alt="ok">
          <XhAvatarImage />
          <XhAvatarFallback>XH</XhAvatarFallback>
        </XhAvatarRoot>
        <XhAvatarRoot src="https://example.invalid/404.png" alt="broken">
          <XhAvatarImage />
          <XhAvatarFallback>失败</XhAvatarFallback>
        </XhAvatarRoot>
        <XhAvatarRoot>
          <XhAvatarImage />
          <XhAvatarFallback>无</XhAvatarFallback>
        </XhAvatarRoot>
      </div>
    </section>

    <section>
      <h2>Field</h2>
      <p class="lead">
        标题的 for、控件的 id 与描述链（aria-describedby）自动对齐：点标题聚焦到输入框，
        勾上"标记为无效"后错误文案接入描述链并显出。控件由你自己写，Field 只把属性并上去。
      </p>
      <XhFieldRoot :invalid="invalid" required>
        <XhFieldLabel>邮箱</XhFieldLabel>
        <XhFieldControl>
          <input type="email" placeholder="you@example.com">
        </XhFieldControl>
        <XhFieldDescription>用于接收账单与安全提醒</XhFieldDescription>
        <XhFieldErrorText>邮箱格式不正确</XhFieldErrorText>
      </XhFieldRoot>
      <label class="row">
        <input v-model="invalid" type="checkbox"> 标记为无效
      </label>
    </section>

    <section>
      <h2>NumberField</h2>
      <p class="lead">
        键盘全在输入框上：ArrowUp / ArrowDown 走 step，PageUp / PageDown 走 largeStep，
        Home / End 取端点。加减按钮按住不放会连发；贴住边界时对应按钮自动转灰。
        失焦时把 12.50 收成 12.5、把越界值夹回区间，输入途中不打断。
      </p>
      <XhNumberFieldRoot v-model:value="qty" :min="0" :max="20" :step="1" name="qty">
        <XhNumberFieldLabel>数量</XhNumberFieldLabel>
        <div class="row" style="gap: 4px;">
          <XhNumberFieldDecrementTrigger>−</XhNumberFieldDecrementTrigger>
          <XhNumberFieldInput style="inline-size: 80px; text-align: center;" />
          <XhNumberFieldIncrementTrigger>+</XhNumberFieldIncrementTrigger>
        </div>
      </XhNumberFieldRoot>
      <span class="lead">当前值：{{ qty === '' ? '（空）' : qty }}</span>
    </section>

    <section>
      <h2>TextField</h2>
      <p class="lead">
        清空按钮只是指针用户的快捷方式：框里没字时它是灰的，敲进第一个字才亮起来，清完当场再转灰；
        它不占 Tab 位、也不抢焦点，清完能接着打字。键盘那一路走 Escape——有值时清空并把这一下吃掉，
        没值时原样交回去，套在弹层里时 Esc 仍然关得掉弹层。上限 10 个字符，顶满后再敲进不去，
        root 与 input 一起挂上 data-at-limit；勾上下面的复选框看 aria-invalid 翻成 true。
      </p>
      <XhTextFieldRoot v-model:value="nickname" :max-length="10" :invalid="nicknameInvalid" clearable name="nickname" placeholder="请输入昵称">
        <XhTextFieldLabel>昵称</XhTextFieldLabel>
        <div class="row" style="gap: 4px;">
          <XhTextFieldInput style="inline-size: 200px;" />
          <XhTextFieldClearTrigger>✕</XhTextFieldClearTrigger>
        </div>
      </XhTextFieldRoot>
      <span class="lead">当前值：{{ nickname === '' ? '（空）' : nickname }} · {{ nickname.length }} / 10</span>
      <label class="row">
        <input v-model="nicknameInvalid" type="checkbox"> 标记为无效
      </label>
    </section>

    <section>
      <h2>PinInput</h2>
      <p class="lead">
        每格都是原生输入框：敲一个数字自动跳下一格；退格在有值的格上清本格、在空格上退回上一格并把它清掉；
        左右键与 Home / End 在格间移动，两端停住不回绕。numeric 下字母根本进不来，敲了既不进值也不会赖在框里。
        粘贴这条务必真试一次：复制 123456，聚焦任意一格按 Ctrl+V，整串会从落点那一格起按格铺开，
        而不是整串挤进一格（从第三格粘 345 就只填后三格）。六格填满时 root 挂上 data-complete，
        隐藏输入同时拿到拼好的整串，那才是随表单提交的值。
      </p>
      <XhPinInputRoot v-model:value="pinCode" :length="6" type="numeric" otp name="code" placeholder="·">
        <XhPinInputLabel>验证码</XhPinInputLabel>
        <!-- 格间距由皮肤长在格子自己身上（相邻兄弟 + margin-inline-start），
             这层包裹不在角色表里，得把 .row 自带的 gap 归零，免得两份间距叠加 -->
        <div class="row" style="gap: 0;">
          <XhPinInputInput v-for="i in 6" :key="i" :index="i - 1" />
        </div>
        <XhPinInputHiddenInput />
      </XhPinInputRoot>
      <span class="lead">当前值：{{ pinCodeText() || '（空）' }} · {{ pinCodeComplete() ? '已填满' : '未填满' }}</span>
    </section>

    <section>
      <h2>CheckboxGroup</h2>
      <p class="lead">
        数组值：各选各的，多项能同时选中，再点一次即取消。与单选组正相反——组内有几项就有几个 Tab 停靠点，
        容器自己不占位，禁用项也留着位子（点不动，但焦点落得上去、读屏念得出来）。
        Space 翻转聚焦的那一项；改不动的条目不吞这个键，Space 照样把页面往下滚。
        "全选"那一格是第三种状态：勾了一部分时报 some（对读屏是 aria-checked=mixed），全勾上才转 all；
        半选时再按一次是整批取消而不是补齐。松露是禁用项，全选勾不上它、整批取消也摘不掉它已有的那一份。
        分得清"全选"与"半选"的前提是把全部条目的值交给 item-values，不给就只会诚实地停在 some。
      </p>
      <XhCheckboxGroupRoot
        v-slot="{ checkedState }"
        v-model:value="toppings"
        :item-values="toppingValues"
        name="topping"
      >
        <XhCheckboxGroupLabel>配料</XhCheckboxGroupLabel>
        <!-- 方框与勾号／横杠由皮肤的 trigger::before 画，这里只写文案 -->
        <XhCheckboxGroupTrigger>
          <span>全选（{{ checkedState }}）</span>
        </XhCheckboxGroupTrigger>
        <XhCheckboxGroupItem
          v-for="t in toppingItems"
          :key="t.value"
          :value="t.value"
          :disabled="t.disabled"
        >
          <XhCheckboxGroupItemControl />
          <XhCheckboxGroupItemText>{{ t.label }}</XhCheckboxGroupItemText>
        </XhCheckboxGroupItem>
      </XhCheckboxGroupRoot>
      <span class="lead">当前值：{{ toppings.join('、') || '（无）' }}</span>
    </section>

    <section>
      <h2>ToggleGroup</h2>
      <p class="lead">
        单选与多选是两套 ARIA，任何时候只出现一套：单选 root=radiogroup、条目 role=radio + aria-checked；
        多选 root=group、条目退回原生按钮 + aria-pressed。
        两组都只占一个 Tab 位，进组后改用方向键走——四个方向键都响应（与横竖排无关），跳过禁用项、到头回绕，
        而且只搬焦点不改选中：路过不算数，要按 Enter 或 Space 才切（条目是原生 button，这一路交给平台）。
        禁用项点不动，但焦点落得上去、仍能当方向键的起点。单选组里再点一次当前项就清空，回调给 null。
      </p>
      <!-- 分段控件的 root 是 inline-flex（不该撑满一行），所以每组各包一层块级容器：
           否则两组连同后面的说明文字会挤进同一个行内格式化上下文，组间距也撑不开 -->
      <div class="row">
        <XhToggleGroupRoot v-model:value="align">
          <XhToggleGroupItem
            v-for="a in alignItems"
            :key="a.value"
            :value="a.value"
            :disabled="a.disabled"
          >
            {{ a.label }}
          </XhToggleGroupItem>
        </XhToggleGroupRoot>
        <span class="lead">对齐（单选）：{{ align ?? '（无）' }}</span>
      </div>
      <!-- margin 只是两组之间的留白，属于本页排版，皮肤不管 -->
      <div class="row" style="margin-block-start: 12px;">
        <XhToggleGroupRoot v-model:value="marks" multiple>
          <XhToggleGroupItem
            v-for="m in markItems"
            :key="m.value"
            :value="m.value"
            :disabled="m.disabled"
          >
            {{ m.label }}
          </XhToggleGroupItem>
        </XhToggleGroupRoot>
        <span class="lead">样式（多选）：{{ marks.join('、') || '（无）' }}</span>
      </div>
    </section>

    <section>
      <h2>Slider</h2>
      <p class="lead">
        键盘全在拇指上：方向键走一格 step，PageUp / PageDown 走 largeStep（这里是 10），
        Home / End 直接贴到端点。按下轨道任意位置，最近的那个拇指当场跳过来并接着能拖；
        松手后焦点留在它身上，方向键可以继续微调。
        区间滑块的两个拇指互为对方的边界，永不交叉——按 End 也只走到邻居让出的位置为止。
        禁用那条的拇指退出 Tab 序列，值也不再随表单提交。
      </p>
      <!-- root 上的宽度／间距是本页的排版约束；轨道、区间、拇指的观感全归皮肤，
           区间与拇指在主轴上的位置由连接层每帧写进内联 style，这里一概不碰 -->
      <XhSliderRoot v-model:value="volume" :min="0" :max="100" :step="1" :large-step="10" name="volume" style="max-inline-size: 360px;">
        <XhSliderLabel>音量</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
      <span class="lead">音量：{{ volume[0] }}</span>

      <XhSliderRoot v-model:value="price" :min="0" :max="1000" :step="10" :min-steps-between-thumbs="2" name="price" style="max-inline-size: 360px; margin-block-start: 20px;">
        <XhSliderLabel>价格区间（两个拇指至少隔 2 格）</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb :index="0">
            <XhSliderHiddenInput />
          </XhSliderThumb>
          <XhSliderThumb :index="1">
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
      <span class="lead">价格：¥{{ price[0] }} – ¥{{ price[1] }}</span>

      <XhSliderRoot :default-value="brightness" disabled name="brightness" style="max-inline-size: 360px; margin-block-start: 20px;">
        <XhSliderLabel>亮度（已锁定）</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
    </section>

    <section>
      <h2>Rating</h2>
      <p class="lead">
        划过星星只是预览：回显里的“评分”纹丝不动，只有“悬停预览”跟着指针走，指针一离开预览立刻收起，
        点下去才算真的落值。允许半颗时，落点在一颗星的左半边给半颗、右半边给整颗；
        方向键按半档走，Home / End 取最低一档与满分。
        只读那条仍进得了 Tab 序列、读屏也念得出，但改不动、也不给悬停预览；
        禁用那条整条退出 Tab 序列，值不再随表单提交。
      </p>
      <!-- 星字符归作者，点亮／半亮／灰与手势全由 data-highlighted、data-half、
           data-readonly、data-disabled 驱动皮肤，模板里不再自己配色 -->
      <XhRatingRoot v-slot="{ items }" v-model:value="score" allow-half name="score" @hover-change="onScoreHover">
        <XhRatingLabel>整体满意度</XhRatingLabel>
        <XhRatingControl>
          <XhRatingItem v-for="i in items" :key="i" :value="i">
            ★
          </XhRatingItem>
        </XhRatingControl>
        <XhRatingHiddenInput />
      </XhRatingRoot>
      <span class="lead">评分：{{ score }} · 悬停预览：{{ scoreHover ?? '（无）' }}</span>

      <div class="row" style="gap: 32px; margin-block-start: 20px;">
        <XhRatingRoot v-slot="{ items }" :default-value="4" read-only>
          <XhRatingLabel>只读（4 星）</XhRatingLabel>
          <XhRatingControl>
            <XhRatingItem v-for="i in items" :key="i" :value="i">
              ★
            </XhRatingItem>
          </XhRatingControl>
        </XhRatingRoot>
        <XhRatingRoot v-slot="{ items }" :default-value="2" disabled>
          <XhRatingLabel>禁用（2 星）</XhRatingLabel>
          <XhRatingControl>
            <XhRatingItem v-for="i in items" :key="i" :value="i">
              ★
            </XhRatingItem>
          </XhRatingControl>
        </XhRatingRoot>
      </div>
    </section>

    <section>
      <h2>Listbox</h2>
      <p class="lead">
        焦点与选中是两条线：方向键与 Home / End 只搬焦点，Enter 或空格才落值。
        连打字母就地检索——连按 b 在几个 B 开头的城市间轮转，打 ber 落到 Berlin、再补一个 n 走到 Bern。
        禁用的 Busan 被方向键与检索一并跳过，但它仍点得中、仍是方向键的起点。
        整组只占一个 Tab 位，焦点从外面进来先落在已选中的那条上。
        勾上多选后空格改成切换，Shift + 方向键顺手扩选，Ctrl / Cmd + A 全选或全不选。
      </p>
      <XhListboxRoot v-slot="{ isSelected }" v-model:value="cities" :multiple="citiesMultiple" style="max-inline-size: 320px;">
        <XhListboxLabel>城市</XhListboxLabel>
        <XhListboxContent>
          <XhListboxItemGroup v-for="g in cityGroups" :key="g.value" :value="g.value">
            <XhListboxItemGroupLabel>{{ g.label }}</XhListboxItemGroupLabel>
            <XhListboxItem v-for="c in g.items" :key="c.value" :value="c.value" :disabled="c.disabled">
              <XhListboxItemText>{{ c.label }}</XhListboxItemText>
              <XhListboxItemIndicator>{{ isSelected(c.value) ? '✓' : '' }}</XhListboxItemIndicator>
            </XhListboxItem>
          </XhListboxItemGroup>
        </XhListboxContent>
      </XhListboxRoot>
      <label class="row">
        <input v-model="citiesMultiple" type="checkbox"> 多选（multiple）
      </label>
      <span class="lead">已选：{{ cities.length ? cities.join('、') : '（无）' }}</span>
    </section>

    <section>
      <h2>Pagination</h2>
      <p class="lead">
        196 条、每页 10 条，正好 20 页，当前页两侧各留一页：序列长度恒为 7，切页时省略号左右挪、按钮不左右抖动；
        贴到两端时省略位让给页码（只隔一页就把那页直接显出来，不折成省略号）。
        首页的上一页与末页的下一页转成原生 disabled，Tab 都停不上去。
        末页只有 6 条，区间回显跟着收窄。
      </p>
      <!-- root 自己就是会换行的横排 flex，页码不必再套一层；
           区间回显与它同在 nav 里，占满一行把自己挤到下一行去（纯本页版式） -->
      <XhPaginationRoot v-slot="{ pages, pageRange, count, totalPages }" v-model:page="pageNo" :count="196" :page-size="10" :sibling-count="1">
        <XhPaginationPrevTrigger>上一页</XhPaginationPrevTrigger>
        <template v-for="(p, i) in pages" :key="`${p}-${i}`">
          <XhPaginationEllipsis v-if="p === 'ellipsis'">
            …
          </XhPaginationEllipsis>
          <XhPaginationItem v-else :value="p">
            {{ p }}
          </XhPaginationItem>
        </template>
        <XhPaginationNextTrigger>下一页</XhPaginationNextTrigger>
        <span class="lead" style="flex-basis: 100%;">第 {{ pageRange.start }}-{{ pageRange.end }} 条，共 {{ count }} 条 · 第 {{ pageNo }} / {{ totalPages }} 页</span>
      </XhPaginationRoot>
    </section>

    <section>
      <h2>Drawer</h2>
      <p class="lead">
        贴边渲染的对话框：Escape 关闭、Tab 与 Shift+Tab 在面板里循环出不去、点面板外关闭，
        关掉后焦点回到刚按下的那个触发按钮；展开期间页面滚不动。
        四个按钮各走一条边——面板到底贴住哪边，看的是 data-side：root 留在页面原地（收起态也带着它），
        content 被 portal 到 body，两处必须报同一条边。
      </p>
      <div class="row">
        <XhDrawerRoot
          v-for="s in drawerSides"
          :key="s"
          v-slot="{ side }"
          :side="s"
          :translations="drawerTranslations"
          @open-change="(d: { open: boolean }) => onDrawerOpenChange(s, d.open)"
        >
          <XhDrawerTrigger>{{ drawerLabels[s] }}</XhDrawerTrigger>
          <XhDrawerContent>
            <XhDrawerTitle>{{ drawerLabels[s] }}</XhDrawerTitle>
            <XhDrawerDescription>
              data-side 是 {{ side }}：面板压在哪条边上，跟 DevTools 里 root 与 content 的这个值对一眼。
            </XhDrawerDescription>
            <!-- close-trigger 是右上角的图标按钮（定宽定高），放图标而非文案；
                 可及名由 translations.close 经 connect 写成 aria-label -->
            <XhDrawerCloseTrigger>✕</XhDrawerCloseTrigger>
          </XhDrawerContent>
        </XhDrawerRoot>
      </div>
      <span class="lead">当前展开：{{ drawerOpened || '（无）' }}</span>
    </section>

    <section>
      <h2>Toaster / Toast</h2>
      <p class="lead">
        toaster 是队列，toast 是队列里的一条，四颗按钮走的都是同一份命令式接口。
        create 入队并返回 id；同一个 id 再 create 一次就是就地改写、位置不动——“上传”那颗先挂一条 loading
        （它说的是事情还没完，不自动消失），中途 update 改一次说明文字，最后原地换成 success 才开始倒计时。
        把鼠标停在通知上倒计时会被按住，移开是接着走剩下那一段而不是从头重来；Tab 进撤销 / ✕ 同样按住，焦点离开才放。
        error 那条走 alert + assertive，读屏会打断当前朗读。“全部清空”是把队列直接倒掉，不走退场窗口。
        队列只交摞内间距，往哪个角贴由 placement 打在 group 上的 data-placement 驱动皮肤，改一处属性就换角。
      </p>
      <XhToasterRoot v-slot="{ create, update, dismissAll, count }" placement="bottom-end" :max="4" :gap="12">
        <div class="row">
          <XhButton variant="subtle" @click="create({ title: '草稿已保存', description: '内容已同步到云端' })">
            弹一条 info
          </XhButton>
          <XhButton variant="subtle" @click="create({ type: 'error', title: '同步失败', description: '网络中断，稍后自动重试' })">
            弹一条 error
          </XhButton>
          <XhButton variant="solid" @click="startUpload(create, update)">
            上传（loading → success）
          </XhButton>
          <XhButton variant="ghost" @click="dismissAll()">
            全部清空
          </XhButton>
          <span class="lead">队列：{{ count }} 条</span>
        </div>
        <XhToasterGroup>
          <template #default="{ toast }">
            <XhToastRoot
              :id="toast.id"
              :title="toast.title"
              :description="toast.description"
              :type="toast.type"
              :duration="toast.duration"
              :remove-delay="toast.removeDelay"
              :closable="toast.closable"
              :translations="toastTranslations"
            >
              <XhToastTitle />
              <XhToastDescription />
              <!-- 这层行容器是本页自己的排版，不是角色节点 -->
              <div class="row" style="gap: 8px; margin-block-start: 6px;">
                <XhToastActionTrigger>撤销</XhToastActionTrigger>
                <XhToastCloseTrigger>✕</XhToastCloseTrigger>
              </div>
            </XhToastRoot>
          </template>
        </XhToasterGroup>
      </XhToasterRoot>
    </section>

    <section>
      <h2>Combobox</h2>
      <p class="lead">
        打字即展开并就地过滤——筛出哪几条是本页自己算的（一个 computed 按输入串匹配整条文本），
        组件只管高亮、选中与空态：打 be 只剩 Beijing / Berlin，打 北 一样筛得动。
        焦点自始至终在输入框上，方向键移的是高亮而不是焦点，长列表里高亮会自己滚进可视区；
        Home / End 跳首尾，禁用的 Busan 一路被跳过（打 bu 只剩它一条时，方向键无处可落、Enter 也不落值）。
        Enter 落值并收起；Escape 分两拍——先摘掉高亮，再按一次才收起列表。
        打一串谁也接不上的字（比如 zz），列表让位给“无匹配城市”那条空态，它是列表的兄弟而不是列表里的一项。
        这一个开了 open-on-click，点输入框即展开；缺省不开，键盘与 ▾ 才是入口。
        选中之后输入框被回填成候选文本，列表因此只剩它自己——过滤权在调用方手里就是这个后果，按 ✕ 清空即回到全集。
      </p>
      <div class="row">
        <XhComboboxRoot v-model:value="comboValue" v-model:input-value="comboQuery" open-on-click placeholder="输入城市名筛选">
          <XhComboboxLabel>城市</XhComboboxLabel>
          <XhComboboxControl>
            <XhComboboxInput />
            <XhComboboxTrigger>▾</XhComboboxTrigger>
            <XhComboboxClearTrigger>✕</XhComboboxClearTrigger>
          </XhComboboxControl>
          <XhComboboxPositioner>
            <XhComboboxContent>
              <!-- v-for 必带 key：就地复用会让 aria-activedescendant 指着一个已经换了身份的条目 -->
              <XhComboboxItem v-for="c in comboFiltered" :key="c.value" :value="c.value" :disabled="c.disabled">
                <XhComboboxItemText>{{ c.label }}</XhComboboxItemText>
                <!-- 勾选标记恒在，显不显由选中态驱动皮肤；未选中时它仍占着宽度，切换不抖行 -->
                <XhComboboxItemIndicator>✓</XhComboboxItemIndicator>
              </XhComboboxItem>
            </XhComboboxContent>
            <!-- 空态摆在 positioner 里当 content 的兄弟：列表里只放候选 -->
            <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
          </XhComboboxPositioner>
        </XhComboboxRoot>
        <span class="lead">当前值：{{ comboValue[0] ?? '（未选）' }}</span>
      </div>
      <p class="lead" style="margin-block-start: 20px;">
        多选的差别全在选完之后：列表不收起、输入串自动清空，候选立刻回到全集，接着挑下一个；
        再点一次已选项就是取消。输入框空着时按退格删掉最后一个已选项（框里有字则照常删字）。
        已选项怎么显示由本页决定，这里就回显成一行文字。
      </p>
      <div class="row">
        <XhComboboxRoot v-model:value="comboMultiValue" v-model:input-value="comboMultiQuery" multiple placeholder="挑几个城市">
          <XhComboboxLabel>常去城市</XhComboboxLabel>
          <XhComboboxControl>
            <XhComboboxInput />
            <XhComboboxTrigger>▾</XhComboboxTrigger>
            <XhComboboxClearTrigger>✕</XhComboboxClearTrigger>
          </XhComboboxControl>
          <XhComboboxPositioner>
            <XhComboboxContent>
              <XhComboboxItem v-for="c in comboMultiFiltered" :key="c.value" :value="c.value" :disabled="c.disabled">
                <XhComboboxItemText>{{ c.label }}</XhComboboxItemText>
                <XhComboboxItemIndicator>✓</XhComboboxItemIndicator>
              </XhComboboxItem>
            </XhComboboxContent>
            <XhComboboxEmpty>无匹配城市</XhComboboxEmpty>
          </XhComboboxPositioner>
        </XhComboboxRoot>
        <span class="lead">已选：{{ comboMultiValue.length ? comboMultiValue.join('、') : '（无）' }}</span>
      </div>
    </section>

    <section>
      <h2>TagsInput</h2>
      <p class="lead">
        三个标签是预置的。框里打字后按 Enter 落一个；直接打逗号也断词——一口气打 <code>React,Svelte</code> 会一次进两个，
        最后没打完的那一段留在框里接着打。
        框里空着时退格分两步：头一下只把最后一个标签反白（这一下什么都不删），再按一下才真删掉；
        左右方向键在标签之间走，Home / End 跳到头尾，Escape 把光标交回输入框。
        粘一段 <code>a,b,c</code> 试试：开着 addOnPaste 就按分隔符拆成三个标签，而不是整串塞进框里。
        上限是 5——顶满后框的描边转成警示色，再打再粘都进不去，但已经打进去的字不会被悄悄吃掉，原样留在框里。
        双击任一标签就地改写它：Enter 提交、Escape 撤销回原样，改成空白等于把这个标签删了。
        右端的清空钮把标签与没提交的文本一起倒掉，清完自己转灰而不是收起；提交给表单的是按分隔符拼好的一整串，落在末尾那个 hidden-input 上。
      </p>
      <XhTagsInputRoot
        v-slot="{ value, count, atMax }"
        v-model:value="stack"
        :max="5"
        add-on-paste
        editable
        name="stack"
        placeholder="回车落一个"
        style="max-inline-size: 420px;"
      >
        <XhTagsInputLabel>技术栈</XhTagsInputLabel>
        <XhTagsInputControl>
          <!-- 标签由作者按当前值渲染。key 必须给：就地复用会让正被编辑的那个节点换了身份，光标锚点随之悬空 -->
          <XhTagsInputItem v-for="t in value" :key="t" :value="t">
            <XhTagsInputItemPreview>
              <XhTagsInputItemText>{{ t }}</XhTagsInputItemText>
              <XhTagsInputItemDeleteTrigger>×</XhTagsInputItemDeleteTrigger>
            </XhTagsInputItemPreview>
            <!-- 就地编辑框常挂不卸载，不编辑时由组件收起 -->
            <XhTagsInputItemInput />
          </XhTagsInputItem>
          <XhTagsInputInput />
          <XhTagsInputClearTrigger>⨯</XhTagsInputClearTrigger>
        </XhTagsInputControl>
        <XhTagsInputHiddenInput />
        <span class="lead">{{ count }} / 5 个标签{{ atMax ? ' · 已到上限' : '' }}：{{ value.length ? value.join('、') : '（无）' }}</span>
      </XhTagsInputRoot>
    </section>

    <section>
      <h2>Editable</h2>
      <p class="lead">
        预览与编辑两态轮流上场：点预览区（或按“编辑”）进编辑态，进去就把整段选中；退出时焦点回到预览区，不会掉进 body。
        两态的文字左右位置对齐，来回切文字不挪一下。
        上面这个 submitMode 走 blur——点到页面别处或 Tab 走开就落定，Enter 不接管（这一页没有外层表单，按下去看着像没反应，值也确实还没提交）；
        下面这个走 enter——Enter 才落定，失焦与 Tab 反过来是撤销，没提交过的值不会留在界面上。
        两个都认 Escape：撤销回的是上一次提交的那个值，不是刚进编辑态时看到的那一屏——改一次存下，再改一次按 Escape 就看得出区别。
        “保存 / 取消”只在编辑态露面，按下时不抢焦点：下面那个失焦即撤销的模式里点“保存”仍然存得下。
        把值删空退出，预览区退回压淡的占位文字。
      </p>
      <div class="row">
        <XhEditableRoot
          v-model:value="editableName"
          placeholder="未填写"
          submit-mode="blur"
          @value-commit="onNicknameCommit"
        >
          <XhEditableLabel>昵称</XhEditableLabel>
          <XhEditableArea>
            <!-- preview 不写内容：显示什么由组件填（值，或值为空时的占位）；写死了就再也刷不动 -->
            <XhEditablePreview />
            <XhEditableInput />
          </XhEditableArea>
          <XhEditableControl>
            <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
            <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
            <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
          </XhEditableControl>
        </XhEditableRoot>
        <span class="lead">submitMode=blur · 当前：{{ editableName || '（空）' }} · 上次提交：{{ editableNameCommitted || '（空）' }}</span>
      </div>
      <div class="row" style="margin-block-start: 12px;">
        <XhEditableRoot
          v-model:value="signature"
          placeholder="未填写"
          submit-mode="enter"
          @value-commit="onSignatureCommit"
        >
          <XhEditableLabel>签名</XhEditableLabel>
          <XhEditableArea>
            <XhEditablePreview />
            <XhEditableInput />
          </XhEditableArea>
          <XhEditableControl>
            <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
            <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
            <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
          </XhEditableControl>
        </XhEditableRoot>
        <span class="lead">submitMode=enter · 当前：{{ signature || '（空）' }} · 上次提交：{{ signatureCommitted || '（空）' }}</span>
      </div>
    </section>

    <section>
      <h2>FileUpload</h2>
      <p class="lead">
        拖着文件经过投放区，边框与底色当场换成品牌色，指针在区内几个子节点之间挪动不会让它闪——
        这是“现在松手就放得下”的唯一提示。投放区自己就是一个大按钮：Tab 停得上去，
        Enter 或空格都打得开系统选择框（空格顺带被拦下、不滚屏），点标题“附件”同样打得开。
        最多 3 个、单个不超过 512 KB，越界的当场被拒并说清是哪一条——一次拖十个进来，前 3 个收下、其余报“放不下”；
        而已经因为太大出局的文件不占名额，也不会再多背一条“太多了”。
        每行的删除按钮读屏念的是“删除 具体文件名”而不是一串“删除”；列表为空时“清空”带原生 disabled，Tab 停都停不上去。
        缩略图占位上挂着 data-file-type（系统给不出 MIME 时是 unknown），皮肤按它挑颜色。
      </p>
      <XhFileUploadRoot
        v-slot="{ acceptedFiles }"
        :max-files="3"
        :max-file-size="512 * 1024"
        :translations="uploadTranslations"
        @files-change="onUploadFilesChange"
        @file-accept="onUploadAccept"
        @file-reject="onUploadReject"
      >
        <XhFileUploadLabel>附件</XhFileUploadLabel>
        <XhFileUploadDropzone>
          <span>把文件拖到这里</span>
          <span>最多 3 个，单个不超过 512 KB</span>
        </XhFileUploadDropzone>
        <!-- 这层行容器是本页自己的排版，不是角色节点：root 是纵向 flex，按钮不套一层会被拉满整行 -->
        <div class="row">
          <XhFileUploadTrigger>选择文件</XhFileUploadTrigger>
        </div>
        <XhFileUploadHiddenInput />
        <XhFileUploadItemGroup>
          <!-- key 取 File 本身：同名同大小的两个文件是两份不同的文件，拿文件名当 key 会撞 -->
          <XhFileUploadItem v-for="f in acceptedFiles" :key="f" :file="f">
            <XhFileUploadItemPreview />
            <XhFileUploadItemName />
            <XhFileUploadItemSizeText />
            <XhFileUploadItemDeleteTrigger>✕</XhFileUploadItemDeleteTrigger>
          </XhFileUploadItem>
        </XhFileUploadItemGroup>
        <XhFileUploadClearTrigger>清空</XhFileUploadClearTrigger>
      </XhFileUploadRoot>
      <span class="lead">已选 {{ uploadCount }} / 3<template v-if="uploadReject"> · 被拒：{{ uploadReject }}</template></span>
    </section>

    <section>
      <h2>Tree</h2>
      <p class="lead">
        三层目录树：src 默认展开，docs、dist 与 components / utils 都收着。上下键走的是可见行——
        src 收起时它底下那三行一并退出序列，展开了才回来；禁用的 pnpm-lock.yaml 被上下键与连打一并跳过，
        点上去仍能当方向键的起点，只是确认键不认它。右键在收起的分支上就地展开、已展开则进首个子节点，叶子上不吞键；
        左键反过来：展开的分支就地收起，收起的分支与叶子跳回父层，根层的行什么也不做。Home / End 落在首末可见行。
        连打字母只在可见行上检索——连按 d 在 docs 与 dist 之间轮转，藏在收起分支里的 Dialog.vue 与 dom.ts 一次也走不到。
        停在 components 上按 * 只展开它同一层的分支（components 与 utils），docs 与 dist 不动。
        点分支行连选带展开，点箭头只切展开、不动选中；整棵树只占一个 Tab 位，焦点从外面进来先落在已选中的那行上。
        每深一层的缩进由子层容器自己顶着，本页一行样式都不写；dist 的子层是空数组，它照样是分支——展得开，只是里头没有行。
      </p>
      <!-- 展开与选中都走受控：组件只发事件、不落内部值，宿主写回它才动，回显的就是写回的那两份集合 -->
      <XhTreeRoot
        :collection="projectTree"
        :expanded-value="treeExpanded"
        :selected-value="treeSelected"
        style="max-inline-size: 360px;"
        @expanded-change="onTreeExpandedChange"
        @selection-change="onTreeSelectionChange"
      >
        <XhTreeLabel>项目文件</XhTreeLabel>
        <XhTreeTree>
          <!-- 分支行只放一个箭头、叶子行只放一个勾选标记，两者同宽（皮肤给的图标位），
               两种行的文字起点才对得齐；箭头的朝向由 data-state 驱动，本页不写旋转 -->
          <XhTreeBranch value="src">
            <XhTreeBranchControl>
              <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
              <XhTreeBranchText>src</XhTreeBranchText>
            </XhTreeBranchControl>
            <XhTreeBranchContent>
              <XhTreeBranch value="components">
                <XhTreeBranchControl>
                  <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
                  <XhTreeBranchText>components</XhTreeBranchText>
                </XhTreeBranchControl>
                <XhTreeBranchContent>
                  <XhTreeItem value="button">
                    <XhTreeItemIndicator>✓</XhTreeItemIndicator>
                    <XhTreeItemText>Button.vue</XhTreeItemText>
                  </XhTreeItem>
                  <XhTreeItem value="dialog">
                    <XhTreeItemIndicator>✓</XhTreeItemIndicator>
                    <XhTreeItemText>Dialog.vue</XhTreeItemText>
                  </XhTreeItem>
                  <XhTreeItem value="field">
                    <XhTreeItemIndicator>✓</XhTreeItemIndicator>
                    <XhTreeItemText>Field.vue</XhTreeItemText>
                  </XhTreeItem>
                </XhTreeBranchContent>
              </XhTreeBranch>
              <XhTreeBranch value="utils">
                <XhTreeBranchControl>
                  <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
                  <XhTreeBranchText>utils</XhTreeBranchText>
                </XhTreeBranchControl>
                <XhTreeBranchContent>
                  <XhTreeItem value="dom">
                    <XhTreeItemIndicator>✓</XhTreeItemIndicator>
                    <XhTreeItemText>dom.ts</XhTreeItemText>
                  </XhTreeItem>
                  <XhTreeItem value="format">
                    <XhTreeItemIndicator>✓</XhTreeItemIndicator>
                    <XhTreeItemText>format.ts</XhTreeItemText>
                  </XhTreeItem>
                </XhTreeBranchContent>
              </XhTreeBranch>
              <XhTreeItem value="main">
                <XhTreeItemIndicator>✓</XhTreeItemIndicator>
                <XhTreeItemText>main.ts</XhTreeItemText>
              </XhTreeItem>
            </XhTreeBranchContent>
          </XhTreeBranch>
          <XhTreeBranch value="docs">
            <XhTreeBranchControl>
              <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
              <XhTreeBranchText>docs</XhTreeBranchText>
            </XhTreeBranchControl>
            <XhTreeBranchContent>
              <XhTreeItem value="guide">
                <XhTreeItemIndicator>✓</XhTreeItemIndicator>
                <XhTreeItemText>guide.md</XhTreeItemText>
              </XhTreeItem>
              <XhTreeItem value="api">
                <XhTreeItemIndicator>✓</XhTreeItemIndicator>
                <XhTreeItemText>api.md</XhTreeItemText>
              </XhTreeItem>
            </XhTreeBranchContent>
          </XhTreeBranch>
          <XhTreeBranch value="dist">
            <XhTreeBranchControl>
              <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
              <XhTreeBranchText>dist</XhTreeBranchText>
            </XhTreeBranchControl>
            <!-- 空目录的子层容器照写：它展得开，只是里头没有行 -->
            <XhTreeBranchContent />
          </XhTreeBranch>
          <XhTreeItem value="lockfile">
            <XhTreeItemIndicator>✓</XhTreeItemIndicator>
            <XhTreeItemText>pnpm-lock.yaml（禁用）</XhTreeItemText>
          </XhTreeItem>
          <XhTreeItem value="readme">
            <XhTreeItemIndicator>✓</XhTreeItemIndicator>
            <XhTreeItemText>README.md</XhTreeItemText>
          </XhTreeItem>
        </XhTreeTree>
      </XhTreeRoot>
      <span class="lead">展开：{{ treeExpanded.length ? treeExpanded.join('、') : '（无）' }} · 选中：{{ treeSelected.length ? treeSelected.join('、') : '（无）' }}</span>
    </section>

    <section>
      <h2>Toolbar</h2>
      <p class="lead">
        整条在 Tab 序列里只占一个位子：从上一个控件按 Tab 进来会落在其中一个条目上，再按一次 Tab 就整条离开，
        条内改用方向键走。横排那条收左右键、把上下键原样放行给页面滚动，竖排那条正相反——两条摆在一起，
        按方向键就看得出 orientation 换掉的是哪一对键，分隔线也跟着转向（它的朝向恒与主轴垂直）。
        方向键跨得过分隔线、也走得进分组（分组只是把一伙控件收紧，不是导航里多出来的一层），到尽头回绕；
        斜体是禁用项，方向键路过时直接跳过，但拿鼠标点它焦点仍落得上去、Tab 位也归它，再按方向键就从它这儿起步。
        Home / End 取的是首尾两个可用条目，分隔线与分组容器都不算端点。
        勾上「整条禁用」条目全转 aria-disabled、方向键当场不再接管（焦点进来就停在容器上）；
        取消勾选后禁用的仍然只有斜体那一项。
        条目是作者自己的按钮：工具条不覆盖它的 role、也不接管它的点击，下面那行回显是按钮自己的 click 记的。
      </p>
      <div class="row" style="gap: 24px; align-items: flex-start;">
        <XhToolbarRoot :disabled="toolbarLocked">
          <XhToolbarItem value="bold" @click="runToolbarCommand('bold')">
            粗体
          </XhToolbarItem>
          <XhToolbarItem value="italic" disabled>
            斜体（禁用）
          </XhToolbarItem>
          <XhToolbarItem value="underline" @click="runToolbarCommand('underline')">
            下划线
          </XhToolbarItem>
          <XhToolbarSeparator />
          <XhToolbarGroup>
            <XhToolbarItem value="align-left" @click="runToolbarCommand('align-left')">
              左对齐
            </XhToolbarItem>
            <XhToolbarItem value="align-center" @click="runToolbarCommand('align-center')">
              居中
            </XhToolbarItem>
            <XhToolbarItem value="align-right" @click="runToolbarCommand('align-right')">
              右对齐
            </XhToolbarItem>
          </XhToolbarGroup>
        </XhToolbarRoot>
        <XhToolbarRoot orientation="vertical">
          <XhToolbarItem value="undo" @click="runToolbarCommand('undo')">
            撤销
          </XhToolbarItem>
          <XhToolbarItem value="redo" @click="runToolbarCommand('redo')">
            重做
          </XhToolbarItem>
          <XhToolbarSeparator />
          <XhToolbarItem value="clear" @click="runToolbarCommand('clear')">
            清除格式
          </XhToolbarItem>
        </XhToolbarRoot>
      </div>
      <label class="row">
        <input v-model="toolbarLocked" type="checkbox"> 整条禁用（横排那条）
      </label>
      <span class="lead">最近点击：{{ toolbarCommand }}</span>
    </section>

    <section>
      <h2>Breadcrumb</h2>
      <p class="lead">
        最后那一级是当前页：它照样是个 <code>&lt;a&gt;</code>、照样写着 href，
        但连接层给它打上 aria-current="page" 并把点击拦了下来——点前面几条地址栏跟着变，点它什么都不会发生。
        它也不占 Tab 位（tabindex="-1"）：Tab 一路走过去只停在前面那几条上，
        停在一个点了也没去处的链接上，只会让人每次都多按一下。
        中间那个省略号是被折叠掉的一层，和几个斜杠一样只是视觉占位，读屏那边一并被 aria-hidden 摘掉，
        念出来仍是“列表，共 3 项”——层级关系由 ol / li 自己给。
        要让折叠掉的那几层可达，得在省略号那儿另放一个菜单，那是另一个组件的事。
      </p>
      <XhBreadcrumbRoot>
        <XhBreadcrumbList>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#/">
              首页
            </XhBreadcrumbLink>
          </XhBreadcrumbItem>
          <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          <XhBreadcrumbItem>
            <XhBreadcrumbLink href="#/components">
              组件
            </XhBreadcrumbLink>
          </XhBreadcrumbItem>
          <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          <!-- 省略号与分隔符都是 ol 的直接子 li（ol 里只放得下 li），两者都不参与列表项计数 -->
          <XhBreadcrumbEllipsis>…</XhBreadcrumbEllipsis>
          <XhBreadcrumbSeparator>/</XhBreadcrumbSeparator>
          <XhBreadcrumbItem>
            <!-- href 归作者写（那是路由的事），当前页那条只多一个 current 声明 -->
            <XhBreadcrumbLink href="#/components/breadcrumb" current>
              面包屑
            </XhBreadcrumbLink>
          </XhBreadcrumbItem>
        </XhBreadcrumbList>
      </XhBreadcrumbRoot>
    </section>

    <section>
      <h2>Steps</h2>
      <p class="lead">
        四步下单流程，进退由下面那两颗按钮驱动。方向键在一排 trigger 之间走（横排认 ArrowLeft / ArrowRight，两端不回绕），
        但它只搬焦点、不切步——走到想去的那一步还得按 Enter 或空格才真的切过去：
        切一步往往要跑校验、发请求，不能跟着焦点自动发生。
        整条步骤条只占一个 Tab 位，Tab 进来落在当前步上，再按一次就整组离开。
        面板不做懒挂载，五块一直挂着、只按当前步 hidden 显隐——第 1 步里勾上的那个复选框，走到第 4 步再退回来还在。
        走完最后一步还有一格“全部完成”：那时没有任何一步是当前步，四块步骤面板全收起、完成页显出来，下一步随之禁用；
        此刻也没有条目认领得了那个 Tab 位，于是整条 list 自己进 Tab 序列兜底（落焦有一圈 focus 环），不然键盘就再也进不来了。
        下面第二台只多了一个 linear：还没走到的那几步一律禁用，走的是 aria-disabled 而不是原生 disabled——
        它们仍聚焦得上、仍能当方向键的起点，只是点不动、方向键也跳过，所以停在第 1 步按 ArrowRight 会原地不动，
        往前只能靠“下一步”一格格推；已走过的与当前这一步照常点得动（回头看是允许的），但一退回去，后面那几步立刻重新锁上。
      </p>
      <XhStepsRoot v-slot="{ step, count, complete, goToPrevStep, goToNextStep }" v-model:step="orderStep" :count="orderSteps.length">
        <XhStepsList>
          <XhStepsItem v-for="(s, i) in orderSteps" :key="s.title" :value="i">
            <XhStepsTrigger>
              <!-- 圆点里的字符是作者内容：皮肤只按 data-state 管描边与填充，换成对勾得自己写 -->
              <XhStepsIndicator>{{ step > i ? '✓' : i + 1 }}</XhStepsIndicator>
              <XhStepsTitle>{{ s.title }}</XhStepsTitle>
              <XhStepsDescription>{{ s.description }}</XhStepsDescription>
            </XhStepsTrigger>
            <XhStepsSeparator />
          </XhStepsItem>
        </XhStepsList>
        <XhStepsContent :value="0">
          <label class="row"><input type="checkbox"> 保存为默认地址（勾上，切到别的步再切回来看看）</label>
        </XhStepsContent>
        <XhStepsContent :value="1">
          面板 2：选支付方式。
        </XhStepsContent>
        <XhStepsContent :value="2">
          面板 3：填发票抬头与税号。
        </XhStepsContent>
        <XhStepsContent :value="3">
          面板 4：核对金额，按“下一步”提交。
        </XhStepsContent>
        <!-- value 等于 count 的这块是完成页：走完最后一步之后的那一格 -->
        <XhStepsContent :value="orderSteps.length">
          全部完成：订单已提交。按“上一步”可以退回最后一步。
        </XhStepsContent>
        <!-- 进退按钮通常长在步骤条外面（真实表单里它们在页面底部），出口由 root 的插槽交出来 -->
        <div class="row">
          <XhButton variant="subtle" :disabled="step === 0" @click="goToPrevStep()">
            上一步
          </XhButton>
          <XhButton variant="solid" :disabled="complete" @click="goToNextStep()">
            下一步
          </XhButton>
          <span class="lead">{{ complete ? '当前：全部完成' : `当前：第 ${step + 1} / ${count} 步` }}</span>
        </div>
      </XhStepsRoot>

      <!-- margin 只是两台之间的留白，属于本页排版，皮肤不管 -->
      <XhStepsRoot v-slot="{ step, count, complete, goToPrevStep, goToNextStep }" v-model:step="auditStep" :count="auditSteps.length" linear style="margin-block-start: 20px;">
        <XhStepsList>
          <XhStepsItem v-for="(s, i) in auditSteps" :key="s.title" :value="i">
            <XhStepsTrigger>
              <XhStepsIndicator>{{ step > i ? '✓' : i + 1 }}</XhStepsIndicator>
              <XhStepsTitle>{{ s.title }}</XhStepsTitle>
            </XhStepsTrigger>
            <XhStepsSeparator />
          </XhStepsItem>
        </XhStepsList>
        <XhStepsContent :value="0">
          面板 1：上传营业执照与法人身份证。
        </XhStepsContent>
        <XhStepsContent :value="1">
          面板 2：等待人工审核。
        </XhStepsContent>
        <XhStepsContent :value="2">
          面板 3：签署协议并开通。
        </XhStepsContent>
        <XhStepsContent :value="auditSteps.length">
          全部完成：服务已开通。
        </XhStepsContent>
        <div class="row">
          <XhButton variant="subtle" :disabled="step === 0" @click="goToPrevStep()">
            上一步
          </XhButton>
          <XhButton variant="solid" :disabled="complete" @click="goToNextStep()">
            下一步
          </XhButton>
          <span class="lead">{{ complete ? '当前：全部完成' : `当前：第 ${step + 1} / ${count} 步（linear）` }}</span>
        </div>
      </XhStepsRoot>
    </section>

    <section>
      <h2>HoverCard</h2>
      <p class="lead">
        悬停停够 700ms 才展开、移开 300ms 才收起——那段收起等待正是留给指针从触发器走到卡片上的通行时间，
        中间隔着一段间距也走得过去，途中卡片不会消失。与 Tooltip 的分界就在卡片本体是可交互的：
        指针停在卡片上一直不收，里面的“主页”链接与“关注”按钮都点得到、Tab 也走得进去（点“关注”卡片不会关）。
        键盘把焦点落到触发器上是立刻展开、不走那 700ms；焦点离开卡片即收起，Escape 当场收起、不等那 300ms。
        卡片从不抢焦点、不锁滚动，触发器本身是透明按钮，颜色与字体都随行文走，所以它在正文里读起来就是个普通用户名。
      </p>
      <div>
        最近这批组件由
        <XhHoverCardRoot placement="bottom-start" @open-change="onHoverCardOpenChange">
          <XhHoverCardTrigger>@xihan</XhHoverCardTrigger>
          <XhHoverCardPositioner>
            <XhHoverCardContent>
              <XhHoverCardArrow />
              <strong>XiHan.UI</strong>
              <span>框架无关的设计系统运行时，Vue 与 Web Components 共用同一套 headless。</span>
              <!-- 这层行容器是本页自己的排版，不是角色节点 -->
              <div class="row">
                <a href="#profile">主页</a>
                <XhButton variant="subtle" @click="hoverCardFollowing = !hoverCardFollowing">
                  {{ hoverCardFollowing ? '已关注' : '关注' }}
                </XhButton>
              </div>
            </XhHoverCardContent>
          </XhHoverCardPositioner>
        </XhHoverCardRoot>
        推上来。
      </div>
      <span class="lead">卡片：{{ hoverCardOpen ? '展开' : '收起' }} · {{ hoverCardFollowing ? '已关注' : '未关注' }}</span>
    </section>

    <section>
      <h2>ContextMenu</h2>
      <p class="lead">
        这一段必须拿真浏览器试：在下面那块区域上点右键，浏览器自带的那张菜单会被拦掉，换成这一张，
        而且它钉在鼠标点下去的那一点上——不是贴着区域某条边。换个角落再点一次，菜单就跟着坐标走；
        区域之外右键仍是浏览器自带的那张，正好对照着看接管到哪儿为止。
        已经开着的时候在别处再右键，它只是挪到新坐标，不先关再开，也不多发一对开合回调。
        触摸端在区域上按住 700ms 同样弹得出来，中途手指滑开或提前抬手就取消（鼠标按住不动不算长按）。
        区域自带一个 Tab 位，键盘按 ContextMenu 键或 Shift+F10 打开（裸 F10 不归它管），此时锚点取区域的起始角。
        展开后方向键跳过禁用的粘贴、Home / End 越过分隔线取首尾、连打 d 直接落到 Delete；
        Enter 与鼠标点击走同一条出口——选中、关闭、焦点还回区域，Escape 与在菜单外按左键同样关得掉。
      </p>
      <XhContextMenuRoot @select="onContextMenuSelect">
        <!-- 触发区是作者自己的一块内容：皮肤只管它的交互观感，尺寸与排布归这里，
               所以只写一条把区域撑开的版面约束，观感一概不碰 -->
        <XhContextMenuTrigger style="display: grid; place-items: center; min-block-size: 120px;">
          <span>在这块区域上右键（触摸端长按）</span>
        </XhContextMenuTrigger>
        <XhContextMenuPositioner>
          <XhContextMenuContent>
            <XhContextMenuItem value="copy">
              <XhContextMenuItemText>Copy 复制</XhContextMenuItemText>
            </XhContextMenuItem>
            <XhContextMenuItem value="paste" disabled>
              <XhContextMenuItemText>Paste 粘贴（剪贴板是空的）</XhContextMenuItemText>
            </XhContextMenuItem>
            <XhContextMenuItem value="rename">
              <XhContextMenuItemText>Rename 重命名</XhContextMenuItemText>
            </XhContextMenuItem>
            <XhContextMenuSeparator />
            <XhContextMenuItem value="delete">
              <XhContextMenuItemText>Delete 删除</XhContextMenuItemText>
            </XhContextMenuItem>
          </XhContextMenuContent>
        </XhContextMenuPositioner>
      </XhContextMenuRoot>
      <span class="lead">最近选中：{{ contextPicked || '（无）' }}</span>
    </section>

    <section>
      <h2>Clipboard</h2>
      <p class="lead">
        写入是异步的，也真的会失败：按下去先进 copying（按钮压暗，此刻连点也只发一次写请求），
        写成功才翻成“已复制”，2 秒后自己回落。失败一律退回初始态并把原因报出来——
        用 http 打开这个页面（非安全上下文）、或权限被拒都会走到这条路上，界面上绝不会留下“已复制”的假象。
        展示框是只读而不是禁用：聚焦即全选，键盘用户照样能用 Ctrl / Cmd + C 自己带走；
        点标题“接口密钥”会聚焦到框里（for 指的就是那个 input）。
        两个指示器都常挂在 DOM 里、靠 hidden 互斥显隐，来回切按钮不抖宽。
      </p>
      <XhClipboardRoot
        :value="apiToken"
        :timeout="2000"
        @status-change="onClipboardStatus"
        @copy-error="onClipboardError"
      >
        <XhClipboardLabel>接口密钥</XhClipboardLabel>
        <XhClipboardControl>
          <XhClipboardInput />
          <XhClipboardTrigger>
            <XhClipboardIndicator>复制</XhClipboardIndicator>
            <XhClipboardIndicator copied>
              ✓ 已复制
            </XhClipboardIndicator>
          </XhClipboardTrigger>
        </XhClipboardControl>
      </XhClipboardRoot>
      <span class="lead">
        状态：{{ clipboardStatusLabel() }}<template v-if="clipboardError"> · 上次失败：{{ clipboardError }}</template>
      </span>
    </section>

    <section>
      <h2>Image</h2>
      <p class="lead">
        比 Avatar 通用：不预设圆形、也不预设首字母兜底，尺寸由 <code>--xh-image-w</code> 与 <code>--xh-image-ratio</code>
        说了算，同一个组件既当封面图也当缩略图。图片与回退内容始终同时挂在 DOM 里、靠 hidden 互斥，换人时盒子不塌也不跳。
        三个例子分别是正常加载、地址写坏走回退、压根没有 src——后两者是同一个落点，
        DevTools 里看 root 上的 data-status 一眼分得清三态（loaded / error）。
        加载途中回退内容要不要立刻露面由 fallback-delay 决定，默认 0 就是立刻；给它一个值，走缓存的快图就不会先闪一下占位。
      </p>
      <div class="row">
        <!-- 这两条自定义属性是皮肤留给作者的尺寸接口（不给就是满宽、高度 auto），不是在覆盖皮肤 -->
        <XhImageRoot
          :src="demoImageSrc"
          alt="示例封面图"
          style="--xh-image-w: 200px; --xh-image-ratio: 16 / 9;"
          @status-change="(d: { status: string }) => onImageStatus('ok', d)"
        >
          <XhImageImage />
          <XhImageFallback>加载中</XhImageFallback>
        </XhImageRoot>
        <XhImageRoot
          src="https://example.invalid/broken.png"
          alt="地址写坏的图"
          style="--xh-image-w: 200px; --xh-image-ratio: 16 / 9;"
          @status-change="(d: { status: string }) => onImageStatus('broken', d)"
        >
          <XhImageImage />
          <XhImageFallback>图挂了</XhImageFallback>
        </XhImageRoot>
        <XhImageRoot
          style="--xh-image-w: 200px; --xh-image-ratio: 16 / 9;"
          @status-change="(d: { status: string }) => onImageStatus('none', d)"
        >
          <XhImageImage />
          <XhImageFallback>没有来源</XhImageFallback>
        </XhImageRoot>
      </div>
      <span class="lead">状态：正常 {{ imageStatus.ok }} · 坏地址 {{ imageStatus.broken }} · 无 src {{ imageStatus.none }}</span>
    </section>
  </main>
</template>
