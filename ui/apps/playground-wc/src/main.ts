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
    <h2>Menu</h2>
    <p class="lead">Enter / Space / ArrowDown 展开并落到首项，ArrowUp 落到末项；方向键跳过禁用项，Escape 关闭并归还焦点。</p>
    <xh-menu id="wc-menu">
      <button data-xh-part="trigger">操作</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="copy">复制</div>
          <div data-xh-part="item" value="paste">粘贴</div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete" aria-disabled="true">删除（禁用）</div>
        </div>
        <div data-xh-part="arrow"></div>
      </div>
    </xh-menu>
    <span class="lead" id="wc-menu-picked">最近选中：（无）</span>
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

  <section>
    <h2>Select</h2>
    <p class="lead">
      Enter / Space / 方向键展开，展开后方向键与 Home / End 移高亮、连打字母检索、Enter 选中；
      收起时直接连打字母即可就地换值。列表用的是与 Popover 同一个定位引擎。
    </p>
    <xh-select id="wc-select" name="fruit" placeholder="请选择">
      <!-- 表单影子控件由作者写这个空壳，元素只按当前值往里补选项 -->
      <select data-xh-part="hidden-select"></select>
      <span data-xh-part="label">水果</span>
      <!-- 必须是 button：div 不可聚焦，"关闭后焦点归还 trigger"就永远等不到 -->
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator">▾</span>
      </button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="blueberry">
            <span data-xh-part="item-text">蓝莓</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <!-- 条目禁用用 aria-disabled 声明：原生 disabled 会让它不可聚焦，
               而规格要求禁用条目仍可作为方向键的起点 -->
          <div data-xh-part="item" value="cherry" aria-disabled="true">
            <span data-xh-part="item-text">樱桃（缺货）</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="durian">
            <span data-xh-part="item-text">榴莲</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
        </div>
      </div>
    </xh-select>
    <span class="lead" id="wc-select-value">当前值：（未选）</span>
  </section>

  <section>
    <h2>Avatar</h2>
    <p class="lead">
      图片取回成功才显图，失败或没有 src 则显回退内容——两者始终只有一个可见，不会闪一下再换。
      第二个的地址故意写坏，用来看回退。
    </p>
    <div class="row">
      <!-- root 这层要自己写：data-status 落在它上面，样式按状态切换靠的就是它 -->
      <xh-avatar src="https://avatars.githubusercontent.com/u/1?v=4" alt="ok">
        <span data-xh-part="root">
          <img data-xh-part="image">
          <span data-xh-part="fallback">XH</span>
        </span>
      </xh-avatar>
      <xh-avatar src="https://example.invalid/404.png" alt="broken">
        <span data-xh-part="root">
          <img data-xh-part="image">
          <span data-xh-part="fallback">失败</span>
        </span>
      </xh-avatar>
      <xh-avatar>
        <span data-xh-part="root">
          <img data-xh-part="image">
          <span data-xh-part="fallback">无</span>
        </span>
      </xh-avatar>
    </div>
  </section>

  <section>
    <h2>Field</h2>
    <p class="lead">
      标题的 for、控件的 id 与描述链（aria-describedby）自动对齐：点标题聚焦到输入框，
      勾上“标记为无效”后错误文案接入描述链并显出。控件由你自己写，Field 只把属性并上去。
    </p>
    <xh-field id="wc-field" required>
      <!-- root 这层要自己写：data-invalid / data-required / data-disabled 落在它上面。
           label 须是原生 &lt;label&gt;、control 须标在真正的输入控件上：
           for 指向一个不可标注的元素时点标题不聚焦，读屏也念不出控件的名字 -->
      <div data-xh-part="root">
        <label data-xh-part="label">邮箱</label>
        <input data-xh-part="control" type="email" placeholder="you@example.com">
        <p data-xh-part="description">用于接收账单与安全提醒</p>
        <p data-xh-part="error-text">邮箱格式不正确</p>
      </div>
    </xh-field>
    <label class="row">
      <input type="checkbox" id="wc-field-invalid"> 标记为无效
    </label>
  </section>

  <section>
    <h2>NumberField</h2>
    <p class="lead">
      键盘全在输入框上：ArrowUp / ArrowDown 走 step，PageUp / PageDown 走 largeStep，
      Home / End 取端点。加减按钮按住不放会连发；贴住边界时对应按钮自动转灰。
      失焦时把 12.50 收成 12.5、把越界值夹回区间，输入途中不打断。
    </p>
    <xh-number-field id="wc-number" default-value="3" min="0" max="20" step="1" name="qty">
      <div data-xh-part="root">
        <label data-xh-part="label">数量</label>
        <div class="row" style="gap: 4px;">
          <button data-xh-part="decrement-trigger">−</button>
          <input data-xh-part="input" style="inline-size: 80px; text-align: center;">
          <button data-xh-part="increment-trigger">+</button>
        </div>
      </div>
    </xh-number-field>
    <span class="lead" id="wc-number-value">当前值：3</span>
  </section>
</main>
`

document.getElementById('theme')!.addEventListener('click', () => {
  theme.setPreference({ mode: theme.getState().mode === 'light' ? 'dark' : 'light' })
})

// 菜单选中回显
document.getElementById('wc-menu')!.addEventListener('select', (e) => {
  document.getElementById('wc-menu-picked')!.textContent = `最近选中：${(e as CustomEvent<{ value: string }>).detail.value}`
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

// 选中值回显
document.getElementById('wc-select')!.addEventListener('value-change', (e) => {
  const { value } = (e as CustomEvent<{ value: string | null }>).detail
  document.getElementById('wc-select-value')!.textContent = `当前值：${value ?? '（未选）'}`
})

// 数字框值回显
document.getElementById('wc-number')!.addEventListener('value-change', (e) => {
  const { value } = (e as CustomEvent<{ value: string }>).detail
  document.getElementById('wc-number-value')!.textContent = `当前值：${value === '' ? '（空）' : value}`
})

// 无效态开关：改宿主元素的属性，元素自行重接线
document.getElementById('wc-field-invalid')!.addEventListener('change', (e) => {
  document.getElementById('wc-field')!.toggleAttribute('invalid', (e.target as HTMLInputElement).checked)
})

// 取消/确定：复用 close-trigger 关闭对话框
for (const btn of Array.from(document.querySelectorAll('[data-close]'))) {
  btn.addEventListener('click', () => {
    (document.querySelector('xh-dialog [data-xh-part="close-trigger"]') as HTMLElement | null)?.click()
  })
}
