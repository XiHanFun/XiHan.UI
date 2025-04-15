/**
 * 数据处理和转换工具集
 */

// CSV 工具导出
export { parseCSV, stringifyCSV, csvToBlob, createCSVDownloadLink, downloadCSV } from "./csv";
export type { CSVParseOptions, CSVStringifyOptions } from "./csv";

// 数据格式化工具导出
export {
  formatNumber as formatNumberFormatter,
  formatCurrency as formatCurrencyFormatter,
  formatPercent as formatPercentFormatter,
  formatCompactNumber as formatCompactNumberFormatter,
  safeFormatNumber as safeFormatNumberFormatter,
  formatFileSize as formatFileSizeFormatter,
  formatDate as formatDateFormatter,
  formatRelativeTime as formatRelativeTimeFormatter,
  formatBankCard as formatBankCardFormatter,
  formatPhoneNumber as formatPhoneNumberFormatter,
  maskSensitiveInfo as maskSensitiveInfoFormatter,
} from "./formatter";
export type {
  NumberFormatOptions as NumberFormatOptionsFormatter,
  CurrencyFormatOptions as CurrencyFormatOptionsFormatter,
  PercentFormatOptions as PercentFormatOptionsFormatter,
  DateFormatOptions as DateFormatOptionsFormatter,
  CompactNumberOptions as CompactNumberOptionsFormatter,
} from "./formatter";

// Schema 验证工具导出
export { validate, applyDefaults, createBuilder } from "./schema";
export type { Schema, SchemaProperty, SchemaType, ValidationResult, ValidationError } from "./schema";

// 数据结构转换工具导出
export {
  listToTree,
  treeToList,
  findTreeNode,
  filterTree,
  traverseTree,
  arrayToMap,
  groupBy,
  uniqueBy,
  sortBy,
  isPlainObject,
  deepMerge,
} from "./transform";
export type {
  TreeNode,
  ListToTreeOptions,
  TreeToListOptions,
  FindTreeNodeOptions,
  FilterTreeOptions,
  TraverseTreeOptions,
} from "./transform";

// Excel 处理工具导出
export {
  parseExcel,
  exportToExcel,
  downloadExcel,
  cellRefToIndex,
  indexToCellRef,
  createStyle,
  createHeaderStyle,
  getSheetNames,
  readExcelRange,
} from "./xlsx";
export type {
  Workbook,
  WorkSheet,
  WorkSheetCell,
  SheetRange,
  CellPosition,
  CellStyle,
  BorderStyle,
  ParseExcelOptions,
  ExportExcelOptions,
} from "./xlsx";
