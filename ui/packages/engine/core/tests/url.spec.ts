// toSafeImageSource 与 toSafeLinkHref：各自放行的地址、挡下的协议，以及按 URL 解析规则去掉的空白与控制字符。
import { describe, expect, it } from 'vitest'
import { toSafeImageSource, toSafeLinkHref } from '../src/url'

describe('toSafeImageSource', () => {
  it.each([
    'https://example.com/a.png',
    'http://example.com/a.png',
    'HTTPS://EXAMPLE.COM/A.PNG',
    'blob:https://example.com/0b4c8e1a',
    'data:image/png;base64,iVBORw0KGgo=',
    'DATA:IMAGE/SVG+XML,%3Csvg%2F%3E',
    'images/logo.png',
    '/images/logo.png',
    './logo.png',
    '//cdn.example.com/logo.png',
    '?v=1',
  ])('放行「%s」并原样返回', (src) => {
    expect(toSafeImageSource(src)).toBe(src)
  })

  it.each([
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'data:,hello',
    'file:///etc/passwd',
    'ftp://example.com/a.png',
    'c:\\images\\a.png',
  ])('挡下「%s」', (src) => {
    expect(toSafeImageSource(src)).toBeUndefined()
  })

  it('非字符串、空串与只有空白的串返回 undefined', () => {
    expect(toSafeImageSource(undefined)).toBeUndefined()
    expect(toSafeImageSource(null)).toBeUndefined()
    expect(toSafeImageSource(42)).toBeUndefined()
    expect(toSafeImageSource({ src: 'a.png' })).toBeUndefined()
    expect(toSafeImageSource('')).toBeUndefined()
    expect(toSafeImageSource(' \t\n ')).toBeUndefined()
  })

  it('去掉首尾的空格与控制字符，返回处理后的串', () => {
    expect(toSafeImageSource('  https://example.com/a.png\n')).toBe('https://example.com/a.png')
    expect(toSafeImageSource('\u0000\u001F images/a.png')).toBe('images/a.png')
  })

  it('串中的制表与换行先删去再认协议，拼不出被挡的协议', () => {
    expect(toSafeImageSource('java\nscript:alert(1)')).toBeUndefined()
    expect(toSafeImageSource('java\tscript:alert(1)')).toBeUndefined()
    expect(toSafeImageSource(' \r\njavascript:alert(1)')).toBeUndefined()
    expect(toSafeImageSource('data:image/png;base64,iVBO\nRw0KGgo=')).toBe('data:image/png;base64,iVBORw0KGgo=')
  })

  it('串中的空格不删：协议名里带空格即不成协议，按相对地址放行', () => {
    expect(toSafeImageSource('java script:alert(1)')).toBe('java script:alert(1)')
  })
})

describe('toSafeLinkHref', () => {
  it.each([
    'https://example.com/docs?page=2#top',
    'http://example.com',
    'HTTPS://EXAMPLE.COM',
    'mailto:service@example.com',
    'MAILTO:service@example.com?subject=hi',
    'tel:+86-571-0000-0000',
    'docs/start.html',
    '/docs/start',
    '../start',
    '//example.com/start',
    '#section-2',
    '?tab=print',
  ])('放行「%s」并原样返回', (href) => {
    expect(toSafeLinkHref(href)).toBe(href)
  })

  it.each([
    'javascript:alert(1)',
    'JavaScript:void(0)',
    'vbscript:msgbox(1)',
    'data:text/html,<script>alert(1)</script>',
    'data:image/png;base64,iVBORw0KGgo=',
    'blob:https://example.com/0b4c8e1a',
    'file:///etc/passwd',
    'ftp://example.com/a.txt',
    'sms:10086',
  ])('挡下「%s」', (href) => {
    expect(toSafeLinkHref(href)).toBeUndefined()
  })

  it('非字符串、空串与只有空白的串返回 undefined', () => {
    expect(toSafeLinkHref(undefined)).toBeUndefined()
    expect(toSafeLinkHref(null)).toBeUndefined()
    expect(toSafeLinkHref(7)).toBeUndefined()
    expect(toSafeLinkHref('')).toBeUndefined()
    expect(toSafeLinkHref(' \t\n ')).toBeUndefined()
  })

  it('去掉首尾空白与控制字符，串中的制表与换行先删去再认协议', () => {
    expect(toSafeLinkHref('  https://example.com \n')).toBe('https://example.com')
    expect(toSafeLinkHref('java\nscript:alert(1)')).toBeUndefined()
    expect(toSafeLinkHref('\u0000mailto:a@example.com')).toBe('mailto:a@example.com')
  })
})
