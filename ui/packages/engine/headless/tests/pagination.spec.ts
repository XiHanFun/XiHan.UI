import type { Service } from '@xihan-ui/core'
import type { PaginationPage } from '../src/pagination'
import type { PaginationSchema } from '../src/pagination/pagination.types'
import type { SelectSchema } from '../src/select'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import {
  buildPageSequence,
  clampPage,
  connectPagination,
  pageRangeOf,
  paginationMachine,
  paginationPageSizeSelectProps,
  totalPagesOf,
} from '../src/pagination'
import { selectMachine } from '../src/select'

// ── 纯函数：页码序列 ────────────────────────────────────────────────

describe('buildPageSequence', () => {
  it('没有页时给空序列，只有一页时就一个 1', () => {
    // 0 页与 1 页都不该产出省略号，更不该出现第 0 页
    expect(buildPageSequence(1, 0, 1)).toEqual([])
    expect(buildPageSequence(3, 0, 1)).toEqual([])
    expect(buildPageSequence(1, 1, 1)).toEqual([1])
  })

  it('总页数装得下时全列出来，一个省略号都没有', () => {
    // siblingCount=1 的容量是 2*1+5 = 7 页
    expect(buildPageSequence(4, 7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(buildPageSequence(1, 2, 1)).toEqual([1, 2])
  })

  it('贴着首页：只出右侧省略号，末页仍在', () => {
    expect(buildPageSequence(1, 20, 1)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20])
    expect(buildPageSequence(3, 20, 1)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20])
  })

  it('贴着末页：只出左侧省略号，首页仍在', () => {
    expect(buildPageSequence(20, 20, 1)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20])
    expect(buildPageSequence(18, 20, 1)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20])
  })

  it('居中：两侧都出省略号，窗口跟着当前页走', () => {
    expect(buildPageSequence(5, 20, 1)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 20])
    expect(buildPageSequence(10, 20, 1)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20])
  })

  it('siblingCount=0：窗口只剩当前页，序列宽度降到 5', () => {
    expect(buildPageSequence(5, 10, 0)).toEqual([1, 'ellipsis', 5, 'ellipsis', 10])
    expect(buildPageSequence(1, 10, 0)).toEqual([1, 2, 3, 'ellipsis', 10])
    expect(buildPageSequence(10, 10, 0)).toEqual([1, 'ellipsis', 8, 9, 10])
    // 容量 5 页，正好装得下就不折叠
    expect(buildPageSequence(3, 5, 0)).toEqual([1, 2, 3, 4, 5])
  })

  it('siblingCount 变大时窗口跟着变宽', () => {
    expect(buildPageSequence(10, 20, 2)).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 20])
  })

  it('只隔一页时显示那一页而不是省略号（同宽，但信息更多）', () => {
    // 左边的空隙只有第 2 页：拿省略号盖住一个页码，点开只多出一页，荒唐
    expect(buildPageSequence(4, 8, 1)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 8])
    // 右边同理：空隙只有第 7 页
    expect(buildPageSequence(5, 8, 1)).toEqual([1, 'ellipsis', 4, 5, 6, 7, 8])
  })

  it('越界与非法的当前页先夹再算，不会产出越界序列', () => {
    expect(buildPageSequence(999, 20, 1)).toEqual(buildPageSequence(20, 20, 1))
    expect(buildPageSequence(-5, 20, 1)).toEqual(buildPageSequence(1, 20, 1))
    expect(buildPageSequence(Number.NaN, 20, 1)).toEqual(buildPageSequence(1, 20, 1))
    expect(buildPageSequence(4.7, 20, 1)).toEqual(buildPageSequence(4, 20, 1))
  })

  it('负的 siblingCount 当 0 处理，不会算出负宽度的窗口', () => {
    expect(buildPageSequence(5, 10, -3)).toEqual(buildPageSequence(5, 10, 0))
  })

  // 下面两条是不变量，逐页扫过去——单点用例挡不住"某一页恰好抖一下"这类回归
  it('需要折叠时序列宽度恒为 siblingCount*2+5（切页时分页器不左右抖动）', () => {
    for (const siblings of [0, 1, 2, 3]) {
      const width = siblings * 2 + 5
      const totalPages = width + 12
      for (let page = 1; page <= totalPages; page++) {
        const seq = buildPageSequence(page, totalPages, siblings)
        expect({ page, siblings, len: seq.length }).toEqual({ page, siblings, len: width })
      }
    }
  })

  it('序列里页码严格递增，且必含首页、末页与当前页', () => {
    for (const totalPages of [1, 5, 8, 9, 20, 57]) {
      for (let page = 1; page <= totalPages; page++) {
        const seq = buildPageSequence(page, totalPages, 1)
        const numbers = seq.filter((p): p is number => typeof p === 'number')
        expect({ page, totalPages, ok: numbers.includes(1) && numbers.includes(totalPages) && numbers.includes(page) })
          .toEqual({ page, totalPages, ok: true })
        const sorted = [...numbers].sort((a, b) => a - b)
        expect({ page, totalPages, numbers }).toEqual({ page, totalPages, numbers: sorted })
        expect(new Set(numbers).size).toBe(numbers.length)
        // 省略号两侧必定隔着至少两页，否则它盖的还不如它自己占的地方多
        seq.forEach((item: PaginationPage, i) => {
          if (item !== 'ellipsis')
            return
          const before = seq[i - 1] as number
          const after = seq[i + 1] as number
          expect({ page, totalPages, gap: after - before > 2 }).toEqual({ page, totalPages, gap: true })
        })
      }
    }
  })
})

// ── 纯函数：总页数与条目区间 ────────────────────────────────────────

describe('totalPagesOf', () => {
  it('向上取整；无数据是 0 页而不是 1 页空页', () => {
    expect(totalPagesOf(100, 10)).toBe(10)
    expect(totalPagesOf(101, 10)).toBe(11)
    expect(totalPagesOf(0, 10)).toBe(0)
    expect(totalPagesOf(undefined, 10)).toBe(0)
  })

  it('每页 0 条不做除零：按每页 1 条算', () => {
    expect(totalPagesOf(7, 0)).toBe(7)
    expect(totalPagesOf(7, -5)).toBe(7)
    expect(totalPagesOf(7, Number.NaN)).toBe(7)
  })
})

describe('pageRangeOf', () => {
  it('1 基闭区间，末页按实际条数收口', () => {
    expect(pageRangeOf(1, 10, 95)).toEqual({ start: 1, end: 10 })
    expect(pageRangeOf(3, 10, 95)).toEqual({ start: 21, end: 30 })
    // 末页只有 5 条：end 给 95 而不是 100，否则显示出并不存在的条目号
    expect(pageRangeOf(10, 10, 95)).toEqual({ start: 91, end: 95 })
  })

  it('无数据时两端都是 0', () => {
    expect(pageRangeOf(1, 10, 0)).toEqual({ start: 0, end: 0 })
  })

  it('越界页码先夹回来', () => {
    expect(pageRangeOf(99, 10, 95)).toEqual({ start: 91, end: 95 })
    expect(pageRangeOf(0, 10, 95)).toEqual({ start: 1, end: 10 })
  })
})

describe('clampPage', () => {
  it('下界恒为 1；总页数为 0 时上界也取 1', () => {
    expect(clampPage(0, 10)).toBe(1)
    expect(clampPage(11, 10)).toBe(10)
    expect(clampPage(5, 0)).toBe(1)
    expect(clampPage(undefined, 10)).toBe(1)
  })
})

// ── 机器与 connect ──────────────────────────────────────────────────

/**
 * 每台翻页机配一台内嵌下拉：档位受控于翻页机，取一次 api 不该把它重建掉，
 * 故按翻页机记住，而不是在 api() 里现建。
 */
const embeddedSelect = new WeakMap<object, Service<SelectSchema>>()

function makeService(props: PaginationSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(paginationMachine, { props: () => props, runtime })
  // 顺序要紧：下拉的 props 从翻页机现读，翻页机必须先立起来
  embeddedSelect.set(service, createService(selectMachine, {
    props: () => paginationPageSizeSelectProps(service),
    runtime,
  }))
  runtime.start()
  return service
}

function api(service: ReturnType<typeof makeService>) {
  return connectPagination({ root: service, pageSizeSelect: embeddedSelect.get(service)! }, normalizeProps)
}

type Props = Record<string, unknown>

/** props 可变的服务：受控写回与 count 变化都靠改这个对象。 */
function makeMutableService(initial: PaginationSchema['props'] = {}) {
  const props: PaginationSchema['props'] = { ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(paginationMachine, { props: () => props, runtime })
  embeddedSelect.set(service, createService(selectMachine, {
    props: () => paginationPageSizeSelectProps(service),
    runtime,
  }))
  runtime.start()
  return { service, patch: (next: PaginationSchema['props']) => Object.assign(props, next) }
}

describe('paginationMachine', () => {
  it('默认停在第 1 页，defaultPage 决定初值', () => {
    expect(api(makeService({ count: 100 })).page).toBe(1)
    expect(api(makeService({ count: 100, defaultPage: 4 })).page).toBe(4)
  })

  it('pAGE.NEXT / PAGE.PREV 各走一页，走到端点就停住不回绕', () => {
    const s = makeService({ count: 30, pageSize: 10 })
    s.send({ type: 'PAGE.NEXT' })
    expect(api(s).page).toBe(2)
    s.send({ type: 'PAGE.NEXT' })
    s.send({ type: 'PAGE.NEXT' })
    // 已经在末页：再按也不该绕回第 1 页
    expect(api(s).page).toBe(3)
    s.send({ type: 'PAGE.PREV' })
    expect(api(s).page).toBe(2)
    s.send({ type: 'PAGE.PREV' })
    s.send({ type: 'PAGE.PREV' })
    expect(api(s).page).toBe(1)
  })

  it('pAGE.SET 越界的页码在写入口就夹掉', () => {
    const s = makeService({ count: 30, pageSize: 10 })
    s.send({ type: 'PAGE.SET', page: 99 })
    expect(api(s).page).toBe(3)
    s.send({ type: 'PAGE.SET', page: -1 })
    expect(api(s).page).toBe(1)
  })

  it('onPageChange 带上页码与每页条数，且值没变时不叫', () => {
    const onPageChange = vi.fn()
    const s = makeService({ count: 30, pageSize: 10, onPageChange })
    s.send({ type: 'PAGE.NEXT' })
    expect(onPageChange).toHaveBeenCalledWith({ page: 2, pageSize: 10 })

    onPageChange.mockClear()
    s.send({ type: 'PAGE.SET', page: 2 })
    // 同一页再点一次不该惊动宿主：作者常在回调里发请求，重复回调就是重复请求
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('受控 page：内部不自改，只发回调；宿主写回后跟着走', () => {
    const onPageChange = vi.fn()
    const { service, patch } = makeMutableService({ count: 100, pageSize: 10, page: 2, onPageChange })
    service.send({ type: 'PAGE.NEXT' })
    expect(onPageChange).toHaveBeenCalledWith({ page: 3, pageSize: 10 })
    // 宿主没写回：界面不该自作主张
    expect(api(service).page).toBe(2)

    patch({ page: 3 })
    expect(api(service).page).toBe(3)
  })

  it('count 变小后，上一页从看得见的那一页起算', () => {
    const { service, patch } = makeMutableService({ count: 100, pageSize: 10, defaultPage: 10 })
    expect(api(service).page).toBe(10)
    patch({ count: 25 })
    // 内部值还停在 10，但界面显示的是夹过的第 3 页
    expect(api(service).page).toBe(3)
    service.send({ type: 'PAGE.PREV' })
    // 从 10 往回走会得到 9（再夹成 3），用户点一下看不到任何变化
    expect(api(service).page).toBe(2)
  })
})

describe('connectPagination', () => {
  it('root 是带名字的 nav 地标；dir 未给时不写，免得切断继承', () => {
    const root = api(makeService({ count: 100 })).getRootProps() as Props
    expect(root['data-scope']).toBe('pagination')
    expect(root['data-part']).toBe('root')
    expect(root['aria-label']).toBe('Pagination')
    expect(root.dir).toBeUndefined()
    expect(root['data-empty']).toBeUndefined()

    const rtl = api(makeService({ count: 100, dir: 'rtl' })).getRootProps() as Props
    expect(rtl.dir).toBe('rtl')
  })

  it('translations 覆盖三处读屏文案', () => {
    const a = api(makeService({
      count: 100,
      translations: { root: '分页', prevTrigger: '上一页', nextTrigger: '下一页', item: p => `第 ${p} 页` },
    }))
    expect((a.getRootProps() as Props)['aria-label']).toBe('分页')
    expect((a.getPrevTriggerProps() as Props)['aria-label']).toBe('上一页')
    expect((a.getNextTriggerProps() as Props)['aria-label']).toBe('下一页')
    expect((a.getItemProps({ page: 3 }) as Props)['aria-label']).toBe('第 3 页')
  })

  it('首页时 prev 用原生 disabled，末页时轮到 next', () => {
    const first = api(makeService({ count: 30, pageSize: 10 }))
    expect((first.getPrevTriggerProps() as Props).disabled).toBe(true)
    expect((first.getPrevTriggerProps() as Props)['data-disabled']).toBe('')
    expect((first.getNextTriggerProps() as Props).disabled).toBeUndefined()
    expect(first.previousPage).toBeNull()
    expect(first.nextPage).toBe(2)

    const last = api(makeService({ count: 30, pageSize: 10, defaultPage: 3 }))
    expect((last.getNextTriggerProps() as Props).disabled).toBe(true)
    expect((last.getPrevTriggerProps() as Props).disabled).toBeUndefined()
    expect(last.nextPage).toBeNull()
  })

  it('端点上的点击既不回绕也不惊动宿主：合成事件绕得过原生 disabled', () => {
    // 原生 disabled 只挡真实点击；作者把 props 摊在 <a> 上、或代码里直接派发合成 click 时，
    // 这条路是真会走到的——边界由机器的夹取守住，值没变 cell 也不会发回调
    const onPageChange = vi.fn()
    const s = makeService({ count: 30, pageSize: 10, onPageChange })
    const click = (props: Props): void => (props.onClick as () => void)()

    click(api(s).getPrevTriggerProps() as Props)
    expect(api(s).page).toBe(1)

    s.send({ type: 'PAGE.SET', page: 3 })
    onPageChange.mockClear()
    click(api(s).getNextTriggerProps() as Props)
    expect(api(s).page).toBe(3)
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('无数据时两端都禁用，且没有页码自称当前项', () => {
    const a = api(makeService({ count: 0 }))
    expect(a.totalPages).toBe(0)
    expect(a.pages).toEqual([])
    expect(a.pageRange).toEqual({ start: 0, end: 0 })
    expect((a.getPrevTriggerProps() as Props).disabled).toBe(true)
    expect((a.getNextTriggerProps() as Props).disabled).toBe(true)
    // page 兜底读数是 1，但一页都没有，第 1 页并不存在
    expect(a.page).toBe(1)
    expect((a.getItemProps({ page: 1 }) as Props)['aria-current']).toBeUndefined()
  })

  it('当前页 item 出 aria-current=page 与 data-current，其余两者都不写', () => {
    const s = makeService({ count: 100, pageSize: 10, defaultPage: 3 })
    const current = api(s).getItemProps({ page: 3 }) as Props
    const other = api(s).getItemProps({ page: 4 }) as Props
    expect(current['aria-current']).toBe('page')
    expect(current['data-current']).toBe('')
    expect(current['data-value']).toBe(3)
    expect(current.type).toBe('button')
    // 分页不做 roving tabindex：每个页码各占一个 Tab 位
    expect(current.tabindex).toBeUndefined()
    expect(other['aria-current']).toBeUndefined()
    expect(other['data-current']).toBeUndefined()
  })

  it('点页码即跳页，越界的页码同样夹回来', () => {
    const s = makeService({ count: 100, pageSize: 10 })
    ;((api(s).getItemProps({ page: 4 }) as Props).onClick as () => void)()
    expect(api(s).page).toBe(4)
    ;((api(s).getItemProps({ page: 99 }) as Props).onClick as () => void)()
    expect(api(s).page).toBe(10)
  })

  it('省略位是可展开的按钮，不再对读屏隐藏', () => {
    // 折进去那几页除了它没有别的入口，藏起来等于把它们从读屏用户那里删掉
    const el = api(makeService({ count: 2000, defaultPage: 100 })).getEllipsisTriggerProps({ side: 'end' }) as Props
    expect(el['data-part']).toBe('ellipsis-trigger')
    expect(el['aria-hidden']).toBeUndefined()
    expect(el.type).toBe('button')
    expect(el['aria-expanded']).toBe('false')
    expect(el['aria-haspopup']).toBe('true')
    expect(el['data-side']).toBe('end')
  })

  it('pageItems 带出被折叠的是哪几页，两侧各一段', () => {
    // 200 页停在第 100 页：首页与窗口之间折一段，窗口与末页之间折一段
    const items = api(makeService({ count: 2000, pageSize: 10, defaultPage: 100 })).pageItems
    const gaps = items.filter(item => item.type === 'ellipsis')
    expect(gaps.map(g => g.type === 'ellipsis' ? g.side : null)).toEqual(['start', 'end'])

    const head = gaps[0]
    const tail = gaps[1]
    if (head?.type !== 'ellipsis' || tail?.type !== 'ellipsis')
      throw new Error('省略位形状不对')
    // 首页与末页本身留在序列里，折的是它们与窗口之间那段
    expect(head.pages[0]).toBe(2)
    expect(head.pages.at(-1)).toBe(98)
    expect(tail.pages[0]).toBe(102)
    expect(tail.pages.at(-1)).toBe(199)
  })

  it('pages 与 pageItems 同源：两串逐项对得上', () => {
    // 各算一遍必然漂移，pages 由 pageItems 派生
    for (const page of [1, 5, 100, 199, 200]) {
      const svc = makeService({ count: 2000, pageSize: 10, defaultPage: page })
      const a = api(svc)
      expect(a.pages).toEqual(
        a.pageItems.map(item => (item.type === 'page' ? item.value : 'ellipsis')),
      )
    }
  })

  it('装得下就不折：没有省略位时 pageItems 全是页码', () => {
    const items = api(makeService({ count: 30, pageSize: 10 })).pageItems
    expect(items.every(item => item.type === 'page')).toBe(true)
    expect(items).toHaveLength(3)
  })

  it('pageRange 与 slice 走同一份页码，末页不满时按实际条数收口', () => {
    const s = makeService({ count: 95, pageSize: 10, defaultPage: 10 })
    expect(api(s).pageRange).toEqual({ start: 91, end: 95 })
    const data = Array.from({ length: 95 }, (_, i) => i + 1)
    expect(api(s).slice(data)).toEqual([91, 92, 93, 94, 95])
  })

  it('pages 跟着当前页与 siblingCount 走', () => {
    const s = makeService({ count: 200, pageSize: 10, defaultPage: 10, siblingCount: 1 })
    expect(api(s).pages).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20])
    const wide = makeService({ count: 200, pageSize: 10, defaultPage: 10, siblingCount: 2 })
    expect(api(wide).pages).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 20])
  })

  it('每页条数小于 1 时按 1 处理，不产出无穷页', () => {
    const a = api(makeService({ count: 3, pageSize: 0 }))
    expect(a.pageSize).toBe(1)
    expect(a.totalPages).toBe(3)
  })
})

describe('内嵌的每页条数下拉', () => {
  it('挂载点是普通元素，不再是原生 select', () => {
    const mount = api(makeService({ count: 196 })).getPageSizeSelectProps() as Props
    expect(mount['data-scope']).toBe('pagination')
    expect(mount['data-part']).toBe('page-size-select')
    // 值与 change 都归内嵌下拉，挂载点不再自己收
    expect(mount.value).toBeUndefined()
    expect(mount.onChange).toBeUndefined()
  })

  it('角色节点带的是 select 的 scope：吃的是那份皮肤', () => {
    const select = api(makeService({ count: 196 })).pageSizeSelect
    for (const props of [select.getRootProps(), select.getTriggerProps(), select.getListProps()] as Props[])
      expect(props['data-scope']).toBe('select')
  })

  it('档位表变成下拉的 collection，档位文字取 translations.pageSizeOption', () => {
    const select = api(makeService({
      count: 196,
      pageSizeOptions: [50, 10, 10, 20],
      translations: { pageSizeOption: size => `${size} 条 / 页` },
    })).pageSizeSelect
    // 升序去重照旧在档位表这一层做掉
    expect(select.collection.map(node => node.value)).toEqual(['10', '20', '50'])
    expect(select.collection.map(node => node.label)).toEqual(['10 条 / 页', '20 条 / 页', '50 条 / 页'])
  })

  it('当前档位就是下拉的选中值', () => {
    const select = api(makeService({ count: 196, defaultPageSize: 20 })).pageSizeSelect
    expect(select.value).toEqual(['20'])
    expect(select.displayText).toBe('20 / page')
  })

  it('挑一档即换档，页码跟着换算', () => {
    // 10 条一页的第 5 页 = 第 41 条起；换成 50 条一页后第 41 条落在第 1 页
    const s = makeService({ count: 196, defaultPageSize: 10, defaultPage: 5 })
    api(s).pageSizeSelect.setValue('50')
    expect(api(s).pageSize).toBe(50)
    expect(api(s).page).toBe(1)
  })

  it('名字由 aria-label 直给，不指向当前值', () => {
    // 下拉自己把名字指给「标签 + 当前值」两个节点，而分页行里不摆可见标签，
    // 只剩当前值那一段——那是值不是名字
    const select = api(makeService({ count: 196, translations: { pageSizeSelect: '每页条数' } })).pageSizeSelect
    const trigger = select.getTriggerProps() as Props
    const list = select.getListProps() as Props
    expect(trigger['aria-label']).toBe('每页条数')
    expect(trigger['aria-labelledby']).toBeUndefined()
    expect(list['aria-label']).toBe('每页条数')
    expect(list['aria-labelledby']).toBeUndefined()
  })

  it('键盘那一套原样保留：触发器是 combobox，条目是 option', () => {
    const select = api(makeService({ count: 196 })).pageSizeSelect
    const trigger = select.getTriggerProps() as Props
    expect(trigger.role).toBe('combobox')
    expect(trigger['aria-haspopup']).toBe('listbox')
    expect(typeof trigger.onKeydown).toBe('function')
    expect((select.getListProps() as Props).role).toBe('listbox')
    expect((select.getItemProps({ value: '10' }) as Props).role).toBe('option')
  })

  it('清空不改档位：分页没有「不分页」这一档', () => {
    const s = makeService({ count: 196, defaultPageSize: 20 })
    api(s).pageSizeSelect.clear()
    expect(api(s).pageSize).toBe(20)
    expect(api(s).pageSizeSelect.value).toEqual(['20'])
  })

  it('三个视觉轴与方向一并透传，下拉与页码格子同一档', () => {
    const select = api(makeService({ count: 196, tone: 'success', size: 'sm', dir: 'rtl' })).pageSizeSelect
    const root = select.getRootProps() as Props
    expect(root['data-tone']).toBe('success')
    expect(root['data-size']).toBe('sm')
    expect((select.getPositionerProps() as Props).dir).toBe('rtl')
  })
})
