import type { Placement, PositionEnginePort } from '@xihan-ui/kernel'
import type { TestHooks } from '../conformance/types'
import {
  attachProbe,
  createStage,
  expectAtLeast,
  expectClose,
  expectPlacedAt,
  expectSame,
  nextFrame,
  viewportCenter,
} from './scene'

/**
 * 定位引擎的浏览器态契约。
 * 判据只认屏幕上的最终位置，因此换一个引擎实现照跑不误。
 */

const SIDES = ['top', 'right', 'bottom', 'left'] as const
const ALIGNS = ['start', 'center', 'end'] as const

/** 十二种 placement 的完整枚举，center 用无后缀写法。 */
const PLACEMENTS: Placement[] = SIDES.flatMap(side =>
  ALIGNS.map(align => (align === 'center' ? side : `${side}-${align}`) as Placement),
)

const OFFSET = 8

export function runPositionEngine(engine: PositionEnginePort, hooks: TestHooks, engineName: string): void {
  hooks.describe(`定位引擎：基本贴合（${engineName}）`, () => {
    for (const placement of PLACEMENTS) {
      hooks.it(`${placement}：贴在对应边，间距等于 offset，交叉轴对齐`, async () => {
        const stage = createStage()
        try {
          const center = viewportCenter()
          const anchor = stage.putAnchor(center.x, center.y)
          const floating = stage.putFloating()
          const probe = attachProbe(engine, anchor, floating, { placement, offset: OFFSET })
          await probe.settle()

          expectSame(probe.last().placement, placement, '四周都有空间时不该改 placement')
          expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), placement, OFFSET)
          probe.stop()
        }
        finally {
          stage.cleanup()
        }
      })
    }

    hooks.it('offset 为 0 时紧贴锚点', async () => {
      const stage = createStage()
      try {
        const center = viewportCenter()
        const anchor = stage.putAnchor(center.x, center.y)
        const floating = stage.putFloating()
        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: 0 })
        await probe.settle()

        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom', 0)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })
  })

  hooks.describe(`定位引擎：避让（${engineName}）`, () => {
    hooks.it('主轴空间不够时翻到对侧，并如实回报 placement', async () => {
      const stage = createStage()
      try {
        // 锚点贴着视口顶缘，上方放不下浮层
        const anchor = stage.putAnchor(viewportCenter().x, 0)
        const floating = stage.putFloating(40, 80)
        const probe = attachProbe(engine, anchor, floating, { placement: 'top', offset: OFFSET, flip: true })
        await probe.settle()

        expectSame(probe.last().placement.split('-')[0], 'bottom', '上方放不下时应翻到下方')
        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom', OFFSET)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('关掉 flip 就守着请求的那一侧，宁可溢出视口', async () => {
      const stage = createStage()
      try {
        const anchor = stage.putAnchor(viewportCenter().x, 0)
        const floating = stage.putFloating(40, 80)
        const probe = attachProbe(engine, anchor, floating, { placement: 'top', offset: OFFSET, flip: false, shift: false })
        await probe.settle()

        expectSame(probe.last().placement, 'top', '关掉 flip 后不该改 placement')
        const rect = floating.getBoundingClientRect()
        if (rect.top >= 0)
          throw new Error(`关掉 flip 后浮层本应溢出视口顶缘，实测 top=${rect.top.toFixed(2)}`)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('交叉轴顶到边时沿轴移动，但不改 placement', async () => {
      const stage = createStage()
      try {
        // 锚点贴着左缘，浮层比锚点宽得多，居中对齐会伸到视口外
        const anchor = stage.putAnchor(0, viewportCenter().y, 40, 40)
        const floating = stage.putFloating(200, 24)
        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: OFFSET, shift: true })
        await probe.settle()

        expectSame(probe.last().placement.split('-')[0], 'bottom', '交叉轴避让不该改 placement')
        expectAtLeast(floating.getBoundingClientRect().left, 0, '避让后浮层左缘应留在视口内')
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('关掉 shift 就不避让，浮层照样伸出视口', async () => {
      const stage = createStage()
      try {
        const anchor = stage.putAnchor(0, viewportCenter().y, 40, 40)
        const floating = stage.putFloating(200, 24)
        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: OFFSET, shift: false, flip: false })
        await probe.settle()

        const rect = floating.getBoundingClientRect()
        if (rect.left >= 0)
          throw new Error(`关掉 shift 后浮层本应伸出视口左缘，实测 left=${rect.left.toFixed(2)}`)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })
  })

  hooks.describe(`定位引擎：坐标系（${engineName}）`, () => {
    hooks.it('虚拟锚点只给 x/y/width/height 也贴得准', async () => {
      const stage = createStage()
      try {
        const box = { x: 200, y: 160, width: 2, height: 2 }
        const floating = stage.putFloating()
        const probe = attachProbe(
          engine,
          { getBoundingClientRect: () => box },
          floating,
          { placement: 'bottom-start', offset: OFFSET },
        )
        await probe.settle()

        const rect = floating.getBoundingClientRect()
        expectClose(rect.top, box.y + box.height + OFFSET, '浮层顶缘应贴在虚拟锚点下方')
        expectClose(rect.left, box.x, '浮层左缘应与虚拟锚点齐平')
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('锚点挂在 transform 容器里时仍贴合', async () => {
      const stage = createStage()
      try {
        // transform 会劫持包含块，锚点的视口坐标与它在容器内的偏移不再是一回事
        const warped = document.createElement('div')
        warped.style.cssText = 'position:absolute;left:40px;top:40px;transform:translate(60px, 30px)'
        stage.root.appendChild(warped)
        const anchor = document.createElement('button')
        anchor.type = 'button'
        anchor.style.cssText = 'display:block;width:100px;height:40px;margin:0;padding:0;border:0'
        warped.appendChild(anchor)

        const floating = stage.putFloating(40, 24, document.body)
        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom-start', offset: OFFSET })
        await probe.settle()

        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom-start', OFFSET)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('浮层自己的包含块被 transform 劫持时仍贴合', async () => {
      const stage = createStage()
      try {
        const center = viewportCenter()
        const anchor = stage.putAnchor(center.x, center.y)

        // 浮层落在一个被 transform 劫持的容器里：写进 left/top 的坐标要以这个容器为原点，
        // 直接把锚点的视口坐标写上去会整体偏掉容器的位移
        const warped = document.createElement('div')
        warped.style.cssText = 'position:absolute;left:120px;top:90px;width:0;height:0;transform:translate(70px, 50px)'
        stage.root.appendChild(warped)
        const floating = stage.putFloating(40, 24, warped)

        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom-start', offset: OFFSET })
        await probe.settle()

        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom-start', OFFSET)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('锚点被缩放时贴的是它缩放后的样子', async () => {
      const stage = createStage()
      try {
        const scaled = document.createElement('div')
        scaled.style.cssText = 'position:absolute;left:200px;top:200px;transform:scale(0.5);transform-origin:top left'
        stage.root.appendChild(scaled)
        const anchor = document.createElement('button')
        anchor.type = 'button'
        anchor.style.cssText = 'display:block;width:200px;height:80px;margin:0;padding:0;border:0'
        scaled.appendChild(anchor)

        const floating = stage.putFloating(40, 24, document.body)
        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom-start', offset: OFFSET })
        await probe.settle()

        const rect = anchor.getBoundingClientRect()
        expectClose(rect.width, 100, '缩放后的锚点视觉宽度')
        expectPlacedAt(rect, floating.getBoundingClientRect(), 'bottom-start', OFFSET)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('锚点与浮层同在缩放子树里：贴合关系与间距一起按比例缩', async () => {
      const stage = createStage()
      try {
        // 缩放画布里开浮层：写进 left/top 的是布局像素，看到的是它乘上缩放比之后的样子
        const scale = 0.5
        const scaled = document.createElement('div')
        scaled.style.cssText = `position:absolute;left:120px;top:100px;width:600px;height:400px;transform:scale(${scale});transform-origin:top left`
        stage.root.appendChild(scaled)
        const anchor = document.createElement('button')
        anchor.type = 'button'
        anchor.style.cssText = 'position:absolute;left:200px;top:150px;width:200px;height:80px;margin:0;padding:0;border:0'
        scaled.appendChild(anchor)
        const floating = stage.putFloating(80, 48, scaled)

        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom-start', offset: OFFSET, flip: false, shift: false })
        await probe.settle()

        const floatRect = floating.getBoundingClientRect()
        expectClose(floatRect.width, 80 * scale, '缩放后的浮层视觉宽度')
        // 子树里的 8px 间距，看到的就该是 4px
        expectPlacedAt(anchor.getBoundingClientRect(), floatRect, 'bottom-start', OFFSET * scale)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('浮层落在滚动容器里时按容器原点算，不跟着容器的滚动量漂移', async () => {
      const stage = createStage()
      try {
        const center = viewportCenter()
        const anchor = stage.putAnchor(center.x, center.y)

        const scroller = document.createElement('div')
        scroller.style.cssText = 'position:absolute;left:20px;top:20px;width:200px;height:120px;overflow:auto'
        const content = document.createElement('div')
        content.style.cssText = 'height:800px;position:relative'
        scroller.appendChild(content)
        stage.root.appendChild(scroller)
        scroller.scrollTop = 300
        await nextFrame()

        // 关掉避让：这条考的是坐标换算，开着避让会被容器的裁剪边界拉回去，盖住真正要看的东西
        const floating = stage.putFloating(40, 24, content)
        const probe = attachProbe(engine, anchor, floating, { placement: 'top-end', offset: OFFSET, flip: false, shift: false })
        await probe.settle()

        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'top-end', OFFSET)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('文档滚动之后，挂在 body 上的浮层仍贴合', async () => {
      const filler = document.createElement('div')
      filler.style.cssText = 'height:3000px'
      const anchor = document.createElement('button')
      anchor.type = 'button'
      anchor.style.cssText = 'position:absolute;left:120px;top:1200px;width:100px;height:40px;margin:0;padding:0;border:0'
      const floating = document.createElement('div')
      floating.style.cssText = 'position:absolute;left:0;top:0;width:40px;height:24px'
      document.body.append(filler, anchor, floating)

      try {
        window.scrollTo(0, 900)
        await nextFrame()
        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom-start', offset: OFFSET })
        await probe.settle()

        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom-start', OFFSET)
        probe.stop()
      }
      finally {
        window.scrollTo(0, 0)
        filler.remove()
        anchor.remove()
        floating.remove()
      }
    })
  })

  hooks.describe(`定位引擎：跟随与收尾（${engineName}）`, () => {
    /** 滚动容器场景：锚点在可滚区里，浮层放在外面（与 portal 一致）。 */
    function scrollScene(stage: ReturnType<typeof createStage>): { scroller: HTMLElement, anchor: HTMLElement, floating: HTMLElement } {
      const scroller = document.createElement('div')
      scroller.style.cssText = 'position:absolute;left:40px;top:40px;width:240px;height:160px;overflow:auto'
      const content = document.createElement('div')
      content.style.cssText = 'height:900px;position:relative'
      const anchor = document.createElement('button')
      anchor.type = 'button'
      anchor.style.cssText = 'position:absolute;left:20px;top:300px;width:100px;height:40px;margin:0;padding:0;border:0'
      content.appendChild(anchor)
      scroller.appendChild(content)
      stage.root.appendChild(scroller)
      return { scroller, anchor, floating: stage.putFloating() }
    }

    hooks.it('锚点所在容器滚动时浮层跟着走', async () => {
      const stage = createStage()
      try {
        const { scroller, anchor, floating } = scrollScene(stage)
        scroller.scrollTop = 260
        await nextFrame()

        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom-start', offset: OFFSET, flip: false, shift: false })
        await probe.settle()
        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom-start', OFFSET)

        scroller.scrollTop = 200
        await probe.settle()
        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom-start', OFFSET)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('锚点滚出裁剪容器时报 hidden，滚回来又不报', async () => {
      const stage = createStage()
      try {
        const { scroller, anchor, floating } = scrollScene(stage)
        scroller.scrollTop = 260
        await nextFrame()

        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: OFFSET })
        await probe.settle()
        expectSame(probe.last().hidden, false, '锚点露着时不该报 hidden')

        scroller.scrollTop = 0
        await probe.settle()
        expectSame(probe.last().hidden, true, '锚点滚出裁剪容器后应报 hidden')

        scroller.scrollTop = 260
        await probe.settle()
        expectSame(probe.last().hidden, false, '锚点滚回来后应撤掉 hidden')
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('锚点没改尺寸、只是被上方内容挤走时也跟得上', async () => {
      const stage = createStage()
      try {
        const column = document.createElement('div')
        column.style.cssText = 'position:absolute;left:120px;top:60px;width:240px'
        const spacer = document.createElement('div')
        spacer.style.cssText = 'height:40px'
        const anchor = document.createElement('button')
        anchor.type = 'button'
        anchor.style.cssText = 'display:block;width:100px;height:40px;margin:0;padding:0;border:0'
        column.append(spacer, anchor)
        stage.root.appendChild(column)

        const floating = stage.putFloating()
        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom-start', offset: OFFSET })
        await probe.settle()

        // 锚点自身尺寸一点没变，变的是它在页面上的位置
        spacer.style.height = '260px'
        await probe.settle()
        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom-start', OFFSET)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('锚点尺寸变了会重算', async () => {
      const stage = createStage()
      try {
        const center = viewportCenter()
        const anchor = stage.putAnchor(center.x, center.y)
        const floating = stage.putFloating()
        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: OFFSET })
        await probe.settle()

        anchor.style.height = '120px'
        await probe.settle()
        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom', OFFSET)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('静置时不空转：什么都没变就不该一帧一回调', async () => {
      const stage = createStage()
      try {
        const center = viewportCenter()
        const anchor = stage.putAnchor(center.x, center.y)
        const floating = stage.putFloating()
        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: OFFSET })
        await probe.settle()

        const before = probe.count()
        for (let frame = 0; frame < 30; frame++) await nextFrame()
        const idle = probe.count() - before
        // 落定后允许再补一次，逐帧刷就是跟随观察器自己在打转
        if (idle > 1)
          throw new Error(`静置 30 帧里回调了 ${idle} 次，跟随观察器在空转`)

        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    hooks.it('停止跟随之后不再回调', async () => {
      const stage = createStage()
      try {
        const { scroller, anchor, floating } = scrollScene(stage)
        scroller.scrollTop = 260
        await nextFrame()

        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: OFFSET })
        await probe.settle()
        const before = probe.count()
        probe.stop()

        scroller.scrollTop = 100
        window.dispatchEvent(new Event('resize'))
        for (let frame = 0; frame < 6; frame++) await nextFrame()

        if (probe.count() !== before)
          throw new Error(`停止跟随后又回调了 ${probe.count() - before} 次`)
      }
      finally {
        stage.cleanup()
      }
    })
  })

  hooks.describe(`定位引擎：fixed 坐标系（${engineName}）`, () => {
    // 12 种 placement 在 fixed 下整套重跑。expectPlacedAt 断言的是两个视口矩形，天然跨策略通用。
    for (const placement of PLACEMENTS) {
      hooks.it(`${placement}：fixed 下同样贴合`, async () => {
        const stage = createStage()
        try {
          const center = viewportCenter()
          const anchor = stage.putAnchor(center.x, center.y)
          const floating = stage.putFloating()
          const probe = attachProbe(engine, anchor, floating, { placement, offset: OFFSET, strategy: 'fixed' })
          await probe.settle()

          expectSame(probe.last().placement, placement, '四周都有空间时不该改 placement')
          expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), placement, OFFSET)
          probe.stop()
        }
        finally {
          stage.cleanup()
        }
      })
    }

    // 本特性的正面判据：这一条在 absolute 下必然被裁
    hooks.it('祖先 overflow:hidden 裁不住它，位置照旧贴合', async () => {
      const stage = createStage()
      try {
        const box = document.createElement('div')
        box.style.cssText = 'position:absolute;left:60px;top:60px;width:200px;height:120px;overflow:hidden'
        stage.root.appendChild(box)
        const anchor = stage.putAnchor(20, 40, 100, 40, box)
        const floating = stage.putFloating(40, 24, box)

        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: OFFSET, strategy: 'fixed' })
        await probe.settle()

        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom', OFFSET)
        expectSame(probe.last().placement, 'bottom', '小容器的边界不该逼它翻面')
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    // 裁剪链截断的判据：容器不劫持 fixed 的包含块，它的边界就不该参与避让
    hooks.it('无 transform 的小滚动容器不该逼它翻面', async () => {
      const stage = createStage()
      try {
        const box = document.createElement('div')
        box.style.cssText = 'position:absolute;left:80px;top:80px;width:240px;height:160px;overflow:auto'
        stage.root.appendChild(box)
        const anchor = stage.putAnchor(20, 120, 100, 40, box)
        const floating = stage.putFloating(40, 24, box)

        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: OFFSET, strategy: 'fixed' })
        await probe.settle()

        expectSame(probe.last().placement, 'bottom', 'fixed 不受该容器裁剪，不该因它翻面')
        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom', OFFSET)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    // 与上一条成对：transform 祖先确实劫持 fixed 的包含块，它的裁剪就仍然算数。
    // 只写其中一条会把实现引到「一刀切成视口」的错误极端。
    hooks.it('带 transform 的祖先仍然裁得住它', async () => {
      const stage = createStage()
      try {
        const box = document.createElement('div')
        box.style.cssText = 'position:absolute;left:80px;top:80px;width:240px;height:160px;overflow:hidden;transform:translateX(0px)'
        stage.root.appendChild(box)
        const anchor = stage.putAnchor(20, 120, 100, 40, box)
        const floating = stage.putFloating(40, 24, box)

        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: OFFSET, strategy: 'fixed' })
        await probe.settle()

        expectSame(probe.last().placement, 'top', '被 transform 祖先裁住时，下方放不下就该翻上去')
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    // transform 是 fixed 唯一逃不掉的一类祖先，坐标必须落在它的坐标系里
    hooks.it('transform 祖先位移多少，浮层跟着走多少', async () => {
      const stage = createStage()
      try {
        const box = document.createElement('div')
        box.style.cssText = 'position:absolute;left:40px;top:40px;width:300px;height:200px;transform:translate(30px, 20px)'
        stage.root.appendChild(box)
        const anchor = stage.putAnchor(60, 60, 100, 40, box)
        const floating = stage.putFloating(40, 24, box)

        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: OFFSET, strategy: 'fixed' })
        await probe.settle()

        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom', OFFSET)
        probe.stop()
      }
      finally {
        stage.cleanup()
      }
    })

    // 视口系不许把文档滚动量叠进去。这条同时是 tour 那个偏移 bug 的回归锁。
    hooks.it('页面滚动后仍贴合：视口系不叠 scrollY', async () => {
      const stage = createStage()
      const spacer = document.createElement('div')
      spacer.style.cssText = 'height:3000px'
      document.body.appendChild(spacer)
      try {
        const center = viewportCenter()
        const anchor = stage.putAnchor(center.x, center.y)
        const floating = stage.putFloating()
        const probe = attachProbe(engine, anchor, floating, { placement: 'bottom', offset: OFFSET, strategy: 'fixed' })
        await probe.settle()

        window.scrollTo(0, 900)
        for (let frame = 0; frame < 6; frame++) await nextFrame()
        await probe.settle()

        expectPlacedAt(anchor.getBoundingClientRect(), floating.getBoundingClientRect(), 'bottom', OFFSET)
        probe.stop()
      }
      finally {
        window.scrollTo(0, 0)
        spacer.remove()
        stage.cleanup()
      }
    })
  })
}
