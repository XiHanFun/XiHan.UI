// @vitest-environment jsdom
//
// 导航链接的 asChild：借用作者的路由链接当链接，不再自己渲染 <a>。路由链接自己算出 href、自己拦下点击做
// 客户端跳转，部件属性、按压与聚焦接线要合到它渲出的元素上，且不能用空值盖掉它算出的 href。
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { XhSideNavItem, XhSideNavLink, XhSideNavLinkText, XhSideNavList, XhSideNavRoot } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null
const navigations: string[] = []
// 条目数据不带 href：地址由路由链接自己算
const COLLECTION = [{ value: 'home', label: '首页' }, { value: 'orders', label: '订单' }]

beforeAll(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(async () => {
  await act(async () => root?.unmount())
  host?.remove()
  root = null
  host = null
  navigations.length = 0
})

/** 路由链接的替身：按 to 自己算 href，先跑调用方的 onClick，没被拦下再做客户端跳转。 */
function FakeLink({ to, onClick, ...rest }: ComponentPropsWithRef<'a'> & { to: string }): ReactNode {
  return (
    <a
      {...rest}
      href={`/app${to}`}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented)
          return
        event.preventDefault()
        navigations.push(to)
      }}
    />
  )
}

async function render(node: ReactNode): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => root!.render(node))
  return host
}

describe('side-nav link asChild', () => {
  function SideNav({ asChild, onValueChange }: { asChild: boolean, onValueChange?: (d: { value: string | null }) => void }): ReactNode {
    const link = (value: string, label: string): ReactNode => (
      <XhSideNavItem>
        <XhSideNavLink value={value} asChild={asChild}>
          {asChild
            ? <FakeLink to={`/${value}`}><XhSideNavLinkText>{label}</XhSideNavLinkText></FakeLink>
            : <XhSideNavLinkText>{label}</XhSideNavLinkText>}
        </XhSideNavLink>
      </XhSideNavItem>
    )
    return (
      <XhSideNavRoot collection={COLLECTION} defaultValue="home" onValueChange={onValueChange}>
        <XhSideNavList>
          {link('home', '首页')}
          {link('orders', '订单')}
        </XhSideNavList>
      </XhSideNavRoot>
    )
  }

  it('部件属性落到路由链接渲出的 <a> 上，只有一层 <a>，href 仍是路由算出的', async () => {
    const el = await render(<SideNav asChild />)
    const links = [...el.querySelectorAll<HTMLElement>('[data-scope="side-nav"][data-part="link"]')]
    expect(links).toHaveLength(2)
    expect(el.querySelectorAll('a')).toHaveLength(2)
    expect(links[0]!.getAttribute('href')).toBe('/app/home')
    expect(links[0]!.getAttribute('aria-current')).toBe('page')
    expect(links[1]!.getAttribute('href')).toBe('/app/orders')
  })

  it('点击既交给路由跳转，也照常发 onValueChange', async () => {
    const onValueChange = vi.fn()
    const el = await render(<SideNav asChild onValueChange={onValueChange} />)
    await act(async () => {
      el.querySelectorAll<HTMLElement>('[data-part="link"]')[1]!.click()
    })
    expect(navigations).toEqual(['/orders'])
    expect(onValueChange).toHaveBeenCalledWith({ value: 'orders' })
  })

  it('聚焦上报照常接在路由链接上', async () => {
    const el = await render(<SideNav asChild />)
    const link = el.querySelectorAll<HTMLElement>('[data-part="link"]')[1]!
    await act(async () => link.focus())
    expect(link.getAttribute('data-highlighted')).toBe('')
  })

  it('不开 asChild 时照常渲染自己的 <a>', async () => {
    const el = await render(<SideNav asChild={false} />)
    const link = el.querySelector<HTMLElement>('[data-part="link"]')!
    expect(link.tagName).toBe('A')
    expect(link.hasAttribute('href')).toBe(false)
  })
})
