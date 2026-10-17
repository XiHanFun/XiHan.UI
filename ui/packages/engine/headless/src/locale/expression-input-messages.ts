/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 表达式输入框的长文案：问题说明、参数名与内置函数说明。英文与中文写全，其余语言包回落英文。

type IssueData = Readonly<Record<string, string | number>>

const PARAMS_EN_US: Readonly<Record<string, string>> = {
  condition: 'condition',
  whenTrue: 'if true',
  whenFalse: 'if false',
  value: 'value',
  number: 'number',
  places: 'digits',
  base: 'base',
  exponent: 'exponent',
  text: 'text',
  prefix: 'prefix',
  suffix: 'suffix',
  count: 'count',
  start: 'start',
  end: 'end',
  length: 'length',
  source: 'text or list',
  search: 'search',
  replacement: 'replacement',
  separator: 'separator',
  list: 'list',
  decimals: 'decimals',
  grouping: 'grouping',
  date: 'date',
  year: 'year',
  month: 'month',
  day: 'day',
  hour: 'hour',
  minute: 'minute',
  second: 'second',
  millisecond: 'millisecond',
  amount: 'amount',
  unit: 'unit',
  pattern: 'pattern',
}

const PARAMS_ZH_CN: Readonly<Record<string, string>> = {
  condition: '条件',
  whenTrue: '真值',
  whenFalse: '假值',
  value: '值',
  number: '数字',
  places: '位数',
  base: '底数',
  exponent: '指数',
  text: '文本',
  prefix: '前缀',
  suffix: '后缀',
  count: '个数',
  start: '起点',
  end: '终点',
  length: '长度',
  source: '文本或列表',
  search: '查找内容',
  replacement: '替换为',
  separator: '分隔符',
  list: '列表',
  decimals: '小数位',
  grouping: '千分位',
  date: '日期',
  year: '年',
  month: '月',
  day: '日',
  hour: '时',
  minute: '分',
  second: '秒',
  millisecond: '毫秒',
  amount: '数量',
  unit: '单位',
  pattern: '格式',
}

const FUNCTIONS_EN_US: Readonly<Record<string, string>> = {
  IF: 'Picks a value by a condition',
  COALESCE: 'The first value that is not null',
  ISBLANK: 'Whether a value is null, empty text or an empty list',
  ABS: 'Absolute value',
  ROUND: 'Rounds half up to the given digits',
  FLOOR: 'Rounds down to the given digits',
  CEIL: 'Rounds up to the given digits',
  TRUNC: 'Rounds toward zero to the given digits',
  SQRT: 'Square root',
  POWER: 'Raises to an integer power',
  SUM: 'Sum of the numbers',
  AVG: 'Average of the numbers',
  COUNT: 'Number of values that are not null',
  MIN: 'The smallest value',
  MAX: 'The largest value',
  CONCAT: 'Joins values into text',
  TEXT: 'A value as text',
  LEN: 'Number of characters',
  LEFT: 'The first characters of text',
  RIGHT: 'The last characters of text',
  MID: 'Characters from a start position',
  UPPER: 'Converts to upper case',
  LOWER: 'Converts to lower case',
  TRIM: 'Removes leading and trailing spaces',
  CONTAINS: 'Whether text contains a substring, or a list contains a value',
  STARTS_WITH: 'Whether text starts with a prefix',
  ENDS_WITH: 'Whether text ends with a suffix',
  REPLACE: 'Replaces every occurrence',
  SPLIT: 'Splits text into a list',
  JOIN: 'Joins a list into text',
  FORMAT_NUMBER: 'Formats a number with fixed decimals',
  TO_NUMBER: 'Parses text as a number',
  NOW: 'The current time',
  TODAY: 'Today at midnight',
  DATE: 'Builds a date from its parts',
  TO_DATE: 'Parses text as a date',
  YEAR: 'Year of a date',
  MONTH: 'Month of a date',
  DAY: 'Day of a date',
  HOUR: 'Hour of a date',
  MINUTE: 'Minute of a date',
  SECOND: 'Second of a date',
  WEEKDAY: 'Day of the week, Monday is 1',
  DATE_ADD: 'Adds an amount of a unit to a date',
  DATE_DIFF: 'Whole units between two dates',
  FORMAT_DATE: 'Formats a date with a pattern',
}

const FUNCTIONS_ZH_CN: Readonly<Record<string, string>> = {
  IF: '按条件取值',
  COALESCE: '第一个不为空的值',
  ISBLANK: '是否为空值、空文本或空列表',
  ABS: '绝对值',
  ROUND: '四舍五入到指定位数',
  FLOOR: '向下取到指定位数',
  CEIL: '向上取到指定位数',
  TRUNC: '向零取到指定位数',
  SQRT: '平方根',
  POWER: '整数次幂',
  SUM: '数字之和',
  AVG: '平均值',
  COUNT: '不为空的值的个数',
  MIN: '最小值',
  MAX: '最大值',
  CONCAT: '把值拼成文本',
  TEXT: '值的文本形式',
  LEN: '字符个数',
  LEFT: '文本开头的若干字符',
  RIGHT: '文本末尾的若干字符',
  MID: '从起点起取若干字符',
  UPPER: '转成大写',
  LOWER: '转成小写',
  TRIM: '去掉首尾空白',
  CONTAINS: '文本是否包含子串，或列表是否包含某个值',
  STARTS_WITH: '文本是否以前缀开头',
  ENDS_WITH: '文本是否以后缀结尾',
  REPLACE: '全部替换',
  SPLIT: '把文本拆成列表',
  JOIN: '把列表拼成文本',
  FORMAT_NUMBER: '按固定小数位格式化数字',
  TO_NUMBER: '把文本解析成数字',
  NOW: '当前时间',
  TODAY: '今天零点',
  DATE: '由年、月、日等组成日期',
  TO_DATE: '把文本转成日期',
  YEAR: '日期的年份',
  MONTH: '日期的月份',
  DAY: '日期的日',
  HOUR: '日期的小时',
  MINUTE: '日期的分钟',
  SECOND: '日期的秒',
  WEEKDAY: '星期几，周一为 1',
  DATE_ADD: '给日期加上若干单位',
  DATE_DIFF: '两个日期相差的完整单位数',
  FORMAT_DATE: '按格式输出日期',
}

/** 问题说明（英文）。 */
export function expressionIssueEnUS(code: string, data: IssueData): string {
  switch (code) {
    case 'XH_EXPR_EMPTY': return 'The expression is empty'
    case 'XH_EXPR_TOO_LONG': return `The expression is longer than ${data.max} characters`
    case 'XH_EXPR_TOO_DEEP': return 'The expression is nested too deeply'
    case 'XH_EXPR_UNEXPECTED_CHARACTER': return `Unexpected character ${data.char}`
    case 'XH_EXPR_UNEXPECTED_TOKEN': return data.token === undefined ? 'Unexpected value here' : `Unexpected ${data.token}`
    case 'XH_EXPR_UNEXPECTED_END': return 'The expression is incomplete'
    case 'XH_EXPR_UNTERMINATED_STRING': return 'The quote is not closed'
    case 'XH_EXPR_INVALID_ESCAPE': return 'Invalid escape sequence'
    case 'XH_EXPR_INVALID_NUMBER': return 'Invalid number'
    case 'XH_EXPR_INVALID_IDENTIFIER': return 'The quoted name is empty'
    case 'XH_EXPR_CHAINED_COMPARISON': return 'Comparisons cannot be chained; combine them with && or ||'
    case 'XH_EXPR_INVALID_CALLEE': return 'Only a function name can be called'
    case 'XH_EXPR_UNKNOWN_IDENTIFIER': return `Unknown name ${data.name}`
    case 'XH_EXPR_UNKNOWN_FUNCTION': return `Unknown function ${data.name}`
    case 'XH_EXPR_ARGUMENT_COUNT':
      return data.max === undefined
        ? `${data.name} takes at least ${data.min} arguments, got ${data.actual}`
        : data.min === data.max
          ? `${data.name} takes ${data.min} arguments, got ${data.actual}`
          : `${data.name} takes ${data.min} to ${data.max} arguments, got ${data.actual}`
    case 'XH_EXPR_FORBIDDEN_MEMBER': return `${data.name} cannot be accessed`
    case 'XH_EXPR_INVALID_AST': return 'The expression structure is invalid'
    case 'XH_EXPR_TYPE_MISMATCH': return 'The value has the wrong type'
    case 'XH_EXPR_INVALID_ARGUMENT': return 'The argument value is not valid'
    case 'XH_EXPR_INVALID_INDEX': return 'The index must be a whole number'
    case 'XH_EXPR_DIVISION_BY_ZERO': return 'Division by zero'
    case 'XH_EXPR_NUMBER_OVERFLOW': return 'The number is too large'
    case 'XH_EXPR_DATE_OUT_OF_RANGE': return 'The date is out of range'
    case 'XH_EXPR_STRING_TOO_LONG': return 'The text result is too long'
    case 'XH_EXPR_STEP_LIMIT': return 'The expression takes too many steps'
    case 'XH_EXPR_DEPTH_LIMIT': return 'The data is nested too deeply'
    case 'XH_EXPR_UNSUPPORTED_VALUE': return 'The value is not supported'
    case 'XH_EXPR_NOW_UNAVAILABLE': return 'The current time is not available'
    case 'XH_EXPR_FUNCTION_FAILED': return 'The function failed'
    default: return code
  }
}

/** 问题说明（中文）。 */
export function expressionIssueZhCN(code: string, data: IssueData): string {
  switch (code) {
    case 'XH_EXPR_EMPTY': return '表达式为空'
    case 'XH_EXPR_TOO_LONG': return `表达式超过 ${data.max} 个字符`
    case 'XH_EXPR_TOO_DEEP': return '表达式嵌套太深'
    case 'XH_EXPR_UNEXPECTED_CHARACTER': return `不认识的字符 ${data.char}`
    case 'XH_EXPR_UNEXPECTED_TOKEN': return data.token === undefined ? '这里不该出现这个值' : `这里不该出现 ${data.token}`
    case 'XH_EXPR_UNEXPECTED_END': return '表达式没写完'
    case 'XH_EXPR_UNTERMINATED_STRING': return '引号没有闭合'
    case 'XH_EXPR_INVALID_ESCAPE': return '转义写法不对'
    case 'XH_EXPR_INVALID_NUMBER': return '数字写法不对'
    case 'XH_EXPR_INVALID_IDENTIFIER': return '反引号里的名字为空'
    case 'XH_EXPR_CHAINED_COMPARISON': return '比较不能连写，请用 && 或 || 连接'
    case 'XH_EXPR_INVALID_CALLEE': return '只有函数名后面能接括号调用'
    case 'XH_EXPR_UNKNOWN_IDENTIFIER': return `未知的名字 ${data.name}`
    case 'XH_EXPR_UNKNOWN_FUNCTION': return `未知的函数 ${data.name}`
    case 'XH_EXPR_ARGUMENT_COUNT':
      return data.max === undefined
        ? `${data.name} 至少要 ${data.min} 个参数，这里给了 ${data.actual} 个`
        : data.min === data.max
          ? `${data.name} 要 ${data.min} 个参数，这里给了 ${data.actual} 个`
          : `${data.name} 要 ${data.min} 到 ${data.max} 个参数，这里给了 ${data.actual} 个`
    case 'XH_EXPR_FORBIDDEN_MEMBER': return `不能访问 ${data.name}`
    case 'XH_EXPR_INVALID_AST': return '表达式结构不合法'
    case 'XH_EXPR_TYPE_MISMATCH': return '值的类型不对'
    case 'XH_EXPR_INVALID_ARGUMENT': return '参数的取值不合法'
    case 'XH_EXPR_INVALID_INDEX': return '下标必须是整数'
    case 'XH_EXPR_DIVISION_BY_ZERO': return '除数为 0'
    case 'XH_EXPR_NUMBER_OVERFLOW': return '数字太大'
    case 'XH_EXPR_DATE_OUT_OF_RANGE': return '日期超出范围'
    case 'XH_EXPR_STRING_TOO_LONG': return '文本结果太长'
    case 'XH_EXPR_STEP_LIMIT': return '表达式计算步数太多'
    case 'XH_EXPR_DEPTH_LIMIT': return '数据嵌套太深'
    case 'XH_EXPR_UNSUPPORTED_VALUE': return '不支持这种值'
    case 'XH_EXPR_NOW_UNAVAILABLE': return '取不到当前时间'
    case 'XH_EXPR_FUNCTION_FAILED': return '函数执行失败'
    default: return code
  }
}

/** 参数名（英文）；不认识的键原样返回。 */
export function expressionParamEnUS(key: string): string {
  return Object.hasOwn(PARAMS_EN_US, key) ? PARAMS_EN_US[key]! : key
}

/** 参数名（中文）；不认识的键原样返回。 */
export function expressionParamZhCN(key: string): string {
  return Object.hasOwn(PARAMS_ZH_CN, key) ? PARAMS_ZH_CN[key]! : key
}

/** 内置函数说明（英文）。 */
export function expressionFunctionEnUS(name: string): string | undefined {
  return Object.hasOwn(FUNCTIONS_EN_US, name) ? FUNCTIONS_EN_US[name] : undefined
}

/** 内置函数说明（中文）。 */
export function expressionFunctionZhCN(name: string): string | undefined {
  return Object.hasOwn(FUNCTIONS_ZH_CN, name) ? FUNCTIONS_ZH_CN[name] : undefined
}
