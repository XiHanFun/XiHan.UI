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
  XhButton,
  XhCheckbox,
  XhCheckboxGroupItem,
  XhCheckboxGroupItemControl,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
  XhCheckboxGroupTrigger,
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
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
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
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
  XhSwitch,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
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
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from '@xihan-ui/vue'
import { ref } from 'vue'

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

// 滑块的角色节点没有默认皮肤，可见的部分全靠这几串声明。
// range 与 thumb 的位置由连接层写进 inset-inline-start / inline-size，这里只补尺寸与配色；
// 横向轨道每帧会把 block-size / inline-size 写成空串（那条轴用不到），
// 所以这两处的宽高只能用 width / height / top 这类物理属性，写逻辑属性会被清掉。
const sliderLabelStyle = 'display: block; font-size: 13px; margin-block-end: 8px;'
const sliderControlStyle = 'position: relative; block-size: 24px; display: flex; align-items: center;'
const sliderTrackStyle = 'position: relative; inline-size: 100%; block-size: 6px; border-radius: 9999px; background: var(--xh-bg-subtle-active);'
const sliderRangeStyle = 'position: absolute; top: 0; height: 100%; border-radius: 9999px; background: var(--xh-bg-brand);'
const sliderThumbStyle = 'position: absolute; top: 50%; box-sizing: border-box; width: 18px; height: 18px; margin-top: -9px; margin-inline-start: -9px; border-radius: 50%; background: var(--xh-bg-brand); border: 2px solid var(--xh-bg-surface); box-shadow: var(--xh-shadow-sm); cursor: grab;'

const score = ref(3)
const scoreHover = ref<number | null>(null)
function onScoreHover(details: { value: number | null }) {
  scoreHover.value = details.value
}

const ratingLabelStyle = 'display: block; font-size: 13px; margin-block-end: 6px;'

// 五颗星写的是同一个字符，点亮与半亮全靠颜色：半颗用一道 50% 的渐变裁到字形上。
// display: inline-block 让每颗星自成一行盒，字符两侧的换行空白不会算进宽度——
// 指针落在左半边还是右半边就是按这个宽度判的。
function starStyle(state: { highlighted: boolean, half: boolean }, cursor = 'pointer') {
  const on = 'var(--xh-color-warning-500)'
  const off = 'var(--xh-fg-subtle)'
  const base = `display: inline-block; font-size: 26px; line-height: 1; user-select: none; cursor: ${cursor};`
  if (state.half)
    return `${base} background: linear-gradient(90deg, ${on} 50%, ${off} 50%); -webkit-background-clip: text; background-clip: text; color: transparent;`
  return `${base} color: ${state.highlighted ? on : off};`
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
const drawerEdge: Record<(typeof drawerSides)[number], string> = {
  top: 'inset-block-start: 0; inset-inline: 0; block-size: min(240px, 40vh);',
  right: 'inset-block: 0; inset-inline-end: 0; inline-size: min(320px, 82vw);',
  bottom: 'inset-block-end: 0; inset-inline: 0; block-size: min(240px, 40vh);',
  left: 'inset-block: 0; inset-inline-start: 0; inline-size: min(320px, 82vw);',
}
// 抽屉没有配套皮肤，贴边定位得自己写；backdrop 与 positioner 由 XhDrawerContent 内部渲染
// 并 portal 到 body，模板里够不着，所以遮罩用面板自身那圈铺满视口的投影顶上
// （投影不参与命中测试，点"遮罩"照样算 outside，关闭逻辑不受影响）。
function drawerPanelStyle(side: (typeof drawerSides)[number]): string {
  return `position: fixed; ${drawerEdge[side]} z-index: var(--xh-layer-modal); box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; padding: 20px; overflow: auto; background: var(--xh-bg-surface); color: var(--xh-fg-default); box-shadow: 0 0 0 100vmax var(--xh-bg-overlay), var(--xh-elevation-3);`
}
const drawerTranslations = { close: '关闭' }
const drawerOpened = ref('')
function onDrawerOpenChange(side: (typeof drawerSides)[number], open: boolean): void {
  drawerOpened.value = open ? side : ''
}

// 关闭按钮的文案。提到外面存一份：写在模板里每渲染一次都是个新对象，白白惊动一轮 props
const toastTranslations = { close: '关闭' }

function toastAccent(type: string): string {
  if (type === 'success')
    return 'var(--xh-color-success-600)'
  if (type === 'warning')
    return 'var(--xh-color-warning-600)'
  if (type === 'error')
    return 'var(--xh-color-danger-600)'
  if (type === 'loading')
    return 'var(--xh-fg-muted)'
  return 'var(--xh-color-info-600)'
}

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
        <div class="row" style="gap: 6px;">
          <XhPinInputInput
            v-for="i in 6"
            :key="i"
            :index="i - 1"
            style="inline-size: 36px; text-align: center; font-size: 18px;"
          />
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
        v-slot="{ isChecked, checkedState }"
        v-model:value="toppings"
        :item-values="toppingValues"
        name="topping"
        style="display: grid; justify-items: start; gap: 10px;"
      >
        <XhCheckboxGroupLabel style="color: var(--xh-fg-muted); font-size: 13px;">
          配料
        </XhCheckboxGroupLabel>
        <XhCheckboxGroupTrigger style="display: inline-flex; align-items: center; gap: 8px; cursor: pointer;">
          <span aria-hidden="true" style="display: inline-flex; align-items: center; justify-content: center; inline-size: 16px; block-size: 16px; border: 1px solid var(--xh-border-default); border-radius: 4px; font-size: 12px; line-height: 1;">{{ checkedState === 'all' ? '✓' : checkedState === 'some' ? '−' : '' }}</span>
          <span>全选（{{ checkedState }}）</span>
        </XhCheckboxGroupTrigger>
        <XhCheckboxGroupItem
          v-for="t in toppingItems"
          :key="t.value"
          :value="t.value"
          :disabled="t.disabled"
          style="position: relative; display: inline-flex; align-items: center; gap: 8px; cursor: pointer;"
        >
          <XhCheckboxGroupItemControl style="display: inline-flex; align-items: center; justify-content: center; inline-size: 16px; block-size: 16px; border: 1px solid var(--xh-border-default); border-radius: 4px; font-size: 12px; line-height: 1;">
            {{ isChecked(t.value) ? '✓' : '' }}
          </XhCheckboxGroupItemControl>
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
      <XhToggleGroupRoot v-model:value="align" style="display: flex; gap: 6px;">
        <XhToggleGroupItem
          v-for="a in alignItems"
          :key="a.value"
          :value="a.value"
          :disabled="a.disabled"
          style="padding: 4px 10px; border: 1px solid var(--xh-border-default); border-radius: 6px; background: var(--xh-bg-subtle); color: var(--xh-fg-default);"
        >
          {{ a.label }}
        </XhToggleGroupItem>
      </XhToggleGroupRoot>
      <span class="lead">对齐（单选）：{{ align ?? '（无）' }}</span>
      <XhToggleGroupRoot v-model:value="marks" multiple style="display: flex; gap: 6px; margin-block-start: 12px;">
        <XhToggleGroupItem
          v-for="m in markItems"
          :key="m.value"
          :value="m.value"
          :disabled="m.disabled"
          style="padding: 4px 10px; border: 1px solid var(--xh-border-default); border-radius: 6px; background: var(--xh-bg-subtle); color: var(--xh-fg-default);"
        >
          {{ m.label }}
        </XhToggleGroupItem>
      </XhToggleGroupRoot>
      <span class="lead">样式（多选）：{{ marks.join('、') || '（无）' }}</span>
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
      <XhSliderRoot v-model:value="volume" :min="0" :max="100" :step="1" :large-step="10" name="volume" style="max-inline-size: 360px;">
        <XhSliderLabel :style="sliderLabelStyle">
          音量
        </XhSliderLabel>
        <XhSliderControl :style="sliderControlStyle">
          <XhSliderTrack :style="sliderTrackStyle">
            <XhSliderRange :style="sliderRangeStyle" />
          </XhSliderTrack>
          <XhSliderThumb :style="sliderThumbStyle">
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
      <span class="lead">音量：{{ volume[0] }}</span>

      <XhSliderRoot v-model:value="price" :min="0" :max="1000" :step="10" :min-steps-between-thumbs="2" name="price" style="max-inline-size: 360px; margin-block-start: 20px;">
        <XhSliderLabel :style="sliderLabelStyle">
          价格区间（两个拇指至少隔 2 格）
        </XhSliderLabel>
        <XhSliderControl :style="sliderControlStyle">
          <XhSliderTrack :style="sliderTrackStyle">
            <XhSliderRange :style="sliderRangeStyle" />
          </XhSliderTrack>
          <XhSliderThumb :index="0" :style="sliderThumbStyle">
            <XhSliderHiddenInput />
          </XhSliderThumb>
          <XhSliderThumb :index="1" :style="sliderThumbStyle">
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
      <span class="lead">价格：¥{{ price[0] }} – ¥{{ price[1] }}</span>

      <XhSliderRoot :default-value="brightness" disabled name="brightness" style="max-inline-size: 360px; margin-block-start: 20px; opacity: 0.55;">
        <XhSliderLabel :style="sliderLabelStyle">
          亮度（已锁定）
        </XhSliderLabel>
        <XhSliderControl :style="sliderControlStyle">
          <XhSliderTrack :style="sliderTrackStyle">
            <XhSliderRange :style="sliderRangeStyle" />
          </XhSliderTrack>
          <XhSliderThumb :style="[sliderThumbStyle, 'cursor: not-allowed;']">
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
      <XhRatingRoot v-slot="{ items, getItemState }" v-model:value="score" allow-half name="score" style="position: relative;" @hover-change="onScoreHover">
        <XhRatingLabel :style="ratingLabelStyle">
          整体满意度
        </XhRatingLabel>
        <XhRatingControl style="display: inline-flex; gap: 4px;">
          <XhRatingItem v-for="i in items" :key="i" :value="i" :style="starStyle(getItemState({ value: i }))">
            ★
          </XhRatingItem>
        </XhRatingControl>
        <XhRatingHiddenInput />
      </XhRatingRoot>
      <span class="lead">评分：{{ score }} · 悬停预览：{{ scoreHover ?? '（无）' }}</span>

      <div class="row" style="gap: 32px; margin-block-start: 20px;">
        <XhRatingRoot v-slot="{ items, getItemState }" :default-value="4" read-only>
          <XhRatingLabel :style="ratingLabelStyle">
            只读（4 星）
          </XhRatingLabel>
          <XhRatingControl style="display: inline-flex; gap: 4px;">
            <XhRatingItem v-for="i in items" :key="i" :value="i" :style="starStyle(getItemState({ value: i }), 'default')">
              ★
            </XhRatingItem>
          </XhRatingControl>
        </XhRatingRoot>
        <XhRatingRoot v-slot="{ items, getItemState }" :default-value="2" disabled style="opacity: 0.55;">
          <XhRatingLabel :style="ratingLabelStyle">
            禁用（2 星）
          </XhRatingLabel>
          <XhRatingControl style="display: inline-flex; gap: 4px;">
            <XhRatingItem v-for="i in items" :key="i" :value="i" :style="starStyle(getItemState({ value: i }), 'not-allowed')">
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
        <XhListboxLabel style="display: block; margin-block-end: 6px;">
          城市
        </XhListboxLabel>
        <XhListboxContent style="border: 1px solid var(--xh-border-subtle); border-radius: 8px; padding: 4px;">
          <XhListboxItemGroup v-for="g in cityGroups" :key="g.value" :value="g.value">
            <XhListboxItemGroupLabel style="display: block; padding: 4px 8px; color: var(--xh-fg-muted); font-size: 12px;">
              {{ g.label }}
            </XhListboxItemGroupLabel>
            <XhListboxItem v-for="c in g.items" :key="c.value" :value="c.value" :disabled="c.disabled" class="row" style="padding: 4px 8px;">
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
      <XhPaginationRoot v-slot="{ pages, pageRange, count, totalPages }" v-model:page="pageNo" :count="196" :page-size="10" :sibling-count="1">
        <div class="row" style="gap: 6px;">
          <XhPaginationPrevTrigger>上一页</XhPaginationPrevTrigger>
          <template v-for="(p, i) in pages" :key="`${p}-${i}`">
            <XhPaginationEllipsis v-if="p === 'ellipsis'">
              …
            </XhPaginationEllipsis>
            <XhPaginationItem v-else :value="p" :style="p === pageNo ? 'font-weight: 700;' : undefined">
              {{ p }}
            </XhPaginationItem>
          </template>
          <XhPaginationNextTrigger>下一页</XhPaginationNextTrigger>
        </div>
        <span class="lead">第 {{ pageRange.start }}-{{ pageRange.end }} 条，共 {{ count }} 条 · 第 {{ pageNo }} / {{ totalPages }} 页</span>
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
            <!-- 面板样式按 api 报出的 side 现算，它就是打在 root 与 content 上的那个 data-side -->
            <div :style="drawerPanelStyle(side)">
              <XhDrawerTitle style="margin: 0; font-size: 16px;">
                {{ drawerLabels[s] }}
              </XhDrawerTitle>
              <XhDrawerDescription class="lead" style="margin: 0;">
                data-side 是 {{ side }}：面板压在哪条边上，跟 DevTools 里 root 与 content 的这个值对一眼。
              </XhDrawerDescription>
              <XhDrawerCloseTrigger style="margin-block-start: auto; align-self: flex-start;">
                关闭
              </XhDrawerCloseTrigger>
            </div>
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
        队列只交摞内间距，往哪个角贴、朝哪边堆叠是样式层的事，写在下面 group 的内联样式里。
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
        <XhToasterGroup
          style="position: fixed; inset-block-end: 24px; inset-inline-end: 24px; z-index: var(--xh-z-toast); display: flex; flex-direction: column; inline-size: 320px; max-inline-size: calc(100vw - 48px);"
        >
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
              style="display: grid; gap: 4px; padding: 12px 14px; border: 1px solid var(--xh-border-default); border-inline-start-width: 4px; border-radius: 10px; background: var(--xh-bg-surface-raised); box-shadow: var(--xh-shadow-lg); font-size: 13px; line-height: 1.5;"
              :style="{ borderInlineStartColor: toastAccent(toast.type) }"
            >
              <XhToastTitle style="font-weight: 600;" />
              <XhToastDescription style="color: var(--xh-fg-muted);" />
              <div class="row" style="gap: 8px; margin-block-start: 6px;">
                <XhToastActionTrigger style="font: inherit; padding: 2px 10px; border: 1px solid var(--xh-border-default); border-radius: 6px; background: var(--xh-bg-subtle); color: inherit; cursor: pointer;">
                  撤销
                </XhToastActionTrigger>
                <XhToastCloseTrigger style="font: inherit; margin-inline-start: auto; padding: 2px 8px; border: 0; border-radius: 6px; background: transparent; color: var(--xh-fg-muted); cursor: pointer;">
                  ✕
                </XhToastCloseTrigger>
              </div>
            </XhToastRoot>
          </template>
        </XhToasterGroup>
      </XhToasterRoot>
    </section>
  </main>
</template>
