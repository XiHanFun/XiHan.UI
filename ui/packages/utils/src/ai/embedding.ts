/**
 * 文本嵌入和相似度计算工具
 * 提供向量化表示和语义相似度计算功能
 */

/**
 * 向量类型别名
 */
export type Vector = number[];

/**
 * 嵌入模型接口
 */
export interface EmbeddingModel {
  /**
   * 获取模型名称
   */
  readonly name: string;

  /**
   * 嵌入文本
   * @param text 输入文本
   * @returns 文本的向量表示
   */
  embed(text: string): Promise<Vector>;

  /**
   * 批量嵌入文本
   * @param texts 输入文本数组
   * @returns 文本向量数组
   */
  embedBatch(texts: string[]): Promise<Vector[]>;

  /**
   * 获取模型输出向量维度
   */
  readonly dimensions: number;
}

/**
 * 相似度计算方法
 */
export type SimilarityMethod = "cosine" | "euclidean" | "dot" | "manhattan" | "jaccard";

/**
 * 嵌入配置选项
 */
export interface EmbeddingOptions {
  /**
   * 模型类型
   */
  modelType?: "tfidf" | "bowAverage" | "customEndpoint";

  /**
   * 自定义端点URL (当modelType为customEndpoint时使用)
   */
  endpointUrl?: string;

  /**
   * 自定义API密钥 (当modelType为customEndpoint时使用)
   */
  apiKey?: string;

  /**
   * 为tfidf模型提供的词汇表
   */
  vocabulary?: string[];

  /**
   * 文档最大长度
   */
  maxLength?: number;

  /**
   * 文本预处理函数
   */
  preprocessor?: (text: string) => string;
}

/**
 * 文本嵌入管理器
 */
export class EmbeddingManager {
  private models: Map<string, EmbeddingModel> = new Map();
  private defaultModel: string | null = null;

  /**
   * 注册嵌入模型
   * @param model 嵌入模型
   * @param isDefault 是否设为默认模型
   */
  registerModel(model: EmbeddingModel, isDefault: boolean = false): void {
    this.models.set(model.name, model);

    if (isDefault || this.defaultModel === null) {
      this.defaultModel = model.name;
    }
  }

  /**
   * 设置默认模型
   * @param modelName 模型名称
   */
  setDefaultModel(modelName: string): void {
    if (!this.models.has(modelName)) {
      throw new Error(`模型 "${modelName}" 未注册`);
    }
    this.defaultModel = modelName;
  }

  /**
   * 获取模型
   * @param modelName 模型名称，如果未指定则使用默认模型
   */
  getModel(modelName?: string): EmbeddingModel {
    const name = modelName || this.defaultModel;

    if (!name) {
      throw new Error("没有可用的嵌入模型");
    }

    const model = this.models.get(name);
    if (!model) {
      throw new Error(`模型 "${name}" 未注册`);
    }

    return model;
  }

  /**
   * 嵌入文本
   * @param text 输入文本
   * @param modelName 模型名称（可选）
   */
  async embedText(text: string, modelName?: string): Promise<Vector> {
    const model = this.getModel(modelName);
    return await model.embed(text);
  }

  /**
   * 批量嵌入文本
   * @param texts 输入文本数组
   * @param modelName 模型名称（可选）
   */
  async embedTexts(texts: string[], modelName?: string): Promise<Vector[]> {
    const model = this.getModel(modelName);
    return await model.embedBatch(texts);
  }

  /**
   * 计算文本相似度
   * @param text1 第一个文本
   * @param text2 第二个文本
   * @param method 相似度计算方法
   * @param modelName 模型名称（可选）
   */
  async textSimilarity(
    text1: string,
    text2: string,
    method: SimilarityMethod = "cosine",
    modelName?: string,
  ): Promise<number> {
    const model = this.getModel(modelName);
    const [embedding1, embedding2] = await Promise.all([model.embed(text1), model.embed(text2)]);

    return calculateSimilarity(embedding1, embedding2, method);
  }

  /**
   * 计算多个文本与查询文本的相似度
   * @param query 查询文本
   * @param texts 文本数组
   * @param method 相似度计算方法
   * @param modelName 模型名称（可选）
   * @returns 相似度得分数组，按输入顺序
   */
  async searchSimilar(
    query: string,
    texts: string[],
    method: SimilarityMethod = "cosine",
    modelName?: string,
  ): Promise<Array<{ index: number; score: number; text: string }>> {
    const model = this.getModel(modelName);

    // 嵌入查询文本
    const queryEmbedding = await model.embed(query);

    // 嵌入所有文本
    const embeddings = await model.embedBatch(texts);

    // 计算相似度并排序
    const results = embeddings.map((embedding, index) => ({
      index,
      score: calculateSimilarity(queryEmbedding, embedding, method),
      text: texts[index],
    }));

    // 按相似度降序排序
    return results.sort((a, b) => b.score - a.score);
  }
}

/**
 * 计算两个向量的相似度
 * @param vec1 第一个向量
 * @param vec2 第二个向量
 * @param method 相似度计算方法
 */
export function calculateSimilarity(vec1: Vector, vec2: Vector, method: SimilarityMethod = "cosine"): number {
  if (vec1.length !== vec2.length) {
    throw new Error("向量长度不一致");
  }

  switch (method) {
    case "cosine":
      return cosineSimilarity(vec1, vec2);
    case "euclidean":
      return 1 / (1 + euclideanDistance(vec1, vec2));
    case "dot":
      return dotProduct(vec1, vec2);
    case "manhattan":
      return 1 / (1 + manhattanDistance(vec1, vec2));
    case "jaccard":
      return jaccardSimilarity(vec1, vec2);
    default:
      throw new Error(`不支持的相似度计算方法: ${method}`);
  }
}

/**
 * 余弦相似度
 */
export function cosineSimilarity(vec1: Vector, vec2: Vector): number {
  const dot = dotProduct(vec1, vec2);
  const norm1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }

  return dot / (norm1 * norm2);
}

/**
 * 欧几里得距离
 */
export function euclideanDistance(vec1: Vector, vec2: Vector): number {
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * 点积
 */
export function dotProduct(vec1: Vector, vec2: Vector): number {
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    sum += vec1[i] * vec2[i];
  }
  return sum;
}

/**
 * 曼哈顿距离
 */
export function manhattanDistance(vec1: Vector, vec2: Vector): number {
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    sum += Math.abs(vec1[i] - vec2[i]);
  }
  return sum;
}

/**
 * Jaccard相似度
 */
export function jaccardSimilarity(vec1: Vector, vec2: Vector): number {
  // 将向量转换为集合（非零元素的索引）
  const set1 = new Set<number>();
  const set2 = new Set<number>();

  for (let i = 0; i < vec1.length; i++) {
    if (vec1[i] > 0) set1.add(i);
    if (vec2[i] > 0) set2.add(i);
  }

  // 计算交集大小
  const intersection = new Set<number>();
  for (const item of set1) {
    if (set2.has(item)) {
      intersection.add(item);
    }
  }

  // 计算并集大小
  const union = new Set<number>([...set1, ...set2]);

  if (union.size === 0) {
    return 0;
  }

  return intersection.size / union.size;
}

/**
 * TF-IDF 模型实现
 */
export class TfIdfModel implements EmbeddingModel {
  public readonly name: string = "tfidf";
  public readonly dimensions: number;

  private vocabulary: Map<string, number>;
  private documentFrequency: Map<string, number>;
  private documentCount: number = 0;
  private preprocessor: (text: string) => string;

  /**
   * 创建TF-IDF模型
   * @param options 配置选项
   */
  constructor(
    options: {
      vocabulary?: string[];
      preprocessor?: (text: string) => string;
    } = {},
  ) {
    // 初始化词汇表映射 (词 -> 索引)
    this.vocabulary = new Map();
    if (options.vocabulary) {
      options.vocabulary.forEach((word, index) => {
        this.vocabulary.set(word, index);
      });
    }

    this.dimensions = this.vocabulary.size || 0;
    this.documentFrequency = new Map();
    this.preprocessor =
      options.preprocessor ||
      ((text: string) => {
        return text
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, " ")
          .trim();
      });
  }

  /**
   * 拟合模型（计算IDF）
   * @param texts 文档集合
   */
  public fit(texts: string[]): void {
    this.documentCount = texts.length;

    // 如果词汇表为空，先从语料库构建
    if (this.vocabulary.size === 0) {
      const wordSet = new Set<string>();

      for (const text of texts) {
        const processed = this.preprocessor(text);
        const words = processed.split(/\s+/).filter(Boolean);

        for (const word of words) {
          wordSet.add(word);
        }
      }

      // 动态计算维度，避免直接修改只读属性
      const vocabArray = Array.from(wordSet).sort();
      vocabArray.forEach((word, index) => {
        this.vocabulary.set(word, index);
      });

      // 使用Object.defineProperty重新定义dimensions属性
      Object.defineProperty(this, "dimensions", {
        value: this.vocabulary.size,
        writable: false,
        configurable: true,
      });
    }

    // 计算每个词出现的文档频率
    for (const text of texts) {
      const processed = this.preprocessor(text);
      const words = processed.split(/\s+/).filter(Boolean);
      const uniqueWords = new Set(words);

      for (const word of uniqueWords) {
        if (!this.vocabulary.has(word)) continue;

        this.documentFrequency.set(word, (this.documentFrequency.get(word) || 0) + 1);
      }
    }
  }

  /**
   * 计算文本的TF-IDF向量
   * @param text 输入文本
   */
  public async embed(text: string): Promise<Vector> {
    const processed = this.preprocessor(text);
    const words = processed.split(/\s+/).filter(Boolean);

    // 创建词频统计
    const termFrequency: Map<string, number> = new Map();
    let maxFreq = 0;

    for (const word of words) {
      const freq = (termFrequency.get(word) || 0) + 1;
      termFrequency.set(word, freq);
      maxFreq = Math.max(maxFreq, freq);
    }

    // 创建向量并填充TF-IDF值
    const vector = new Array(this.dimensions).fill(0);

    for (const [word, tf] of termFrequency.entries()) {
      const index = this.vocabulary.get(word);
      if (index === undefined) continue;

      const normalizedTf = tf / maxFreq;
      let idf = 1; // 平滑处理，避免未见词的情况

      if (this.documentFrequency.has(word) && this.documentCount > 0) {
        const df = this.documentFrequency.get(word) || 0;
        idf = Math.log(this.documentCount / (df + 1)) + 1;
      }

      vector[index] = normalizedTf * idf;
    }

    return vector;
  }

  /**
   * 批量计算文本的TF-IDF向量
   * @param texts 输入文本数组
   */
  public async embedBatch(texts: string[]): Promise<Vector[]> {
    return Promise.all(texts.map(text => this.embed(text)));
  }
}

/**
 * 简单词袋平均模型
 */
export class BowAverageModel implements EmbeddingModel {
  public readonly name: string = "bowAverage";
  public readonly dimensions: number;

  private wordVectors: Map<string, Vector>;
  private unknownVector: Vector;
  private preprocessor: (text: string) => string;

  /**
   * 创建词袋平均模型
   * @param options 配置选项
   */
  constructor(options: {
    wordVectors: Record<string, number[]>;
    dimensions?: number;
    preprocessor?: (text: string) => string;
  }) {
    this.wordVectors = new Map();

    for (const [word, vector] of Object.entries(options.wordVectors)) {
      this.wordVectors.set(word, vector);
    }

    // 安全地获取第一个向量的长度，避免undefined错误
    let firstVectorLength = 0;
    if (this.wordVectors.size > 0) {
      const firstVector = this.wordVectors.values().next().value;
      if (firstVector) {
        firstVectorLength = firstVector.length;
      }
    }

    this.dimensions = options.dimensions || firstVectorLength;

    // 创建未知词的向量（全零）
    this.unknownVector = new Array(this.dimensions).fill(0);

    this.preprocessor =
      options.preprocessor ||
      ((text: string) => {
        return text
          .toLowerCase()
          .replace(/[^\p{L}\p{N}]+/gu, " ")
          .trim();
      });
  }

  /**
   * 计算文本的词向量平均值
   * @param text 输入文本
   */
  public async embed(text: string): Promise<Vector> {
    const processed = this.preprocessor(text);
    const words = processed.split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      return this.unknownVector;
    }

    // 累加所有词向量
    const result = new Array(this.dimensions).fill(0);
    let validWordCount = 0;

    for (const word of words) {
      const vector = this.wordVectors.get(word) || this.unknownVector;

      // 如果不是全零向量，则计入有效词数
      if (vector.some(v => v !== 0)) {
        validWordCount++;

        for (let i = 0; i < this.dimensions; i++) {
          result[i] += vector[i];
        }
      }
    }

    // 计算平均值
    if (validWordCount > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        result[i] /= validWordCount;
      }
    }

    return result;
  }

  /**
   * 批量计算文本的词向量平均值
   * @param texts 输入文本数组
   */
  public async embedBatch(texts: string[]): Promise<Vector[]> {
    return Promise.all(texts.map(text => this.embed(text)));
  }
}

/**
 * 创建嵌入管理器
 */
export function createEmbeddingManager(): EmbeddingManager {
  return new EmbeddingManager();
}

/**
 * 创建TF-IDF模型
 * @param options 配置选项
 */
export function createTfIdfModel(options?: {
  vocabulary?: string[];
  preprocessor?: (text: string) => string;
}): TfIdfModel {
  return new TfIdfModel(options);
}

// 同时提供命名空间对象
export const embedding = {
  EmbeddingManager,
  createEmbeddingManager,
  TfIdfModel,
  BowAverageModel,
  calculateSimilarity,
  cosineSimilarity,
  euclideanDistance,
  dotProduct,
};

// 默认导出命名空间对象
export default embedding;
