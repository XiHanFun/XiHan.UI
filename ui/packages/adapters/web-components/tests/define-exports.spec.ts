import { describe, expect, it } from 'vitest'
import {
  defineXhElements,
  XhAlertElement,
  XhEmptyStateElement,
  XhNumberFieldElement,
  XhSkeletonElement,
  XhSpinnerElement,
} from '../src/define'

describe('define exports', () => {
  it('exports every recently added element class', () => {
    expect(defineXhElements).toBeTypeOf('function')
    expect(XhAlertElement).toBeTypeOf('function')
    expect(XhEmptyStateElement).toBeTypeOf('function')
    expect(XhNumberFieldElement).toBeTypeOf('function')
    expect(XhSkeletonElement).toBeTypeOf('function')
    expect(XhSpinnerElement).toBeTypeOf('function')
  })
})
