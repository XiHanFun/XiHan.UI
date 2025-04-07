/**
 * 流式文件处理工具
 * 提供基于流API的高效文件处理功能
 */

/**
 * 流处理选项
 */
export interface StreamOptions {
  /**
   * 分块大小（字节）
   * @default 1024 * 1024 (1MB)
   */
  chunkSize?: number;

  /**
   * 进度回调
   */
  onProgress?: (progress: number) => void;

  /**
   * 数据块处理回调
   */
  onChunk?: (chunk: Uint8Array, chunkIndex: number) => void;

  /**
   * 错误处理回调
   */
  onError?: (error: Error) => void;

  /**
   * 处理完成回调
   */
  onComplete?: () => void;

  /**
   * 取消信号
   */
  signal?: AbortSignal;
}

/**
 * 流转换选项
 */
export interface StreamTransformOptions extends StreamOptions {
  /**
   * 转换函数
   */
  transform: (chunk: Uint8Array) => Uint8Array | Promise<Uint8Array>;
}

/**
 * 流过滤选项
 */
export interface StreamFilterOptions extends StreamOptions {
  /**
   * 过滤函数
   */
  filter: (chunk: Uint8Array, index: number) => boolean | Promise<boolean>;
}

/**
 * 检查浏览器是否支持流API
 * @returns 是否支持流API
 */
export const isStreamSupported = (): boolean => {
  return (
    typeof ReadableStream !== "undefined" &&
    typeof WritableStream !== "undefined" &&
    typeof TransformStream !== "undefined"
  );
};

/**
 * 将文件转换为可读流
 * @param file 文件对象
 * @param options 流处理选项
 * @returns 可读流
 */
export const fileToReadableStream = (file: File, options: StreamOptions = {}): ReadableStream<Uint8Array> => {
  if (!isStreamSupported()) {
    throw new Error("您的浏览器不支持流API");
  }

  const {
    chunkSize = 1024 * 1024, // 默认1MB
    onProgress,
    onChunk,
    onError,
    onComplete,
    signal,
  } = options;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      const reader = new FileReader();
      let offset = 0;
      let chunkIndex = 0;

      // 检查是否已取消
      const checkCancellation = () => {
        if (signal && signal.aborted) {
          controller.close();
          return true;
        }
        return false;
      };

      // 读取下一个数据块
      const readNextChunk = () => {
        if (checkCancellation()) return;

        if (offset >= file.size) {
          controller.close();
          if (onComplete) onComplete();
          return;
        }

        // 计算当前块的大小
        const currentChunkSize = Math.min(chunkSize, file.size - offset);
        const blob = file.slice(offset, offset + currentChunkSize);

        reader.readAsArrayBuffer(blob);
      };

      // 数据块加载完成
      reader.onload = e => {
        if (checkCancellation()) return;

        if (reader.result) {
          const chunk = new Uint8Array(reader.result as ArrayBuffer);
          controller.enqueue(chunk);

          // 调用块处理回调
          if (onChunk) onChunk(chunk, chunkIndex);

          // 更新进度
          offset += chunk.byteLength;
          if (onProgress) onProgress(offset / file.size);

          chunkIndex++;
          readNextChunk();
        }
      };

      // 处理错误
      reader.onerror = e => {
        const error = new Error("读取文件流失败");
        if (onError) onError(error);
        controller.error(error);
      };

      // 开始读取第一个块
      readNextChunk();
    },

    cancel() {
      // 流被取消时的清理工作
    },
  });
};

/**
 * 将流转换为Blob对象
 * @param stream 可读流
 * @param options 流处理选项
 * @returns Blob对象
 */
export const streamToBlob = async (stream: ReadableStream<Uint8Array>, options: StreamOptions = {}): Promise<Blob> => {
  if (!isStreamSupported()) {
    throw new Error("您的浏览器不支持流API");
  }

  const { onProgress, onComplete, signal } = options;

  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  const reader = stream.getReader();

  try {
    while (true) {
      // 检查是否已取消
      if (signal && signal.aborted) {
        throw new Error("操作已取消");
      }

      const { done, value } = await reader.read();

      if (done) break;

      if (value) {
        chunks.push(value);
        totalSize += value.byteLength;

        if (onProgress) onProgress(totalSize);
      }
    }

    if (onComplete) onComplete();

    return new Blob(chunks);
  } finally {
    reader.releaseLock();
  }
};

/**
 * 将流转换为文件对象
 * @param stream 可读流
 * @param filename 文件名
 * @param mimeType MIME类型
 * @param options 流处理选项
 * @returns 文件对象
 */
export const streamToFile = async (
  stream: ReadableStream<Uint8Array>,
  filename: string,
  mimeType: string,
  options: StreamOptions = {},
): Promise<File> => {
  const blob = await streamToBlob(stream, options);
  return new File([blob], filename, { type: mimeType });
};

/**
 * 将流保存为下载文件
 * @param stream 可读流
 * @param filename 文件名
 * @param mimeType MIME类型
 * @param options 流处理选项
 */
export const saveStreamAsFile = async (
  stream: ReadableStream<Uint8Array>,
  filename: string,
  mimeType: string,
  options: StreamOptions = {},
): Promise<void> => {
  const blob = await streamToBlob(stream, options);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);

  a.click();

  // 清理
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * 使用转换函数处理流数据
 * @param inputStream 输入流
 * @param options 转换选项
 * @returns 转换后的可读流
 */
export const transformStream = (
  inputStream: ReadableStream<Uint8Array>,
  options: StreamTransformOptions,
): ReadableStream<Uint8Array> => {
  if (!isStreamSupported()) {
    throw new Error("您的浏览器不支持流API");
  }

  const { transform, onProgress, onError, signal } = options;

  let processedBytes = 0;
  let totalBytes = 0;

  // 创建转换流
  const transformer = new TransformStream<Uint8Array, Uint8Array>({
    async transform(chunk, controller) {
      try {
        // 检查是否已取消
        if (signal && signal.aborted) {
          controller.terminate();
          return;
        }

        // 应用转换
        const transformedChunk = await transform(chunk);

        // 更新进度
        processedBytes += chunk.byteLength;
        if (onProgress) onProgress(processedBytes / totalBytes);

        // 输出转换后的块
        controller.enqueue(transformedChunk);
      } catch (err) {
        if (onError) onError(err as Error);
        controller.error(err);
      }
    },
  });

  // 为了计算进度，我们需要先计算总大小
  if (onProgress) {
    // 此计算在背景中进行
    (async () => {
      try {
        const reader = inputStream.tee()[1].getReader();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          if (value) {
            totalBytes += value.byteLength;
          }
        }
      } catch (err) {
        console.error("计算流大小时出错:", err);
      }
    })();
  }

  return inputStream.pipeThrough(transformer);
};

/**
 * 过滤流数据
 * @param inputStream 输入流
 * @param options 过滤选项
 * @returns 过滤后的可读流
 */
export const filterStream = (
  inputStream: ReadableStream<Uint8Array>,
  options: StreamFilterOptions,
): ReadableStream<Uint8Array> => {
  if (!isStreamSupported()) {
    throw new Error("您的浏览器不支持流API");
  }

  const { filter, onProgress, onError, signal } = options;

  let processedBytes = 0;
  let totalBytes = 0;
  let chunkIndex = 0;

  // 创建转换流
  const transformer = new TransformStream<Uint8Array, Uint8Array>({
    async transform(chunk, controller) {
      try {
        // 检查是否已取消
        if (signal && signal.aborted) {
          controller.terminate();
          return;
        }

        // 应用过滤
        const shouldInclude = await filter(chunk, chunkIndex++);

        // 更新进度
        processedBytes += chunk.byteLength;
        if (onProgress) onProgress(processedBytes / totalBytes);

        // 如果过滤结果为真，则保留此块
        if (shouldInclude) {
          controller.enqueue(chunk);
        }
      } catch (err) {
        if (onError) onError(err as Error);
        controller.error(err);
      }
    },
  });

  // 为了计算进度，我们需要先计算总大小
  if (onProgress) {
    // 此计算在背景中进行
    (async () => {
      try {
        const reader = inputStream.tee()[1].getReader();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          if (value) {
            totalBytes += value.byteLength;
          }
        }
      } catch (err) {
        console.error("计算流大小时出错:", err);
      }
    })();
  }

  return inputStream.pipeThrough(transformer);
};

/**
 * 流式分析文件内容，无需一次性加载整个文件
 * @param file 文件对象
 * @param analyzer 分析函数，接收数据块并返回分析结果
 * @param options 流处理选项
 * @returns 分析结果
 */
export const analyzeFileStream = async <T>(
  file: File,
  analyzer: (stream: ReadableStream<Uint8Array>) => Promise<T>,
  options: StreamOptions = {},
): Promise<T> => {
  const stream = fileToReadableStream(file, options);
  return await analyzer(stream);
};

/**
 * 对流进行加密
 * @param inputStream 输入流
 * @param key 加密密钥
 * @param options 流处理选项
 * @returns 加密后的流
 */
export const encryptStream = async (
  inputStream: ReadableStream<Uint8Array>,
  key: CryptoKey,
  options: StreamOptions = {},
): Promise<ReadableStream<Uint8Array>> => {
  if (!isStreamSupported() || !window.crypto || !window.crypto.subtle) {
    throw new Error("您的浏览器不支持必要的加密API");
  }

  // 生成初始化向量
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  return transformStream(inputStream, {
    ...options,
    async transform(chunk) {
      const encryptedData = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, chunk);

      // 第一个块需要包含IV
      if (options.onChunk && (options as any).isFirstChunk) {
        const resultWithIV = new Uint8Array(iv.length + encryptedData.byteLength);
        resultWithIV.set(iv, 0);
        resultWithIV.set(new Uint8Array(encryptedData), iv.length);
        (options as any).isFirstChunk = false;
        return resultWithIV;
      }

      return new Uint8Array(encryptedData);
    },
  });
};

/**
 * 对流进行解密
 * @param inputStream 输入流
 * @param key 解密密钥
 * @param options 流处理选项
 * @returns 解密后的流
 */
export const decryptStream = async (
  inputStream: ReadableStream<Uint8Array>,
  key: CryptoKey,
  options: StreamOptions = {},
): Promise<ReadableStream<Uint8Array>> => {
  if (!isStreamSupported() || !window.crypto || !window.crypto.subtle) {
    throw new Error("您的浏览器不支持必要的加密API");
  }

  let iv: Uint8Array | null = null;

  return transformStream(inputStream, {
    ...options,
    async transform(chunk) {
      // 第一个块包含IV
      if (!iv) {
        iv = chunk.slice(0, 12);
        chunk = chunk.slice(12);
      }

      if (!iv) {
        throw new Error("无效的加密数据：缺少初始化向量");
      }

      const decryptedData = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, chunk);

      return new Uint8Array(decryptedData);
    },
  });
};

/**
 * 串联多个流
 * @param streams 流数组
 * @returns 合并后的流
 */
export const concatStreams = (streams: ReadableStream<Uint8Array>[]): ReadableStream<Uint8Array> => {
  if (!isStreamSupported()) {
    throw new Error("您的浏览器不支持流API");
  }

  if (streams.length === 0) {
    return new ReadableStream();
  }

  if (streams.length === 1) {
    return streams[0];
  }

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (const stream of streams) {
          const reader = stream.getReader();

          try {
            while (true) {
              const { done, value } = await reader.read();

              if (done) break;

              if (value) {
                controller.enqueue(value);
              }
            }
          } finally {
            reader.releaseLock();
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
};

/**
 * 将文本流转换为行流，按行处理大型文本文件
 * @param textStream 文本数据流
 * @returns 行数据流
 */
export const streamTextByLine = (textStream: ReadableStream<Uint8Array>): ReadableStream<string> => {
  if (!isStreamSupported()) {
    throw new Error("您的浏览器不支持流API");
  }

  let buffer = "";
  const decoder = new TextDecoder();

  return textStream.pipeThrough(
    new TransformStream<Uint8Array, string>({
      transform(chunk, controller) {
        // 解码当前块并添加到缓冲区
        buffer += decoder.decode(chunk, { stream: true });

        // 查找完整的行
        const lines = buffer.split("\n");

        // 保留最后一行（可能不完整）
        buffer = lines.pop() || "";

        // 输出完整的行
        for (const line of lines) {
          controller.enqueue(line);
        }
      },

      flush(controller) {
        // 处理最后的数据
        const finalChunk = decoder.decode();
        buffer += finalChunk;

        if (buffer) {
          controller.enqueue(buffer);
        }
      },
    }),
  );
};

// 同时提供命名空间对象
export const streamingUtils = {
  isStreamSupported,
  fileToReadableStream,
  streamToBlob,
  streamToFile,
  saveStreamAsFile,
  transformStream,
  filterStream,
  analyzeFileStream,
  encryptStream,
  decryptStream,
  concatStreams,
  streamTextByLine,
};

// 默认导出命名空间对象
export default streamingUtils;
