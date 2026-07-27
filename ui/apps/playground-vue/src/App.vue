<script setup lang="ts">
import { createThemeController } from '@xihan-ui/system/runtime'
import {
  XhAccordionContent,
  XhAccordionHeader,
  XhAccordionItem,
  XhAccordionRoot,
  XhAccordionTrigger,
  XhBadge,
  XhButton,
  XhCheckbox,
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
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
  XhSeparator,
  XhSwitch,
  XhTabsContent,
  XhTabsList,
  XhTabsRoot,
  XhTabsTrigger,
  XhToggle,
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
      <h2>Popover</h2>
      <p class="lead">
        点击展开、Escape 或点外部关闭；展开时焦点进入内容，关闭后回到触发按钮。非模态不陷焦点。
      </p>
      <XhPopoverRoot placement="bottom-start">
        <XhPopoverTrigger>打开浮层</XhPopoverTrigger>
        <XhPopoverPositioner>
          <XhPopoverContent>
            <XhPopoverTitle>订阅设置</XhPopoverTitle>
            <XhPopoverDescription>
              role=dialog，四处 ARIA 互指；定位与 Tooltip 共用同一个引擎。
            </XhPopoverDescription>
            <div class="row end">
              <XhPopoverCloseTrigger>知道了</XhPopoverCloseTrigger>
            </div>
            <XhPopoverArrow />
          </XhPopoverContent>
        </XhPopoverPositioner>
      </XhPopoverRoot>
    </section>
  </main>
</template>
