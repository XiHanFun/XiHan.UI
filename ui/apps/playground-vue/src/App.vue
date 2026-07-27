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
  XhCollapsibleContent,
  XhCollapsibleRoot,
  XhCollapsibleTrigger,
  XhDialogCloseTrigger,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
  XhFieldControl,
  XhFieldDescription,
  XhFieldErrorText,
  XhFieldLabel,
  XhFieldRoot,
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
  </main>
</template>
