// 八件组件 × 五个视觉组合 = 40 张像素基线。
//
// 只有真实浏览器出得来位图：jsdom 不排版也不栅格化，截图断言在那里无从谈起。
//
// 基线是位图，跨平台不可移植——字体、字形栅格化与子像素抹平在 Windows 与 Linux 上不是一回事。
// vitest 的默认落点自带平台后缀（`__screenshots__/<spec 文件名>/<名字>-chromium-<平台>.png`），
// 所以两个平台的文件不会互相覆盖；CI 的 browser 任务跑在 Linux 上，只认 linux 那一份。
// 生成与校验都走 `pnpm visual:baseline`，它在与 CI 同版本的 Playwright 镜像里跑本文件。
//
// 像素断言的全部价值在确定性：只要有一处画面随运行而变，用例就会随机判红，
// 接着容差被一路调大，直到基线什么也守不住。下面每一处等待与写死都是为了消掉一个变量，
// 各自在注释里写明消的是哪一个。
import type { App, VNode } from 'vue'
import { page, userEvent } from '@vitest/browser/context'
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhButton,
  XhButtonLabel,
  XhButtonPrefix,
  XhDialogContent,
  XhDialogDescription,
  XhDialogRoot,
  XhDialogTitle,
  XhDialogTrigger,
  XhDrawerContent,
  XhDrawerDescription,
  XhDrawerRoot,
  XhDrawerTitle,
  XhDrawerTrigger,
  XhMenuRoot,
  XhPopoverArrow,
  XhPopoverCloseTrigger,
  XhPopoverContent,
  XhPopoverDescription,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTitle,
  XhPopoverTrigger,
  XhSelectRoot,
  XhTextFieldControl,
  XhTextFieldInput,
  XhTextFieldLabel,
  XhTextFieldRoot,
  XhToastCloseTrigger,
  XhToastRoot,
  XhToastTitle,
} from '../../src'
// 令牌与皮肤一起加载：画面就是它们两层算出来的
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/**
 * 画面里唯一允许出现的字体。
 *
 * 全库皮肤里的字体族写的是 `inherit`，最终取的是环境默认 sans，
 * 而各环境的默认 sans 并不相同（Playwright 官方镜像裸装时解析成 WenQuanYi Zen Hei）。
 * 不写死就等于把「今天这台机器装了什么字体」烘进 40 张位图。
 * 装法：容器与 CI 都要有 fonts-dejavu-core。
 */
const BASELINE_FONT = 'DejaVu Sans'

/**
 * 视口尺寸写死，画面尺寸才写死。
 *
 * 宽度要容得下贴右边的抽屉（20rem = 320px）与对话框，
 * 高度要让展开的下拉与菜单整块落在视口内、不触发翻边。
 */
const VIEWPORT = { width: 800, height: 520 }

/**
 * 整屏舞台的 id：它就是每张基线的取景框。
 *
 * 取景取整屏而不是单个部件，三条理由：
 * 一是浮层被 portal 搬走了，触发器与浮层不在同一棵子树里，只有整屏能把两者的相对关系
 * （落位、偏移、箭头指向、遮罩、抽屉与对话框的层序）一起收进画面；
 * 二是画面尺寸恒等于视口，比对不会因为元素尺寸变了而退化成一句「尺寸对不上」，
 * 那种失败会把真正的差异盖住；
 * 三是密度换档会改控件高度，量取景框的元素本身尺寸就变，两格之间没法看同一块地方。
 */
const STAGE_ID = 'xh-visual-stage'

/** 舞台里那一列内容的 id。 */
const SLOT_ID = 'xh-visual-slot'

/** 单件浮层单元的 portal 落点 id，与 core 的常量一致。 */
const PORTAL_ROOT_ID = 'xh-portal-root'

/** 等画面静止的上限；超时说明有东西一直在动，那种情况本就不该出基线。 */
const STABLE_TIMEOUT = 15_000

/** 等动画跑完的上限。进场动画是几百毫秒量级，留出一个数量级的余量。 */
const ANIMATION_BUDGET = 5000

/**
 * 五个视觉组合。轴打在文档根上，不打在舞台上——浮层被 portal 搬到 body 末尾，
 * 只有文档根是它与页内内容共同的祖先，轴打在舞台上浮层就吃不到。
 *
 * 前四格是主题 × 密度的笛卡尔积；第五格是深色叠高对比，取值块的书写顺序在这一格上最脆。
 * 动效轴不入像素基线：静止帧与默认档没有差别，那一轴由令牌快照与 check-infinite-motion 承担。
 */
interface Axes {
  theme: 'light' | 'dark'
  density: 'comfortable' | 'compact'
  contrast?: 'more'
}

const COMBOS: Record<string, Axes> = {
  'light-comfortable': { theme: 'light', density: 'comfortable' },
  'dark-comfortable': { theme: 'dark', density: 'comfortable' },
  'light-compact': { theme: 'light', density: 'compact' },
  'dark-compact': { theme: 'dark', density: 'compact' },
  // 高对比档只改七支 --xh-border-*，所以只有消费边框令牌的组件会跟着变。
  // dialog 与 toast 的面板不接这几支（前者面板压根没声明 border，后者的边走语气层），
  // 这两件的 dark-more 与 dark-comfortable 因此逐字节相同——是库的真实行为，不是轴没施加上。
  // 哪天给这两件的面板接上边框令牌，这两张会跟着分开，那时再看差异即可。
  'dark-more': { theme: 'dark', density: 'comfortable', contrast: 'more' },
}

/**
 * 一枚内联矢量。
 *
 * 不用字符字形（✓ 之类）：那要多依赖一份字体，而 DejaVu Sans 并不覆盖所有符号区，
 * 缺字时浏览器会静默换字体，画面就跟着环境变。路径写死在这里，栅格化只受设备像素比影响。
 */
function glyph(): VNode {
  return h('svg', {
    'width': '16',
    'height': '16',
    'viewBox': '0 0 16 16',
    'aria-hidden': 'true',
    'focusable': 'false',
  }, [
    h('path', {
      'd': 'M2.5 8.5 L6.5 12.5 L13.5 3.5',
      'fill': 'none',
      'stroke': 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    }),
  ])
}

/**
 * 画面里的文字一律 ASCII。
 *
 * DejaVu Sans 没有汉字，写中文就会回落到环境里的某一款 CJK 字体，
 * 于是又多出一个跨环境变量。可及名（aria-label）不进画面，不受这条约束。
 */
const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

const ACTIONS = [
  { value: 'copy', label: 'Copy' },
  { value: 'paste', label: 'Paste' },
  { value: 'delete', label: 'Delete', disabled: true, separatorBefore: true },
]

/**
 * 每件渲染成能认出它形态的最小内容：按钮带文字与图标，输入框带标签与占位，
 * 选择器展开露出条目，浮层展开露出标题、正文与关闭钮。空壳的基线守不住任何东西。
 *
 * 浮层一律用受控 open 直接挂成展开态，不点触发器：点击要走真实指针，
 * 而指针位置本身就是一个变量（悬停档会跟着变）。
 */
const FIXTURES: Record<string, () => VNode[]> = {
  'button': () => [
    h('div', { style: 'display:flex;align-items:center;gap:8px' }, [
      h(XhButton, { variant: 'solid' }, () => [
        h(XhButtonPrefix, null, () => [glyph()]),
        h(XhButtonLabel, null, () => 'Publish'),
      ]),
      h(XhButton, { variant: 'outline' }, () => [h(XhButtonLabel, null, () => 'Cancel')]),
      h(XhButton, { 'variant': 'ghost', 'iconOnly': true, 'aria-label': 'Confirm' }, () => [glyph()]),
    ]),
  ],

  'text-field': () => [
    h(XhTextFieldRoot, { placeholder: 'Enter a nickname' }, () => [
      h(XhTextFieldLabel, null, () => 'Nickname'),
      h(XhTextFieldControl, null, () => [h(XhTextFieldInput)]),
    ]),
    h(XhTextFieldRoot, { value: 'XiHan' }, () => [
      h(XhTextFieldLabel, null, () => 'Display name'),
      h(XhTextFieldControl, null, () => [h(XhTextFieldInput)]),
    ]),
  ],

  'select': () => [
    h(XhSelectRoot, {
      collection: FRUITS,
      label: 'Fruit',
      placeholder: 'Pick one',
      value: ['banana'],
      open: true,
    }),
  ],

  'menu': () => [
    h(XhMenuRoot, { collection: ACTIONS, open: true, triggerAsChild: true }, { trigger: () => [h(XhButton, null, () => 'Actions')] }),
  ],

  'popover': () => [
    h(XhPopoverRoot, { open: true, placement: 'bottom-start', translations: { close: 'Close' } }, () => [
      h(XhPopoverTrigger, { asChild: true }, () => h(XhButton, null, () => 'Subscription')),
      h(XhPopoverPositioner, null, () => [
        h(XhPopoverContent, null, () => [
          h(XhPopoverTitle, null, () => 'Subscription'),
          h(XhPopoverDescription, null, () => 'Weekly digest, delivered every Monday.'),
          h(XhPopoverCloseTrigger),
          h(XhPopoverArrow),
        ]),
      ]),
    ]),
  ],

  'dialog': () => [
    h(XhDialogRoot, { open: true, translations: { close: 'Close' } }, () => [
      h(XhDialogTrigger, { asChild: true }, () => h(XhButton, null, () => 'Open dialog')),
      h(XhDialogContent, null, () => [
        h(XhDialogTitle, null, () => 'Confirm publish'),
        h(XhDialogDescription, null, () => 'Once published this page is visible to everyone.'),
      ]),
    ]),
  ],

  'drawer': () => [
    h(XhDrawerRoot, { open: true, translations: { close: 'Close' } }, () => [
      h(XhDrawerTrigger, { asChild: true }, () => h(XhButton, null, () => 'Open drawer')),
      h(XhDrawerContent, null, () => [
        h(XhDrawerTitle, null, () => 'Filters'),
        h(XhDrawerDescription, null, () => 'The panel sticks to the inline end of the viewport.'),
      ]),
    ]),
  ],

  // duration 给 0 即不起计时器。留着默认时长的话，条子会在某一帧自己退场，
  // 截图究竟拍在哪一帧就成了赛跑
  'toast': () => [
    h(XhToastRoot, {
      title: 'Draft saved',
      duration: 0,
      closable: true,
      translations: { close: 'Close' },
    }, () => [
      h(XhToastTitle),
      h(XhToastCloseTrigger),
    ]),
  ],
}

let app: App | null = null
let stage: HTMLElement | null = null

/**
 * 探一个字体族在不在。
 *
 * 不用 `document.fonts.check()`：它答的是「这串文字能不能被渲染出来」，
 * 系统字体缺席时照样返回 true，探不出静默回退。
 * 改成量宽：同一串探针文字，先用某个通用族排一遍，再用「目标族 + 同一个通用族」排一遍。
 * 目标族解析得到就会顶替通用族，两次宽度必然不同；解析不到就退回通用族，两次一模一样。
 * 三个通用族只要有一个测出差异即算装上——目标族恰好等于其中一个通用族的解析结果时，
 * 那一对会同宽，另外两对仍会分开。
 */
function textWidth(family: string): number {
  const probe = document.createElement('span')
  probe.textContent = 'mmmmmmmmmmwwwwwwwwwwiiiiiiiiii'
  probe.style.cssText = `position:absolute;left:-9999px;top:-9999px;white-space:nowrap;font-size:72px;font-family:${family}`
  document.body.append(probe)
  const width = probe.getBoundingClientRect().width
  probe.remove()
  return width
}

function assertBaselineFontInstalled(): void {
  const generics = ['monospace', 'serif', 'sans-serif']
  const resolved = generics.some(generic => textWidth(generic) !== textWidth(`'${BASELINE_FONT}',${generic}`))
  if (!resolved) {
    throw new Error(
      [
        `基线字体「${BASELINE_FONT}」没装上，画面会静默换成环境默认字体、40 张基线整体作废。`,
        'Windows / macOS 宿主直接跑 pnpm test:browser 时这一条必红，是预期结果：',
        '基线是 Linux 位图，宿主上装字体也比不出有意义的结果。本地要验皮肤的像素影响走容器：',
        '  pnpm visual:baseline            校验',
        '  pnpm visual:baseline --update   重出基线',
        'Linux 环境（容器内 / CI）里装法：apt-get install -y fonts-dejavu-core && fc-cache -f。',
        'CI 上装它的是 .github/workflows/ci.yml 的 browser job 里那步 Install baseline font (DejaVu)。',
        '详见 docs/guide/testing.md 的「像素基线」。',
      ].join('\n'),
    )
  }
}

/**
 * 铺舞台：一整面视口的取景框，加一列固定宽度的内容槽。
 *
 * 字体、插入符与三条轴都打在文档根上而不是舞台上：浮层被 portal 搬到 body 末尾，
 * 舞台上的声明继承不过去。
 *
 * 插入符置透明是为输入框准备的——聚焦时它按秒闪，两次截图必然不同。
 * 本文件不主动聚焦输入框，但对话框与抽屉展开时会自动落焦，落到哪个节点由组件决定，
 * 与其逐件盯着，不如把这条通道整个关掉。
 */
function installStage(): void {
  const style = document.createElement('style')
  style.id = 'xh-visual-baseline-style'
  style.textContent = `
    :root {
      /* rem 的基准写死：1rem = 16px 是默认值，但那是「默认」不是「保证」 */
      font-size: 16px;
      font-family: '${BASELINE_FONT}';
      caret-color: transparent;
    }

    html, body {
      margin: 0;
      padding: 0;
      /* 滚动条会进画面（原生条与自绘条都会），舞台本就等于视口，不该有可滚区 */
      overflow: hidden;
    }

    #${STAGE_ID} {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--xh-bg-canvas);
      color: var(--xh-fg-default);
    }

    #${SLOT_ID} {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      inline-size: 360px;
    }
  `
  document.head.append(style)
}

function applyAxes(axes: Axes): void {
  const root = document.documentElement
  root.dataset.theme = axes.theme
  root.dataset.density = axes.density
  if (axes.contrast)
    root.dataset.contrast = axes.contrast
  else
    delete root.dataset.contrast
}

function clearAxes(): void {
  const root = document.documentElement
  delete root.dataset.theme
  delete root.dataset.density
  delete root.dataset.contrast
}

function raf(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

/**
 * 等浮层落位。
 *
 * 定位层默认藏着（reset 里 visibility: hidden），连接层算出坐标后才打 data-positioned。
 * 不等它就会拍到一张空画面，而「空」在两次运行里是稳定的，比对不会报错——
 * 于是这一格的基线从此什么也守不住。
 */
async function waitForPositioned(): Promise<void> {
  for (let round = 0; round < 60; round++) {
    const positioners = [...document.querySelectorAll('[data-part=\'positioner\']')]
    if (positioners.every(el => el.hasAttribute('data-positioned')))
      return
    await raf()
  }
  throw new Error('浮层的定位层始终没打上 data-positioned，画面里不会有浮层')
}

/**
 * 等动画跑完。
 *
 * 八件的皮肤都带进场动画（xh-dialog-in / xh-drawer-in-* / xh-toast-in / xh-overlay-pop-in / xh-fade-in）。
 * 不能用 data-motion='reduce' 绕开：那会换掉一整块令牌取值，截出来的就不是默认档的样子了。
 *
 * 逐条等 finished，等完再看一拍有没有新动画起来——落位与重排会引出第二批。
 * 无限次动画等不到 finished，遇上就当场判红：它意味着这一格根本没有静止帧。
 */
async function waitForAnimationsDone(): Promise<void> {
  const deadline = performance.now() + ANIMATION_BUDGET
  for (;;) {
    const running = document.getAnimations().filter(anim => anim.playState === 'running')
    if (running.length === 0) {
      await raf()
      if (document.getAnimations().every(anim => anim.playState !== 'running'))
        return
      continue
    }
    const endless = running.filter(anim => anim.effect?.getComputedTiming().iterations === Number.POSITIVE_INFINITY)
    if (endless.length > 0)
      throw new Error('画面里有无限次动画，没有静止帧可截；夹具不该渲染载入态一类的形态')
    await Promise.all(running.map(anim => anim.finished.then(() => {}, () => {})))
    if (performance.now() > deadline)
      throw new Error('动画超过预算仍未跑完，画面静不下来')
  }
}

async function mount(component: string, axes: Axes): Promise<HTMLElement> {
  applyAxes(axes)
  stage = document.createElement('div')
  stage.id = STAGE_ID
  const slot = document.createElement('div')
  slot.id = SLOT_ID
  stage.append(slot)
  document.body.append(stage)

  const fixture = FIXTURES[component]
  if (!fixture)
    throw new Error(`没有登记 ${component} 的夹具`)
  app = createApp({ setup: () => () => fixture() })
  app.mount(slot)

  await nextTick()
  await nextTick()
  // 字体晚到会让文字重排一次。排在落位之前等：浮层坐标是按内容尺寸算的，
  // 先落位再重排，坐标就是按旧字体量出来的那一份
  await document.fonts.ready
  await nextTick()
  await waitForPositioned()
  await waitForAnimationsDone()
  return stage
}

beforeAll(async () => {
  installStage()
  assertBaselineFontInstalled()
  await page.viewport(VIEWPORT.width, VIEWPORT.height)
  // 视口一改，setup.ts 停在旧视口角上的真实指针就可能落进舞台里，把某个部件推进悬停档。
  // 停靠块是 fixed 贴右下角的，改完视口再停一次即可跟到新角上。
  const park = document.querySelector<HTMLElement>('[data-test-park-pointer]')
  if (park)
    await userEvent.hover(park)
})

afterEach(() => {
  app?.unmount()
  app = null
  stage?.remove()
  stage = null
  // portal 落点是全文档共用的一个节点，不清空的话上一格的浮层会留在下一格的画面里
  document.getElementById(PORTAL_ROOT_ID)?.replaceChildren()
  clearAxes()
})

describe('像素基线', () => {
  for (const component of Object.keys(FIXTURES)) {
    for (const [combo, axes] of Object.entries(COMBOS)) {
      // 用例名就是基线文件名的主干：`__screenshots__/visual-baseline.spec.ts/<用例名>-chromium-<平台>.png`
      const name = `${component}-${combo}`
      it(name, async () => {
        const target = await mount(component, axes)
        // 截图前 Playwright 自己也会把有限次动画快进到末帧，而 timeout 内它会连拍到
        // 两张一致为止。两道都是兜底：画面该在 mount() 返回时就已经静止了，
        // 靠兜底等于把「哪一帧」交给运气
        //
        // 用 expect 而不是 expect.element：后者是可重试断言。传进去的是一个现成的
        // HTMLElement，取值函数会直接把它原样返回、走不到内部那条「截图断言只判一次」
        // 的分支，于是比对不上就一路重试到超时——报的是「用例超时」，既不给失配像素数
        // 也不给 reference / actual / diff 三条路径；更糟的是基线缺失时第一次尝试会
        // 顺手写出一张，第二次尝试读到它就判通过，「基线忘了提交」因此是绿的。
        await expect(target).toMatchScreenshot(name, {
          comparatorName: 'pixelmatch',
          comparatorOptions: {
            // 零容差：抗锯齿像素也算数（includeAA），逐像素色差也不给额度（threshold）。
            // 真到了消不掉的抖动那一步，先退到比对器自己的缺省档（threshold 0.1、includeAA 关），
            // 还不够再按容器里实测的失配像素数换算 allowedMismatchedPixelRatio，
            // 并把那个数是怎么量出来的写在这里——不要拍一个宽容差了事。
            threshold: 0,
            includeAA: true,
          },
          timeout: STABLE_TIMEOUT,
        })
      })
    }
  }
})
