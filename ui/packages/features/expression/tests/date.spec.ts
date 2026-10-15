import { describe, expect, it } from 'vitest'
import { ExprDate } from '../src'
import { issue, run } from './helpers'

const NOW = ExprDate.fromParts(2026, 10, 16, 15, 30, 5, 250)!

describe('exprDate', () => {
  it('fromParts 校验每个部分，越界或非整数得到 null', () => {
    expect(ExprDate.fromParts(2026, 10, 16)?.toString()).toBe('2026-10-16')
    expect(ExprDate.fromParts(2024, 2, 29)?.toString()).toBe('2024-02-29')
    expect(ExprDate.fromParts(2023, 2, 29)).toBeNull()
    expect(ExprDate.fromParts(1900, 2, 29)).toBeNull()
    expect(ExprDate.fromParts(2000, 2, 29)?.toString()).toBe('2000-02-29')
    expect(ExprDate.fromParts(0, 1, 1)).toBeNull()
    expect(ExprDate.fromParts(10000, 1, 1)).toBeNull()
    expect(ExprDate.fromParts(2026, 13, 1)).toBeNull()
    expect(ExprDate.fromParts(2026, 1, 1, 24)).toBeNull()
    expect(ExprDate.fromParts(2026, 1, 1.5)).toBeNull()
  })

  it('epochMilliseconds 按前推格里历计算、不经过时区', () => {
    expect(ExprDate.fromParts(1970, 1, 1)!.epochMilliseconds).toBe(0)
    expect(ExprDate.fromParts(1, 1, 1)!.epochMilliseconds).toBe(-62_135_596_800_000)
    expect(ExprDate.fromParts(9999, 12, 31, 23, 59, 59, 999)!.epochMilliseconds).toBe(253_402_300_799_999)
    expect(ExprDate.fromEpochMilliseconds(0)?.toString()).toBe('1970-01-01')
    expect(ExprDate.fromEpochMilliseconds(253_402_300_800_000)).toBeNull()
    expect(ExprDate.fromEpochMilliseconds(0.5)).toBeNull()
  })

  it('各组成部分与 ISO 星期', () => {
    expect(NOW.parts).toEqual({ year: 2026, month: 10, day: 16, hour: 15, minute: 30, second: 5, millisecond: 250 })
    expect(NOW.weekday).toBe(5)
    expect(ExprDate.fromParts(1970, 1, 1)!.weekday).toBe(4)
    expect(ExprDate.fromParts(1, 1, 1)!.weekday).toBe(1)
    expect(ExprDate.fromParts(1969, 12, 31, 23, 59, 59, 999)!.parts).toEqual({ year: 1969, month: 12, day: 31, hour: 23, minute: 59, second: 59, millisecond: 999 })
  })

  it('规范文本：零点只写日期，毫秒为 0 不写毫秒', () => {
    expect(ExprDate.fromParts(2026, 1, 2, 3, 4, 5)!.toString()).toBe('2026-01-02T03:04:05')
    expect(NOW.toString()).toBe('2026-10-16T15:30:05.250')
    expect(ExprDate.fromParts(5, 1, 1)!.toString()).toBe('0005-01-01')
    expect(JSON.stringify(NOW)).toBe('"2026-10-16T15:30:05.250"')
  })

  it.each([
    ['2026-10-16', '2026-10-16'],
    ['2026-10-16T08:05', '2026-10-16T08:05:00'],
    ['2026-10-16 08:05:09', '2026-10-16T08:05:09'],
    ['2026-10-16T10:30:00.1234567+08:00', '2026-10-16T10:30:00.123'],
    ['2026-10-16T10:30:00Z', '2026-10-16T10:30:00'],
    ['2026-10-16T10:30:00.5-0330', '2026-10-16T10:30:00.500'],
  ])('parse(%s) 保留墙钟时间', (text, expected) => {
    expect(ExprDate.parse(text)?.toString()).toBe(expected)
  })

  it.each(['2026-1-1', '2026-10-16Z', '2026-02-30', '2026-10-16T24:00', '26-10-16', '2026-10-16T10', 'x', ''])('parse(%s) 得到 null', (text) => {
    expect(ExprDate.parse(text)).toBeNull()
  })
})

describe('日期函数', () => {
  it('构造日期：DATE 越界的部分按实参序号报错', () => {
    expect(run('DATE(2026, 10, 16)')).toBe('2026-10-16')
    expect(run('DATE(2026, 10, 16, 8, 9, 10, 11)')).toBe('2026-10-16T08:09:10.011')
    expect(issue('DATE(2026, 2, 30)')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { function: 'DATE', index: 2 } })
    expect(issue('DATE(2026, 13, 1)')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 1 } })
    expect(issue('DATE(2026, 1, 1, 24)')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 3 } })
    expect(issue('DATE(\'2026\', 1, 1)')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { index: 0, actual: 'string' } })
    expect(run('DATE(y, 1, 1)', {})).toBeNull()
  })

  it('当前时间：NOW / TODAY 只读宿主提供的值', () => {
    expect(issue('NOW()')).toEqual({ code: 'XH_EXPR_NOW_UNAVAILABLE', start: 0, end: 5, data: { function: 'NOW' } })
    expect(issue('TODAY()').code).toBe('XH_EXPR_NOW_UNAVAILABLE')
    expect(run('NOW()', {}, { now: NOW })).toBe('2026-10-16T15:30:05.250')
    expect(run('TODAY()', {}, { now: NOW })).toBe('2026-10-16')
  })

  it('文本转日期：TO_DATE 不合法得到 null', () => {
    expect(run('TO_DATE(\'2026-10-16\')')).toBe('2026-10-16')
    expect(run('TO_DATE(d)', { d: '2026-10-16 08:00' })).toBe('2026-10-16T08:00:00')
    expect(run('TO_DATE(\'x\')')).toBeNull()
    expect(run('TO_DATE(null)')).toBeNull()
    expect(run('TO_DATE(TODAY())', {}, { now: NOW })).toBe('2026-10-16')
    expect(issue('TO_DATE(1)')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { index: 0, actual: 'number' } })
  })

  it('取年月日时分秒与星期', () => {
    const scope = { d: NOW }
    expect(run('[YEAR(d), MONTH(d), DAY(d), HOUR(d), MINUTE(d), SECOND(d), WEEKDAY(d)]', scope)).toEqual(['2026', '10', '16', '15', '30', '5', '5'])
    expect(run('YEAR(null)')).toBeNull()
    expect(issue('YEAR(\'2026-10-16\')')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { function: 'YEAR', index: 0 } })
  })

  it.each([
    ['DATE_ADD(DATE(2024, 1, 31), 1, \'month\')', '2024-02-29'],
    ['DATE_ADD(DATE(2023, 1, 31), 1, \'month\')', '2023-02-28'],
    ['DATE_ADD(DATE(2024, 2, 29), 1, \'year\')', '2025-02-28'],
    ['DATE_ADD(DATE(2024, 3, 31), -1, \'month\')', '2024-02-29'],
    ['DATE_ADD(DATE(2026, 10, 16), -16, \'day\')', '2026-09-30'],
    ['DATE_ADD(DATE(2026, 10, 16), 2, \'week\')', '2026-10-30'],
    ['DATE_ADD(DATE(2026, 10, 16), 25, \'hour\')', '2026-10-17T01:00:00'],
    ['DATE_ADD(DATE(2026, 10, 16), -1, \'minute\')', '2026-10-15T23:59:00'],
    ['DATE_ADD(DATE(2026, 10, 16), 61, \'second\')', '2026-10-16T00:01:01'],
    ['DATE_ADD(DATE(2026, 10, 16, 8, 0, 0), 14, \'month\')', '2027-12-16T08:00:00'],
  ])('%s = %s', (source, expected) => {
    expect(run(source)).toBe(expected)
  })

  it('日期加减的边界', () => {
    expect(issue('DATE_ADD(DATE(9999, 12, 31), 1, \'day\')').code).toBe('XH_EXPR_DATE_OUT_OF_RANGE')
    expect(issue('DATE_ADD(DATE(1, 1, 1), -1, \'month\')').code).toBe('XH_EXPR_DATE_OUT_OF_RANGE')
    expect(issue('DATE_ADD(DATE(2026, 1, 1), 1e20, \'year\')').code).toBe('XH_EXPR_DATE_OUT_OF_RANGE')
    expect(issue('DATE_ADD(DATE(2026, 1, 1), 1.5, \'day\')')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 1 } })
    expect(issue('DATE_ADD(DATE(2026, 1, 1), 1, \'days\')')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 2 } })
    expect(issue('DATE_ADD(DATE(2026, 1, 1), 1, \'constructor\')')).toMatchObject({ code: 'XH_EXPR_INVALID_ARGUMENT', data: { index: 2 } })
  })

  it.each([
    ['DATE_DIFF(DATE(2026, 1, 1), DATE(2026, 10, 16), \'day\')', '288'],
    ['DATE_DIFF(DATE(2026, 10, 16), DATE(2026, 1, 1), \'day\')', '-288'],
    ['DATE_DIFF(DATE(2024, 1, 31), DATE(2024, 2, 29), \'month\')', '1'],
    ['DATE_DIFF(DATE(2024, 1, 31), DATE(2024, 2, 28), \'month\')', '0'],
    ['DATE_DIFF(DATE(2024, 3, 31), DATE(2024, 2, 29), \'month\')', '-1'],
    ['DATE_DIFF(DATE(2024, 3, 30), DATE(2024, 2, 29), \'month\')', '-1'],
    ['DATE_DIFF(DATE(2024, 3, 28), DATE(2024, 2, 29), \'month\')', '0'],
    ['DATE_DIFF(DATE(2000, 2, 29), DATE(2001, 2, 28), \'year\')', '1'],
    ['DATE_DIFF(DATE(2000, 3, 1), DATE(2001, 2, 28), \'year\')', '0'],
    ['DATE_DIFF(DATE(2026, 10, 16, 0, 0, 0), DATE(2026, 10, 16, 1, 59, 0), \'hour\')', '1'],
    ['DATE_DIFF(DATE(2026, 10, 16, 1, 59, 0), DATE(2026, 10, 16, 0, 0, 0), \'hour\')', '-1'],
    ['DATE_DIFF(DATE(2026, 10, 1), DATE(2026, 10, 16), \'week\')', '2'],
  ])('%s = %s', (source, expected) => {
    expect(run(source)).toBe(expected)
  })

  it.each([
    ['yyyy-MM-dd HH:mm:ss', '2026-03-05 07:08:09'],
    ['yy/M/d H:m:s', '26/3/5 7:8:9'],
    ['yyyy\'年\'M\'月\'d\'日\'', '2026年3月5日'],
    ['\'yyyy\' yyyy', 'yyyy 2026'],
    ['HH\'\'mm', '07\'08'],
    ['\'it\'\'s\' HH', 'it\'s 07'],
    ['SSS', '000'],
    ['T', 'T'],
    ['\'未闭合', '未闭合'],
  ])('格式化 FORMAT_DATE(d, %s) = %s', (pattern, expected) => {
    expect(run('FORMAT_DATE(d, p)', { d: ExprDate.fromParts(2026, 3, 5, 7, 8, 9)!, p: pattern })).toBe(expected)
  })

  it('日期之间按先后比较，与文本比较报类型不符', () => {
    expect(run('DATE(2026, 1, 1) < DATE(2026, 1, 2)')).toBe(true)
    expect(run('DATE(2026, 1, 1) == TO_DATE(\'2026-01-01\')')).toBe(true)
    expect(issue('DATE(2026, 1, 1) < \'2026-01-02\'')).toMatchObject({ code: 'XH_EXPR_TYPE_MISMATCH', data: { operator: '<', actual: 'string' } })
  })
})
