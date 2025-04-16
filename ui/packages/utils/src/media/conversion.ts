/**
 * 文件格式转换工具
 * 提供常见文件格式之间的转换功能
 */

/**
 * 转换选项接口
 */
export interface ConversionOptions {
  /**
   * 转换质量 (0-1)，适用于有损转换
   * @default 0.8
   */
  quality?: number;

  /**
   * 转换进度回调
   */
  onProgress?: (progress: number) => void;

  /**
   * 自定义输出文件名
   */
  outputFilename?: string;

  /**
   * 保留的元数据字段列表
   */
  preserveMetadata?: string[];
}

/**
 * 图片格式转换选项
 */
export interface ImageConversionOptions extends ConversionOptions {
  /**
   * 目标宽度
   */
  width?: number;

  /**
   * 目标高度
   */
  height?: number;

  /**
   * 是否保持宽高比
   * @default true
   */
  maintainAspectRatio?: boolean;

  /**
   * 缩放方法
   * @default 'contain'
   */
  resizeMode?: "contain" | "cover" | "stretch";
}

/**
 * 音频转换选项
 */
export interface AudioConversionOptions extends ConversionOptions {
  /**
   * 音频比特率
   */
  bitRate?: number;

  /**
   * 声道数
   */
  channels?: number;

  /**
   * 采样率
   */
  sampleRate?: number;
}

/**
 * 支持的图片格式
 */
export type ImageFormat = "jpeg" | "png" | "webp" | "gif" | "avif" | "bmp";

/**
 * 将图片转换为指定格式
 * @param file 源图片文件
 * @param format 目标格式
 * @param options 转换选项
 * @returns 转换后的文件对象
 */
export async function convertImage(
  file: File,
  format: ImageFormat,
  options: ImageConversionOptions = {},
): Promise<File> {
  // 验证输入是否为图片
  if (!file.type.startsWith("image/")) {
    throw new Error("输入文件不是图片格式");
  }

  const {
    quality = 0.8,
    width,
    height,
    maintainAspectRatio = true,
    resizeMode = "contain",
    onProgress,
    outputFilename,
    preserveMetadata,
  } = options;

  // 确定输出MIME类型
  const mimeTypes = {
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
    bmp: "image/bmp",
  };

  const outputType = mimeTypes[format];

  // 如果浏览器不支持某些格式（如AVIF），抛出错误
  const canvas = document.createElement("canvas");
  const supportsFormat = canvas.toDataURL(outputType).indexOf(outputType) > -1;
  if (!supportsFormat) {
    throw new Error(`浏览器不支持转换为 ${format} 格式`);
  }

  return new Promise((resolve, reject) => {
    // 创建图片元素
    const img = new Image();

    // 进度回调
    if (onProgress) onProgress(0.1);

    img.onload = () => {
      try {
        // 计算尺寸
        let targetWidth = width || img.width;
        let targetHeight = height || img.height;

        if (maintainAspectRatio && (width || height)) {
          const imageRatio = img.width / img.height;

          if (width && height) {
            // 根据调整模式处理
            if (resizeMode === "contain") {
              const containerRatio = width / height;
              if (imageRatio > containerRatio) {
                targetWidth = width;
                targetHeight = width / imageRatio;
              } else {
                targetHeight = height;
                targetWidth = height * imageRatio;
              }
            } else if (resizeMode === "cover") {
              const containerRatio = width / height;
              if (imageRatio > containerRatio) {
                targetHeight = height;
                targetWidth = height * imageRatio;
              } else {
                targetWidth = width;
                targetHeight = width / imageRatio;
              }
            }
            // 'stretch' 模式不需要额外处理
          } else if (width) {
            targetHeight = width / imageRatio;
          } else if (height) {
            targetWidth = height * imageRatio;
          }
        }

        // 设置canvas尺寸
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("无法创建Canvas上下文"));
          return;
        }

        // 绘制图像
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        if (onProgress) onProgress(0.7);

        // 转换为指定格式
        canvas.toBlob(
          blob => {
            if (!blob) {
              reject(new Error("转换失败"));
              return;
            }

            if (onProgress) onProgress(0.9);

            // 生成文件名
            let filename = outputFilename;
            if (!filename) {
              const originalName = file.name.split(".");
              originalName.pop(); // 移除原始扩展名
              filename = `${originalName.join(".")}.${format}`;
            }

            // 创建新文件
            const convertedFile = new File([blob], filename, {
              type: outputType,
              lastModified: file.lastModified,
            });

            if (onProgress) onProgress(1.0);
            resolve(convertedFile);
          },
          outputType,
          quality,
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error("图片加载失败"));
    };

    // 加载图片
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

/**
 * 将图片转换为Base64数据URL
 * @param file 图片文件
 * @param options 转换选项
 * @returns Base64数据URL
 */
export async function imageToDataURL(file: File, options: ImageConversionOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("转换失败"));
        return;
      }

      // 如果需要调整大小，加载图像并使用canvas调整
      if (options.width || options.height) {
        const img = new Image();
        img.onload = () => {
          // 计算尺寸（复用转换逻辑）
          const { width, height } = options;
          let targetWidth = width || img.width;
          let targetHeight = height || img.height;

          if (options.maintainAspectRatio !== false && (width || height)) {
            const imageRatio = img.width / img.height;

            if (width && height) {
              const resizeMode = options.resizeMode || "contain";
              const containerRatio = width / height;

              if (resizeMode === "contain") {
                if (imageRatio > containerRatio) {
                  targetWidth = width;
                  targetHeight = width / imageRatio;
                } else {
                  targetHeight = height;
                  targetWidth = height * imageRatio;
                }
              } else if (resizeMode === "cover") {
                if (imageRatio > containerRatio) {
                  targetHeight = height;
                  targetWidth = height * imageRatio;
                } else {
                  targetWidth = width;
                  targetHeight = width / imageRatio;
                }
              }
            } else if (width) {
              targetHeight = width / imageRatio;
            } else if (height) {
              targetWidth = height * imageRatio;
            }
          }

          // 创建canvas并调整大小
          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("无法创建Canvas上下文"));
            return;
          }

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // 获取调整大小后的dataURL
          const quality = options.quality || 0.8;
          resolve(canvas.toDataURL(file.type, quality));
        };

        img.onerror = () => reject(new Error("图片加载失败"));
        img.src = reader.result;
      } else {
        // 不需要调整大小，直接返回
        resolve(reader.result);
      }
    };

    reader.onerror = () => {
      reject(new Error("读取文件失败"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 将Base64数据URL转换为文件对象
 * @param dataURL Base64数据URL
 * @param filename 文件名
 * @returns 文件对象
 */
export async function dataURLToFile(dataURL: string, filename: string): Promise<File> {
  // 解析数据URL
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  // 转换为二进制数据
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * 从canvas创建文件对象
 * @param canvas Canvas元素
 * @param filename 文件名
 * @param mimeType MIME类型
 * @param quality 质量 (0-1)
 * @returns Promise<File>
 */
export async function canvasToFile(
  canvas: HTMLCanvasElement,
  filename: string,
  mimeType: string = "image/png",
  quality: number = 0.8,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error("Canvas转换为Blob失败"));
          return;
        }

        const file = new File([blob], filename, { type: mimeType });
        resolve(file);
      },
      mimeType,
      quality,
    );
  });
}

/**
 * 将HTML转换为PDF
 * @param element HTML元素或选择器
 * @param options 转换选项
 * @returns 转换后的PDF文件
 */
export async function htmlToPdf(element: HTMLElement | string, options: ConversionOptions = {}): Promise<File> {
  // 注意：此功能需要引入额外的库如html2pdf.js, jsPDF等
  // 本示例仅提供接口结构
  // 在实际实现中，需要添加依赖库处理
  throw new Error("HTML转PDF功能需要额外的库支持");
}

/**
 * 将JSON对象转换为CSV文件
 * @param data JSON数据对象数组
 * @param options 转换选项
 * @returns CSV文件对象
 */
export async function jsonToCsv(data: Record<string, any>[], options: ConversionOptions = {}): Promise<File> {
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error("数据不能为空");
  }

  const { outputFilename = "data.csv" } = options;

  // 获取所有可能的标题
  const headers = Array.from(
    new Set(
      data.reduce<string[]>((allKeys, obj) => {
        return [...allKeys, ...Object.keys(obj)];
      }, []),
    ),
  );

  // 创建CSV内容
  const csvRows = [
    // 标题行
    headers.join(","),
    // 数据行
    ...data.map(obj =>
      headers
        .map(header => {
          const value = obj[header];
          // 处理特殊字符
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          // 如果包含逗号、引号或换行符，需要引号括起来
          if (/[",\n\r]/.test(stringValue)) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(","),
    ),
  ];

  const csvContent = csvRows.join("\n");

  // 创建CSV文件
  return new File([csvContent], outputFilename, {
    type: "text/csv;charset=utf-8",
  });
}

/**
 * 将CSV转换为JSON对象数组
 * @param file CSV文件
 * @returns 解析后的JSON对象数组
 */
export async function csvToJson(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("读取文件失败"));
        return;
      }

      try {
        const csvContent = reader.result;
        const lines = csvContent.split(/\r\n|\n/);

        // 解析标题行
        const headers = lines[0].split(",").map(header =>
          // 移除可能的引号
          header.replace(/^"(.*)"$/, "$1"),
        );

        // 解析数据行
        const jsonData = lines
          .slice(1)
          .filter(line => line.trim() !== "") // 跳过空行
          .map(line => {
            const values = parseCsvLine(line);

            // 将值与标题对应
            const obj: Record<string, string> = {};
            headers.forEach((header, index) => {
              obj[header] = index < values.length ? values[index] : "";
            });

            return obj;
          });

        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error("读取文件失败"));
    };

    reader.readAsText(file);
  });
}

/**
 * 解析CSV行，处理引号内的特殊字符
 * @param line CSV行
 * @returns 解析后的值数组
 */
function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // 处理引号
      if (inQuotes && i < line.length - 1 && line[i + 1] === '"') {
        // 双引号处理为单引号
        current += '"';
        i++; // 跳过下一个引号
      } else {
        // 切换引号状态
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // 当不在引号内遇到逗号时，添加当前值并重置
      values.push(current);
      current = "";
    } else {
      // 其他字符直接添加
      current += char;
    }
  }

  // 添加最后一个值
  values.push(current);

  return values;
}

/**
 * 将文件转换为ArrayBuffer
 * @param file 文件对象
 * @returns ArrayBuffer
 */
export async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("转换失败"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 将ArrayBuffer转换为文件
 * @param buffer ArrayBuffer数据
 * @param filename 文件名
 * @param mimeType MIME类型
 * @returns 文件对象
 */
export const arrayBufferToFile = (buffer: ArrayBuffer, filename: string, mimeType: string): File => {
  return new File([buffer], filename, { type: mimeType });
};
