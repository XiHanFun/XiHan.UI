/**
 * CSV 数据解析和导出工具
 */

/**
 * CSV解析配置选项
 */
export interface CSVParseOptions {
  /**
   * 分隔符，默认为逗号
   */
  delimiter?: string;

  /**
   * 是否包含表头，默认为true
   */
  header?: boolean;

  /**
   * 引号字符，默认为双引号
   */
  quoteChar?: string;

  /**
   * 行结束符，默认为\n
   */
  lineEnd?: string;

  /**
   * 是否跳过空行，默认为true
   */
  skipEmptyLines?: boolean;

  /**
   * 是否移除字段两端的空格，默认为true
   */
  trim?: boolean;
}

/**
 * CSV导出配置选项
 */
export interface CSVStringifyOptions {
  /**
   * 分隔符，默认为逗号
   */
  delimiter?: string;

  /**
   * 是否包含表头，默认为true
   */
  header?: boolean;

  /**
   * 引号字符，默认为双引号
   */
  quoteChar?: string;

  /**
   * 行结束符，默认为\n
   */
  lineEnd?: string;

  /**
   * 是否始终加引号，默认为false
   */
  quoteAllFields?: boolean;
}

/**
 * 默认的CSV解析配置
 */
const DEFAULT_PARSE_OPTIONS: CSVParseOptions = {
  delimiter: ",",
  header: true,
  quoteChar: '"',
  lineEnd: "\n",
  skipEmptyLines: true,
  trim: true,
};

/**
 * 默认的CSV导出配置
 */
const DEFAULT_STRINGIFY_OPTIONS: CSVStringifyOptions = {
  delimiter: ",",
  header: true,
  quoteChar: '"',
  lineEnd: "\n",
  quoteAllFields: false,
};

/**
 * 判断字段是否需要添加引号
 * @param field 字段值
 * @param options 配置选项
 * @returns 是否需要添加引号
 */
const shouldQuote = (field: string, options: CSVStringifyOptions): boolean => {
  if (options.quoteAllFields) {
    return true;
  }

  return (
    field.includes(options.delimiter!) ||
    field.includes(options.quoteChar!) ||
    field.includes("\n") ||
    field.includes("\r")
  );
};

/**
 * 转义字段中的引号
 * @param field 字段值
 * @param quoteChar 引号字符
 * @returns 转义后的字段值
 */
const escapeQuotes = (field: string, quoteChar: string): string => {
  return field.replace(new RegExp(quoteChar, "g"), quoteChar + quoteChar);
};

/**
 * 为字段添加引号
 * @param field 字段值
 * @param options 配置选项
 * @returns 添加引号后的字段值
 */
const quoteField = (field: string, options: CSVStringifyOptions): string => {
  const escapedField = escapeQuotes(field, options.quoteChar!);
  return `${options.quoteChar}${escapedField}${options.quoteChar}`;
};

/**
 * 将数组转换为CSV字符串行
 * @param row 行数据数组
 * @param options 配置选项
 * @returns CSV字符串行
 */
const rowToString = (row: string[], options: CSVStringifyOptions): string => {
  return row
    .map(field => {
      if (field === null || field === undefined) {
        return "";
      }

      const stringField = String(field);

      return shouldQuote(stringField, options) ? quoteField(stringField, options) : stringField;
    })
    .join(options.delimiter);
};

/**
 * 从字符串中解析CSV数据
 * @param csv CSV字符串
 * @param options 解析配置选项
 * @returns 解析后的数据
 */
export function parseCSV<T = Record<string, string>>(csv: string, options?: Partial<CSVParseOptions>): T[] {
  const opt = { ...DEFAULT_PARSE_OPTIONS, ...options };
  const rows = csv.split(new RegExp(`[\\r\\n]+\\s*`));

  if (opt.skipEmptyLines) {
    for (let i = rows.length - 1; i >= 0; i--) {
      if (!rows[i].trim()) {
        rows.splice(i, 1);
      }
    }
  }

  if (rows.length === 0) {
    return [];
  }

  const parseRow = (row: string): string[] => {
    const fields: string[] = [];
    let inQuote = false;
    let field = "";
    let i = 0;

    while (i < row.length) {
      const char = row[i];

      if (char === opt.quoteChar && (i === 0 || row[i - 1] !== opt.quoteChar)) {
        if (inQuote && row[i + 1] === opt.quoteChar) {
          field += char;
          i += 2;
          continue;
        }

        inQuote = !inQuote;
        i++;
        continue;
      }

      if (char === opt.delimiter && !inQuote) {
        fields.push(opt.trim ? field.trim() : field);
        field = "";
        i++;
        continue;
      }

      field += char;
      i++;
    }

    fields.push(opt.trim ? field.trim() : field);
    return fields;
  };

  const result: T[] = [];
  let headers: string[] = [];

  if (opt.header && rows.length > 0) {
    headers = parseRow(rows[0]);
    rows.shift();
  }

  for (const row of rows) {
    if (!row.trim() && opt.skipEmptyLines) {
      continue;
    }

    const fields = parseRow(row);

    if (opt.header) {
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        if (index < fields.length) {
          obj[header] = fields[index];
        }
      });
      result.push(obj as unknown as T);
    } else {
      result.push(fields as unknown as T);
    }
  }

  return result;
}

/**
 * 将数据转换为CSV字符串
 * @param data 要转换的数据
 * @param options 导出配置选项
 * @returns CSV字符串
 */
export function stringifyCSV<T>(data: T[], options?: Partial<CSVStringifyOptions>): string {
  if (data.length === 0) {
    return "";
  }

  const opt = { ...DEFAULT_STRINGIFY_OPTIONS, ...options };
  const rows: string[] = [];

  // 处理对象数组
  if (typeof data[0] === "object" && data[0] !== null && !Array.isArray(data[0])) {
    const headers = Object.keys(data[0] as Record<string, any>);

    if (opt.header) {
      rows.push(rowToString(headers, opt));
    }

    for (const item of data) {
      const row = headers.map(header => {
        const value = (item as Record<string, any>)[header];
        return value === null || value === undefined ? "" : String(value);
      });

      rows.push(rowToString(row, opt));
    }
  }
  // 处理二维数组
  else if (Array.isArray(data[0])) {
    for (const row of data) {
      if (Array.isArray(row)) {
        const stringRow = (row as any[]).map(field => (field === null || field === undefined ? "" : String(field)));
        rows.push(rowToString(stringRow, opt));
      }
    }
  }

  return rows.join(opt.lineEnd);
}

/**
 * 将CSV字符串转换为Blob对象，用于下载
 * @param csv CSV字符串
 * @param mimeType MIME类型，默认为text/csv
 * @returns Blob对象
 */
export function csvToBlob(csv: string, mimeType = "text/csv;charset=utf-8"): Blob {
  return new Blob([csv], { type: mimeType });
}

/**
 * 创建CSV文件下载链接
 * @param csv CSV字符串
 * @param filename 文件名
 * @returns 下载链接URL
 */
export function createCSVDownloadLink(csv: string, filename: string): string {
  const blob = csvToBlob(csv);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.style.display = "none";

  return url;
}

/**
 * 下载CSV文件
 * @param csv CSV字符串
 * @param filename 文件名
 */
export function downloadCSV(csv: string, filename: string): void {
  const url = createCSVDownloadLink(csv, filename);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();

  // 清理
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
