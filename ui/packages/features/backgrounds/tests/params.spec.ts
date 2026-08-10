import type { ParamSpecMap } from '../src/types'
import { describe, expect, it } from 'vitest'
import { boolSpec, colorSpec, enumSpec, numberSpec } from '../src/effects/define'
import { defaultParams, hexToRgb, isHexColor, resolveParam, resolveParams } from '../src/params'

/**
 * 判据按「参数来自不可信来源」写：越界要钳、类型不对要回落、规格里没有的键要丢。
 * 参数常来自界面滑块或持久化配置，为一个坏值把整张背景打黑不划算。
 */

const SPECS: ParamSpecMap = {
  speed: numberSpec('速度', 0, 3, 0.05, 1),
  tint: colorSpec('颜色', '#ff8800'),
  loop: boolSpec('循环', true),
  mode: enumSpec('模式', ['soft', 'hard'], 'soft'),
}

describe('默认值', () => {
  it('取出的就是规格里写的默认值', () => {
    expect(defaultParams(SPECS)).toEqual({ speed: 1, tint: '#ff8800', loop: true, mode: 'soft' })
  })
})

describe('数值参数', () => {
  it('越界被钳到区间内而不是抛错', () => {
    expect(resolveParam(SPECS.speed!, 99)).toBe(3)
    expect(resolveParam(SPECS.speed!, -5)).toBe(0)
  })

  it('非有限数回落到默认值', () => {
    expect(resolveParam(SPECS.speed!, Number.NaN)).toBe(1)
    expect(resolveParam(SPECS.speed!, Number.POSITIVE_INFINITY)).toBe(1)
  })

  it('数字字符串按数字解析', () => {
    expect(resolveParam(SPECS.speed!, '2.5')).toBe(2.5)
  })

  it('解析不出数字的字符串回落到默认值', () => {
    expect(resolveParam(SPECS.speed!, '很快')).toBe(1)
  })
})

describe('颜色参数', () => {
  it('只接受十六进制写法，其余回落', () => {
    expect(resolveParam(SPECS.tint!, '#00ff00')).toBe('#00ff00')
    expect(resolveParam(SPECS.tint!, '#0f0')).toBe('#0f0')
    expect(resolveParam(SPECS.tint!, 'red')).toBe('#ff8800')
    expect(resolveParam(SPECS.tint!, 'rgb(1,2,3)')).toBe('#ff8800')
  })

  it('三位与六位写法转出同一组分量', () => {
    expect(hexToRgb('#0f0')).toEqual(hexToRgb('#00ff00'))
    expect(hexToRgb('#ffffff')).toEqual([1, 1, 1])
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
  })

  it('非法颜色转出黑色而不是 NaN', () => {
    expect(hexToRgb('nope')).toEqual([0, 0, 0])
    expect(isHexColor('#12345')).toBe(false)
  })
})

describe('枚举与布尔', () => {
  it('不在候选里的枚举值回落', () => {
    expect(resolveParam(SPECS.mode!, 'hard')).toBe('hard')
    expect(resolveParam(SPECS.mode!, 'ultra')).toBe('soft')
  })

  it('布尔按真假性转换', () => {
    expect(resolveParam(SPECS.loop!, false)).toBe(false)
    expect(resolveParam(SPECS.loop!, 0)).toBe(false)
    expect(resolveParam(SPECS.loop!, 'yes')).toBe(true)
  })
})

describe('整份解析', () => {
  it('缺省的键补默认值', () => {
    expect(resolveParams(SPECS, { speed: 2 })).toEqual({
      speed: 2,
      tint: '#ff8800',
      loop: true,
      mode: 'soft',
    })
  })

  it('规格里没有的键被丢掉——留着会在下次序列化时被写回，越攒越多', () => {
    const out = resolveParams(SPECS, { speed: 1, 遗留键: 42 })
    expect('遗留键' in out).toBe(false)
  })

  it('传 undefined 等同于全默认', () => {
    expect(resolveParams(SPECS, undefined)).toEqual(defaultParams(SPECS))
  })
})
