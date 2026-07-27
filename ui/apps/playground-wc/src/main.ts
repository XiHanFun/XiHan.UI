import { createThemeController } from '@xihan-ui/system/runtime'
import { defineXhElements } from '@xihan-ui/wc/define'
import '@xihan-ui/system/tokens.css'
import '@xihan-ui/styled'

// 注册自定义元素（惰性），并应用主题到根元素
defineXhElements()
const theme = createThemeController({ storageKey: 'xh-wc-demo-theme' })

const app = document.getElementById('app')!
app.innerHTML = `
<main class="wrap">
  <header>
    <h1>XiHan.UI · Web Components</h1>
    <button id="theme">切换主题</button>
  </header>
  <p class="lead">
    这些是原生自定义元素（Light-DOM 行为宿主），和 Vue 版共用同一套 headless（machine + connect）。
    打开 DevTools 看 <code>&lt;xh-button&gt;</code>/<code>&lt;xh-dialog&gt;</code> 内被打上的 data-* / aria-*。
  </p>

  <section>
    <h2>Button</h2>
    <div class="row">
      <xh-button variant="solid"><button data-xh-part="root">Solid</button></xh-button>
      <xh-button><button data-xh-part="root">Subtle</button></xh-button>
      <xh-button variant="outline"><button data-xh-part="root">Outline</button></xh-button>
      <xh-button variant="ghost"><button data-xh-part="root">Ghost</button></xh-button>
      <xh-button disabled><button data-xh-part="root">Disabled</button></xh-button>
      <xh-button loading><button data-xh-part="root">Loading</button></xh-button>
      <xh-button size="lg"><button data-xh-part="root">Large</button></xh-button>
    </div>
  </section>

  <section>
    <h2>Dialog</h2>
    <p class="lead">点击打开：焦点陷入内容、Esc 或点遮罩关闭、关闭后焦点回到触发按钮。</p>
    <xh-dialog>
      <button data-xh-part="trigger">打开对话框</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h3 data-xh-part="title">确认操作</h3>
          <p data-xh-part="description">由 dialog 状态机驱动的模态框——与 Vue 版是同一套 headless 逻辑，仅适配器不同。</p>
          <div class="row end">
            <xh-button variant="ghost"><button data-xh-part="root" data-close>取消</button></xh-button>
            <xh-button variant="solid"><button data-xh-part="root" data-close>确定</button></xh-button>
          </div>
          <button data-xh-part="close-trigger" aria-label="关闭">✕</button>
        </div>
      </div>
    </xh-dialog>
  </section>

  <section>
    <h2>Switch</h2>
    <div class="row" style="gap: 16px;">
      <label class="row" style="gap: 8px;">
        <xh-switch default-checked aria-label="Wi-Fi"><button data-xh-part="root"><span data-xh-part="thumb"></span></button></xh-switch>
        <span>Wi-Fi</span>
      </label>
      <label class="row" style="gap: 8px;">
        <xh-switch aria-label="非受控开关"><button data-xh-part="root"><span data-xh-part="thumb"></span></button></xh-switch>
        <span>非受控</span>
      </label>
      <label class="row" style="gap: 8px;">
        <xh-switch disabled aria-label="禁用开关"><button data-xh-part="root"><span data-xh-part="thumb"></span></button></xh-switch>
        <span>禁用</span>
      </label>
    </div>
  </section>

  <section>
    <h2>Checkbox</h2>
    <div class="row" style="gap: 16px;">
      <label class="row" style="gap: 8px;">
        <xh-checkbox aria-label="同意条款"><button data-xh-part="root"><span data-xh-part="indicator"></span></button></xh-checkbox>
        <span>同意条款</span>
      </label>
      <label class="row" style="gap: 8px;">
        <xh-checkbox default-checked aria-label="默认勾选"><button data-xh-part="root"><span data-xh-part="indicator"></span></button></xh-checkbox>
        <span>默认勾选</span>
      </label>
      <label class="row" style="gap: 8px;">
        <xh-checkbox disabled aria-label="禁用"><button data-xh-part="root"><span data-xh-part="indicator"></span></button></xh-checkbox>
        <span>禁用</span>
      </label>
    </div>
  </section>

  <section>
    <h2>Collapsible</h2>
    <xh-collapsible>
      <div data-xh-part="root">
        <button data-xh-part="trigger">展开详情 ▾</button>
        <div data-xh-part="content">
          <p class="lead" style="margin: 8px 0 0;">
            折叠面板跑的是与 Vue 版同一份 collapsible 机器；收起时 content 带 hidden 属性并由元素内联隐藏。
          </p>
        </div>
      </div>
    </xh-collapsible>
  </section>

  <section>
    <h2>Separator</h2>
    <div class="row" style="gap: 0;">
      <span>左</span>
      <xh-separator orientation="vertical"><div data-xh-part="root" style="block-size: 16px; margin-inline: 12px;"></div></xh-separator>
      <span>中</span>
      <xh-separator orientation="vertical"><div data-xh-part="root" style="block-size: 16px; margin-inline: 12px;"></div></xh-separator>
      <span>右</span>
    </div>
    <xh-separator><div data-xh-part="root" style="margin-block: 16px;"></div></xh-separator>
    <span class="lead">上面是水平分隔线。</span>
  </section>

  <section>
    <h2>Toggle</h2>
    <div class="row" style="gap: 16px;">
      <xh-toggle aria-label="加粗"><button data-xh-part="root">B</button></xh-toggle>
      <xh-toggle default-pressed aria-label="默认按下"><button data-xh-part="root">I</button></xh-toggle>
      <xh-toggle disabled aria-label="禁用"><button data-xh-part="root">U</button></xh-toggle>
      <span class="lead">aria-pressed 驱动</span>
    </div>
  </section>

  <section>
    <h2>Progress</h2>
    <xh-progress id="wc-progress" value="40">
      <div data-xh-part="root">
        <div data-xh-part="track"><div data-xh-part="range"></div></div>
      </div>
    </xh-progress>
    <div class="row" style="margin-block-start: 12px;">
      <xh-button variant="subtle"><button data-xh-part="root" data-progress="-20">−20</button></xh-button>
      <xh-button variant="subtle"><button data-xh-part="root" data-progress="20">+20</button></xh-button>
      <span class="lead" id="wc-progress-label">40 / 100</span>
    </div>
  </section>

  <section>
    <h2>Badge</h2>
    <div class="row">
      <xh-badge variant="solid"><span data-xh-part="root">Solid</span></xh-badge>
      <xh-badge variant="subtle"><span data-xh-part="root">Subtle</span></xh-badge>
      <xh-badge variant="outline"><span data-xh-part="root">Outline</span></xh-badge>
    </div>
  </section>

  <section>
    <h2>RadioGroup</h2>
    <p class="lead">四个方向键都能切换；组内只有一个 Tab 停靠点，方向键跳过禁用项。</p>
    <xh-radio-group default-value="standard" name="plan">
      <div data-xh-part="root">
        <span data-xh-part="label">套餐</span>
        <label data-xh-part="item" value="free">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">免费版</span>
        </label>
        <label data-xh-part="item" value="standard">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">标准版</span>
        </label>
        <label data-xh-part="item" value="pro" aria-disabled="true">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">专业版（禁用）</span>
        </label>
      </div>
    </xh-radio-group>
  </section>

  <section>
    <h2>Tabs</h2>
    <p class="lead">automatic 模式：方向键移动焦点并顺带切换；横排时上下键放行给页面。</p>
    <xh-tabs default-value="overview">
      <div data-xh-part="root">
        <div data-xh-part="list">
          <button data-xh-part="trigger" value="overview">概览</button>
          <button data-xh-part="trigger" value="usage">用法</button>
          <button data-xh-part="trigger" value="api" aria-disabled="true">API（禁用）</button>
        </div>
        <div data-xh-part="content" value="overview">概览面板：与 Vue 版共用同一份 tabs 机器。</div>
        <div data-xh-part="content" value="usage">用法面板：面板常挂，靠 hidden 显隐。</div>
        <div data-xh-part="content" value="api">API 面板。</div>
      </div>
    </xh-tabs>
  </section>

  <section>
    <h2>Accordion</h2>
    <p class="lead">不用 roving：每个标题都是正常 Tab 停靠点，方向键额外在标题间移动焦点。</p>
    <xh-accordion multiple>
      <div data-xh-part="root">
        <div data-xh-part="item" value="a">
          <h3 data-xh-part="header"><button data-xh-part="trigger">第一节</button></h3>
          <div data-xh-part="content">展开集合是 string[]，multiple 时可并存。</div>
        </div>
        <div data-xh-part="item" value="b">
          <h3 data-xh-part="header"><button data-xh-part="trigger">第二节</button></h3>
          <div data-xh-part="content">方向键只在标题间搬焦点，永不进内容区。</div>
        </div>
        <div data-xh-part="item" value="c">
          <h3 data-xh-part="header"><button data-xh-part="trigger">第三节</button></h3>
          <div data-xh-part="content">首尾不回绕。</div>
        </div>
      </div>
    </xh-accordion>
  </section>

  <section>
    <h2>Tooltip</h2>
    <p class="lead">悬停等 700ms 才出；聚焦立即出，且此时鼠标移出不会收走它。指针停在提示上也不收起。</p>
    <div class="row" style="gap: 24px;">
      <xh-tooltip placement="top">
        <button data-xh-part="trigger">上方（默认延时）</button>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            与 Vue 版共用同一份 tooltip 机器
            <div data-xh-part="arrow"></div>
          </div>
        </div>
      </xh-tooltip>
      <xh-tooltip placement="right" open-delay="0">
        <button data-xh-part="trigger">右侧（无延时）</button>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            placement 由定位引擎落定，空间不够会自动翻面
            <div data-xh-part="arrow"></div>
          </div>
        </div>
      </xh-tooltip>
    </div>
  </section>

  <section>
    <h2>Popover</h2>
    <p class="lead">
      点击展开、Escape 或点外部关闭；展开时焦点进入内容，关闭后回到触发按钮。
      下方空间不够时引擎会自动翻到上方（flip）。
    </p>
    <xh-popover placement="bottom-start">
      <button data-xh-part="trigger">打开浮层</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">订阅设置</h2>
          <p data-xh-part="description">role=dialog，四处 ARIA 互指；定位与 Tooltip 共用同一个引擎。</p>
          <!-- close-trigger 是右上角的图标按钮（定宽定高），放图标而非文案 -->
          <button data-xh-part="close-trigger" aria-label="关闭">✕</button>
          <div data-xh-part="arrow"></div>
        </div>
      </div>
    </xh-popover>
  </section>
</main>
`

document.getElementById('theme')!.addEventListener('click', () => {
  theme.setPreference({ mode: theme.getState().mode === 'light' ? 'dark' : 'light' })
})

// 进度条加减：直接改宿主元素的 value 属性，元素自行重连接
const progressEl = document.getElementById('wc-progress')!
const progressLabel = document.getElementById('wc-progress-label')!
for (const btn of Array.from(document.querySelectorAll('[data-progress]'))) {
  btn.addEventListener('click', () => {
    const delta = Number((btn as HTMLElement).dataset.progress)
    const next = Math.min(100, Math.max(0, Number(progressEl.getAttribute('value')) + delta))
    progressEl.setAttribute('value', String(next))
    progressLabel.textContent = `${next} / 100`
  })
}

// 取消/确定：复用 close-trigger 关闭对话框
for (const btn of Array.from(document.querySelectorAll('[data-close]'))) {
  btn.addEventListener('click', () => {
    (document.querySelector('xh-dialog [data-xh-part="close-trigger"]') as HTMLElement | null)?.click()
  })
}
