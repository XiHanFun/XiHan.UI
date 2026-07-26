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
</main>
`

document.getElementById('theme')!.addEventListener('click', () => {
  theme.setPreference({ mode: theme.getState().mode === 'light' ? 'dark' : 'light' })
})

// 取消/确定：复用 close-trigger 关闭对话框
for (const btn of Array.from(document.querySelectorAll('[data-close]'))) {
  btn.addEventListener('click', () => {
    (document.querySelector('xh-dialog [data-xh-part="close-trigger"]') as HTMLElement | null)?.click()
  })
}
