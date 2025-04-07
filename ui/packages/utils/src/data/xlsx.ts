/**
 * Excel 文件处理工具
 */

/**
 * Excel工作簿接口
 */
export interface Workbook {
  /**
   * 工作表名称列表
   */
  SheetNames: string[];

  /**
   * 工作表对象，键为工作表名称
   */
  Sheets: {
    [key: string]: WorkSheet;
  };
}

/**
 * Excel工作表接口
 */
export interface WorkSheet {
  /**
   * 单元格对象，键为单元格索引(如 A1, B2)
   */
  [key: string]: WorkSheetCell | SheetRange;
}

/**
 * 单元格接口
 */
export interface WorkSheetCell {
  /**
   * 单元格值
   */
  v: any;

  /**
   * 单元格内容类型
   */
  t?: string;

  /**
   * 单元格格式化
   */
  f?: string;

  /**
   * 单元格样式
   */
  s?: CellStyle;
}

/**
 * 工作表范围接口
 */
export interface SheetRange {
  /**
   * 范围起始位置
   */
  s: CellPosition;

  /**
   * 范围结束位置
   */
  e: CellPosition;

  /**
   * 范围引用键
   */
  ref?: string;
}

/**
 * 单元格位置接口
 */
export interface CellPosition {
  /**
   * 行索引(从0开始)
   */
  r: number;

  /**
   * 列索引(从0开始)
   */
  c: number;
}

/**
 * 单元格样式接口
 */
export interface CellStyle {
  /**
   * 字体设置
   */
  font?: {
    /**
     * 字体名称
     */
    name?: string;

    /**
     * 字体大小
     */
    sz?: number;

    /**
     * 是否加粗
     */
    bold?: boolean;

    /**
     * 是否斜体
     */
    italic?: boolean;

    /**
     * 下划线
     */
    underline?: boolean;

    /**
     * 字体颜色
     */
    color?: { rgb: string };
  };

  /**
   * 填充设置
   */
  fill?: {
    /**
     * 填充模式
     */
    patternType?: string;

    /**
     * 填充颜色
     */
    fgColor?: { rgb: string };

    /**
     * 背景颜色
     */
    bgColor?: { rgb: string };
  };

  /**
   * 边框设置
   */
  border?: {
    /**
     * 左边框
     */
    left?: BorderStyle;

    /**
     * 右边框
     */
    right?: BorderStyle;

    /**
     * 上边框
     */
    top?: BorderStyle;

    /**
     * 下边框
     */
    bottom?: BorderStyle;
  };

  /**
   * 对齐方式
   */
  alignment?: {
    /**
     * 水平对齐
     */
    horizontal?: "left" | "center" | "right";

    /**
     * 垂直对齐
     */
    vertical?: "top" | "center" | "bottom";

    /**
     * 文本换行
     */
    wrapText?: boolean;
  };

  /**
   * 数字格式
   */
  numFmt?: string;
}

/**
 * 边框样式接口
 */
export interface BorderStyle {
  /**
   * 边框样式
   */
  style?: "thin" | "medium" | "thick" | "dotted" | "dashed";

  /**
   * 边框颜色
   */
  color?: { rgb: string };
}

/**
 * Excel解析配置选项
 */
export interface ParseExcelOptions {
  /**
   * 是否包含表头，默认为true
   */
  header?: boolean;

  /**
   * 读取的工作表索引或名称，默认为第一个工作表
   */
  sheet?: number | string;

  /**
   * 是否忽略空白单元格，默认为true
   */
  ignoreEmpty?: boolean;

  /**
   * 日期格式化字符串
   */
  dateFormat?: string;

  /**
   * 是否裁剪内容首尾空白，默认为true
   */
  trim?: boolean;
}

/**
 * Excel导出配置选项
 */
export interface ExportExcelOptions {
  /**
   * 是否包含表头，默认为true
   */
  header?: boolean;

  /**
   * 工作表名称，默认为"Sheet1"
   */
  sheetName?: string;

  /**
   * 表头样式
   */
  headerStyle?: CellStyle;

  /**
   * 单元格样式
   */
  cellStyle?: CellStyle;

  /**
   * 日期格式化字符串
   */
  dateFormat?: string;

  /**
   * 是否自动列宽，默认为true
   */
  autoWidth?: boolean;
}

/**
 * 解析Excel文件为JSON数据
 * @param data Excel文件数据（二进制或base64）
 * @param options 解析配置选项
 * @returns 解析后的数据数组
 */
export function parseExcel<T = Record<string, any>>(
  data: ArrayBuffer | string,
  options: Partial<ParseExcelOptions> = {},
): T[] {
  throw new Error("Excel解析功能依赖外部库，请安装xlsx库并实现此功能");

  // 实现示例（需要安装 xlsx 库）:
  // const XLSX = require('xlsx');
  // const workbook = XLSX.read(data, { type: 'array' });
  // const sheet = options.sheet
  //   ? (typeof options.sheet === 'string' ? workbook.Sheets[options.sheet] : workbook.Sheets[workbook.SheetNames[options.sheet]])
  //   : workbook.Sheets[workbook.SheetNames[0]];
  // return XLSX.utils.sheet_to_json(sheet, {
  //   header: options.header === false ? 1 : undefined,
  //   defval: '',
  //   blankrows: !options.ignoreEmpty
  // });
}

/**
 * 导出JSON数据为Excel文件
 * @param data 要导出的数据
 * @param options 导出配置选项
 * @returns Excel文件的二进制数据
 */
export function exportToExcel<T = Record<string, any>>(
  data: T[],
  options: Partial<ExportExcelOptions> = {},
): ArrayBuffer {
  throw new Error("Excel导出功能依赖外部库，请安装xlsx库并实现此功能");

  // 实现示例（需要安装 xlsx 库）:
  // const XLSX = require('xlsx');
  // const sheetName = options.sheetName || 'Sheet1';
  // const worksheet = XLSX.utils.json_to_sheet(data, {
  //   header: options.header === false ? undefined : Object.keys(data[0] || {})
  // });
  // const workbook = XLSX.utils.book_new();
  // XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  // return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
}

/**
 * 导出Excel文件并下载
 * @param data 要导出的数据
 * @param filename 文件名
 * @param options 导出配置选项
 */
export function downloadExcel<T = Record<string, any>>(
  data: T[],
  filename: string,
  options: Partial<ExportExcelOptions> = {},
): void {
  try {
    const excelData = exportToExcel(data, options);
    const blob = new Blob([excelData], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error("导出Excel文件失败:", error);
    throw error;
  }
}

/**
 * 将Excel单元格索引(A1)转换为行列索引({r:0, c:0})
 * @param cellRef 单元格索引(如A1)
 * @returns 行列索引对象
 */
export function cellRefToIndex(cellRef: string): CellPosition {
  const match = cellRef.match(/([A-Z]+)([0-9]+)/);
  if (!match) {
    throw new Error(`无效的单元格索引: ${cellRef}`);
  }

  const colStr = match[1];
  const rowStr = match[2];

  // 列索引: A->0, B->1, Z->25, AA->26
  let colIdx = 0;
  for (let i = 0; i < colStr.length; i++) {
    colIdx = colIdx * 26 + colStr.charCodeAt(i) - 64; // 'A'.charCodeAt(0) = 65
  }

  // 行索引从1开始，需要减1
  const rowIdx = parseInt(rowStr, 10) - 1;

  return { r: rowIdx, c: colIdx - 1 };
}

/**
 * 将行列索引转换为Excel单元格索引
 * @param rowIdx 行索引(从0开始)
 * @param colIdx 列索引(从0开始)
 * @returns 单元格索引(如A1)
 */
export function indexToCellRef(rowIdx: number, colIdx: number): string {
  let colStr = "";

  // 列索引: 0->A, 1->B, 25->Z, 26->AA
  colIdx += 1; // 增加1以便计算
  while (colIdx > 0) {
    const remainder = (colIdx - 1) % 26;
    colStr = String.fromCharCode(65 + remainder) + colStr;
    colIdx = Math.floor((colIdx - remainder) / 26);
  }

  // 行索引从1开始
  return colStr + (rowIdx + 1);
}

/**
 * 创建样式对象
 * @param options 样式选项
 * @returns 单元格样式对象
 */
export function createStyle(options: Partial<CellStyle> = {}): CellStyle {
  return {
    ...options,
  };
}

/**
 * 创建表头样式
 * @returns 表头样式对象
 */
export function createHeaderStyle(): CellStyle {
  return {
    font: {
      bold: true,
      sz: 12,
    },
    fill: {
      patternType: "solid",
      fgColor: { rgb: "E0E0E0" },
    },
    border: {
      top: { style: "thin" },
      right: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
    },
  };
}

/**
 * 解析Excel文件后获取工作表名称列表
 * @param data Excel文件数据（二进制或base64）
 * @returns 工作表名称列表
 */
export function getSheetNames(data: ArrayBuffer | string): string[] {
  throw new Error("此功能依赖外部库，请安装xlsx库并实现此功能");

  // 实现示例（需要安装 xlsx 库）:
  // const XLSX = require('xlsx');
  // const workbook = XLSX.read(data, { type: typeof data === 'string' ? 'base64' : 'array' });
  // return workbook.SheetNames;
}

/**
 * 从Excel文件读取指定范围的数据
 * @param data Excel文件数据
 * @param range 范围（如 'A1:C10'）
 * @param sheetName 工作表名称
 * @returns 指定范围的数据数组
 */
export function readExcelRange(data: ArrayBuffer | string, range: string, sheetName?: string): any[][] {
  throw new Error("此功能依赖外部库，请安装xlsx库并实现此功能");

  // 实现示例（需要安装 xlsx 库）:
  // const XLSX = require('xlsx');
  // const workbook = XLSX.read(data, { type: typeof data === 'string' ? 'base64' : 'array' });
  // const sheet = sheetName ? workbook.Sheets[sheetName] : workbook.Sheets[workbook.SheetNames[0]];
  // return XLSX.utils.sheet_to_json(sheet, { header: 1, range });
}
