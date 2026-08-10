// 视觉层的 Web Components 示例。单独一个模块，免得 main.ts 那份模板串再长一截。

import type { BackgroundEffect, ParamSpec, ParamValue, ShapeName } from '@xihan-ui/backgrounds'
import type { XhBackgroundElement } from '@xihan-ui/web-components/backgrounds'
import {
  builtinEffects,
  defaultParams,
  imageToCloud,
  SHAPE_NAMES,
  shapeCloud,
  textToCloud,
} from '@xihan-ui/backgrounds'

// 画廊只放自成画面的效果。浏览器每页能同时持有的 WebGL 上下文有上限（各家在 16 上下），
// 超了最早创建的会被丢弃变成白板，所以这页把活画面控制在十几个以内。
// grain 是叠在别的内容之上的透明噪点，particles 要喂点云才有东西，单独一张小卡片都看不出所以然。
const galleryEffects = builtinEffects.filter(e => e.name !== 'grain' && e.name !== 'particles')

/** 这一段的 HTML，拼进 main.ts 的模板串里。 */
export function backgroundMarkup(): string {
  const tiles = galleryEffects.map(effect => `
      <button type="button" class="v-tile" data-effect="${effect.name}" aria-pressed="false">
        <xh-background effect="${effect.name}" quality="eco" class="v-tile-canvas"></xh-background>
        <span class="v-tile-name">${effect.name}</span>
      </button>`).join('')

  const shapes = SHAPE_NAMES.map(name =>
    `<button type="button" class="v-btn" data-shape="${name}">${name}</button>`).join('')

  return `
  <section>
    <h2>Visual · 效果画廊</h2>
    <p class="lead">
      内置十四个效果，这里列出自成画面的十二个（<code>grain</code> 是叠加用的透明噪点，
      <code>particles</code> 要喂点云，见下面两节）。
      <code>&lt;xh-background&gt;</code> 元素自身就是画布的容器：内容照常写在里面，效果铺在内容底下，
      画布是 <code>pointer-events: none</code>，不挡里面的交互。效果名要先注册，
      <code>defineXhBackground()</code> 会把内置的十四个一并注册好。
    </p>
    <div class="v-gallery">${tiles}</div>
  </section>

  <section>
    <h2>Visual · 参数全可调</h2>
    <p class="lead">
      下面这排控件是从效果自带的参数规格推出来的，不是手写的。属性传不了对象，
      所以参数走 <code>.params</code> 这个 property；简单开关则可以直接写属性，比如
      <code>pointer="false"</code>、<code>paused</code>。
    </p>
    <xh-background id="v-stage" effect="fluid" class="v-stage">
      <div class="v-caption"><strong id="v-stage-name">fluid</strong><span id="v-stage-count"></span></div>
    </xh-background>
    <div class="v-controls" id="v-controls"></div>
    <div class="row end"><button type="button" class="v-btn" id="v-reset">恢复默认</button></div>
  </section>

  <section>
    <h2>Visual · 任意图片转粒子</h2>
    <p class="lead">
      图片、文字、参数方程都归一到同一种点云表示，换形态就是换一份点云，中间的形变由引擎补。
      点云是二进制数据，属性传不了，用 <code>el.setCloud(cloud)</code>。
    </p>
    <xh-background id="v-cloud" effect="particles" class="v-stage">
      <div class="v-caption"><strong>当前形态</strong><span id="v-cloud-label">heart</span></div>
    </xh-background>
    <div class="row" style="margin-block-start: 12px;">${shapes}</div>
    <div class="row" style="margin-block-start: 12px;">
      <input id="v-text" class="v-input" value="曦寒" placeholder="输入文字">
      <button type="button" class="v-btn" id="v-text-go">转成粒子</button>
      <label class="v-file">选一张图片<input type="file" id="v-image" accept="image/*"></label>
    </div>
  </section>`
}

/** 生成一个参数控件。 */
function control(key: string, spec: ParamSpec, value: ParamValue): HTMLLabelElement {
  const label = document.createElement('label')
  label.className = 'v-control'

  const name = document.createElement('span')
  name.className = 'v-control-label'
  name.textContent = spec.label
  label.append(name)

  const output = document.createElement('output')
  output.textContent = String(value)

  let input: HTMLInputElement | HTMLSelectElement
  if (spec.kind === 'number') {
    input = document.createElement('input')
    input.type = 'range'
    input.min = String(spec.min)
    input.max = String(spec.max)
    input.step = String(spec.step)
    input.value = String(value)
  }
  else if (spec.kind === 'color') {
    input = document.createElement('input')
    input.type = 'color'
    input.value = String(value)
  }
  else if (spec.kind === 'boolean') {
    input = document.createElement('input')
    input.type = 'checkbox'
    input.checked = value === true
  }
  else {
    input = document.createElement('select')
    for (const option of spec.values) {
      const el = document.createElement('option')
      el.value = option
      el.textContent = option
      input.append(el)
    }
    input.value = String(value)
  }
  input.dataset.key = key
  input.dataset.kind = spec.kind

  label.append(input, output)
  return label
}

/** 从控件读回值，类型按规格还原——range 读出来永远是字符串，直接喂给引擎会被当非法值丢掉。 */
function readValue(input: HTMLInputElement | HTMLSelectElement): ParamValue {
  if (input.dataset.kind === 'number')
    return Number(input.value)
  if (input.dataset.kind === 'boolean')
    return (input as HTMLInputElement).checked
  return input.value
}

export function mountBackgroundDemo(): void {
  const stage = document.getElementById('v-stage') as XhBackgroundElement | null
  const cloudStage = document.getElementById('v-cloud') as XhBackgroundElement | null
  const controls = document.getElementById('v-controls')
  if (!stage || !cloudStage || !controls)
    return

  let selected: BackgroundEffect = builtinEffects[0]!
  let params: Record<string, ParamValue> = defaultParams(selected.params)

  function renderControls(): void {
    controls!.replaceChildren()
    for (const [key, spec] of Object.entries(selected.params))
      controls!.append(control(key, spec, params[key]!))
    document.getElementById('v-stage-name')!.textContent = selected.name
    document.getElementById('v-stage-count')!.textContent
      = `${Object.keys(selected.params).length} 个可调参数`
  }

  function apply(): void {
    stage!.effect = selected.name
    stage!.params = { ...params }
  }

  controls.addEventListener('input', (event) => {
    const input = event.target as HTMLInputElement | HTMLSelectElement
    const key = input.dataset.key
    if (key === undefined)
      return
    params[key] = readValue(input)
    input.parentElement?.querySelector('output')?.replaceChildren(String(params[key]))
    apply()
  })

  document.getElementById('v-reset')?.addEventListener('click', () => {
    params = defaultParams(selected.params)
    renderControls()
    apply()
  })

  for (const tile of document.querySelectorAll<HTMLButtonElement>('.v-tile')) {
    tile.addEventListener('click', () => {
      const found = galleryEffects.find(e => e.name === tile.dataset.effect)
      if (!found)
        return
      selected = found
      params = defaultParams(selected.params)
      for (const other of document.querySelectorAll('.v-tile'))
        other.setAttribute('aria-pressed', String(other === tile))
      renderControls()
      apply()
    })
  }

  renderControls()
  apply()

  // —— 点云 ——

  const label = document.getElementById('v-cloud-label')!
  cloudStage.params = { backgroundOpacity: 0.85, pointSize: 2.4 }
  cloudStage.setCloud(shapeCloud('heart', { count: 12000 }), { duration: 0 })

  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-shape]')) {
    button.addEventListener('click', () => {
      const name = button.dataset.shape as ShapeName
      cloudStage.setCloud(shapeCloud(name, { count: 12000 }))
      label.textContent = name
    })
  }

  const textInput = document.getElementById('v-text') as HTMLInputElement
  function toText(): void {
    if (textInput.value.length === 0)
      return
    cloudStage!.setCloud(textToCloud(textInput.value, { count: 14000, fontSize: 200, color: '#7cc4ff' }))
    label.textContent = `文字「${textInput.value}」`
  }
  document.getElementById('v-text-go')?.addEventListener('click', toText)
  textInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter')
      toText()
  })

  document.getElementById('v-image')?.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file)
      return
    label.textContent = '采样中…'
    void imageToCloud(file, { count: 20000, resolution: 320, depth: 0.25 }).then((cloud) => {
      cloudStage.setCloud(cloud)
      label.textContent = file.name
    })
  })
}
