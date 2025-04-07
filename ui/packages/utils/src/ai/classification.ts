/**
 * 简单分类算法工具
 * 提供基础的文本分类和数据分类功能
 */

/**
 * 分类器选项
 */
export interface ClassifierOptions {
  /**
   * 是否区分大小写
   * @default false
   */
  caseSensitive?: boolean;

  /**
   * 分词器函数
   * @default 按空格分词
   */
  tokenizer?: (text: string) => string[];

  /**
   * 停用词列表
   */
  stopWords?: string[];
}

/**
 * 分类结果
 */
export interface ClassificationResult<T> {
  /**
   * 分类标签
   */
  label: T;

  /**
   * 置信度得分 (0-1)
   */
  confidence: number;
}

/**
 * 朴素贝叶斯分类器
 */
export class NaiveBayesClassifier<T extends string | number = string> {
  private classes: Map<T, Map<string, number>> = new Map();
  private classCounts: Map<T, number> = new Map();
  private tokenCounts: Map<string, number> = new Map();
  private options: Required<ClassifierOptions>;
  private totalDocuments = 0;

  /**
   * 创建分类器实例
   * @param options 分类器选项
   */
  constructor(options: ClassifierOptions = {}) {
    this.options = {
      caseSensitive: options.caseSensitive ?? false,
      tokenizer: options.tokenizer ?? ((text: string) => text.split(/\s+/)),
      stopWords: options.stopWords ?? [],
    };
  }

  /**
   * 训练分类器
   * @param text 文本内容
   * @param label 分类标签
   */
  train(text: string, label: T): void {
    const tokens = this.tokenize(text);

    // 初始化类别频率表
    if (!this.classes.has(label)) {
      this.classes.set(label, new Map());
      this.classCounts.set(label, 0);
    }

    // 更新类别计数
    this.classCounts.set(label, (this.classCounts.get(label) || 0) + 1);
    this.totalDocuments++;

    // 更新词频
    for (const token of tokens) {
      // 更新全局词频
      this.tokenCounts.set(token, (this.tokenCounts.get(token) || 0) + 1);

      // 更新类别内词频
      const classTokens = this.classes.get(label)!;
      classTokens.set(token, (classTokens.get(token) || 0) + 1);
    }
  }

  /**
   * 对文本进行分类
   * @param text 待分类文本
   * @param options 分类选项
   * @returns 分类结果
   */
  classify(
    text: string,
    options?: {
      /**
       * 是否返回多个结果
       */
      multiResult?: boolean;
      /**
       * 返回结果的数量（当multiResult为true时有效）
       */
      limit?: number;
    },
  ): ClassificationResult<T> | ClassificationResult<T>[] {
    const tokens = this.tokenize(text);
    const scores = new Map<T, number>();
    const { multiResult = false, limit = 3 } = options || {};

    // 为每个类别计算分数
    for (const [className, classTokens] of this.classes.entries()) {
      // 先验概率 P(C)
      const classPrior = Math.log((this.classCounts.get(className) || 0) / this.totalDocuments);

      // 计算条件概率 P(F|C)
      let score = classPrior;

      for (const token of tokens) {
        if (token.trim() === "") continue;

        // 拉普拉斯平滑
        const tokenFreqInClass = classTokens.get(token) || 0;
        const classSize = Array.from(classTokens.values()).reduce((sum, freq) => sum + freq, 0);
        const vocabularySize = this.tokenCounts.size;

        // 计算平滑后的条件概率
        const condProb = (tokenFreqInClass + 1) / (classSize + vocabularySize);
        score += Math.log(condProb);
      }

      scores.set(className, score);
    }

    // 获取最高分数或多个结果
    if (multiResult) {
      // 将分数转换为正规化的置信度
      const results: ClassificationResult<T>[] = [];
      const entries = Array.from(scores.entries());

      // 归一化得分
      const maxScore = Math.max(...entries.map(([_, score]) => score));

      entries.forEach(([label, score]) => {
        // 将对数概率转换为置信度
        const confidence =
          Math.exp(score - maxScore) / entries.reduce((sum, [_, s]) => sum + Math.exp(s - maxScore), 0);

        results.push({ label, confidence });
      });

      return results.sort((a, b) => b.confidence - a.confidence).slice(0, limit);
    } else {
      // 获取最高分数的类别
      let maxLabel = Array.from(scores.keys())[0];
      let maxScore = scores.get(maxLabel) || -Infinity;

      for (const [label, score] of scores.entries()) {
        if (score > maxScore) {
          maxScore = score;
          maxLabel = label;
        }
      }

      // 计算置信度
      const totalScore = Array.from(scores.values()).reduce((sum, score) => sum + Math.exp(score - maxScore), 0);
      const confidence = 1 / totalScore;

      return { label: maxLabel, confidence };
    }
  }

  /**
   * 从文本提取标记
   * @param text 文本
   * @returns 标记数组
   */
  private tokenize(text: string): string[] {
    if (!this.options.caseSensitive) {
      text = text.toLowerCase();
    }

    return this.options
      .tokenizer(text)
      .filter(token => token.trim() !== "")
      .filter(token => !this.options.stopWords.includes(token));
  }

  /**
   * 导出分类器模型
   * @returns 序列化的模型数据
   */
  export(): string {
    const data = {
      classes: Array.from(this.classes.entries()).map(([className, tokens]) => ({
        name: className,
        tokens: Array.from(tokens.entries()),
      })),
      classCounts: Array.from(this.classCounts.entries()),
      tokenCounts: Array.from(this.tokenCounts.entries()),
      totalDocuments: this.totalDocuments,
      options: this.options,
    };

    return JSON.stringify(data);
  }

  /**
   * 导入分类器模型
   * @param json 序列化的模型数据
   */
  import(json: string): void {
    const data = JSON.parse(json);

    this.classes = new Map(data.classes.map((cls: any) => [cls.name, new Map(cls.tokens)]));

    this.classCounts = new Map(data.classCounts);
    this.tokenCounts = new Map(data.tokenCounts);
    this.totalDocuments = data.totalDocuments;
    this.options = data.options;
  }
}

/**
 * K最近邻(KNN)分类器
 */
export class KNNClassifier<T extends string | number = string> {
  private samples: Array<{ features: number[]; label: T }> = [];

  /**
   * 添加训练样本
   * @param features 特征向量
   * @param label 分类标签
   */
  addExample(features: number[], label: T): void {
    this.samples.push({ features, label });
  }

  /**
   * 对特征向量进行分类
   * @param features 待分类的特征向量
   * @param k 邻居数量
   */
  classify(features: number[], k: number = 3): ClassificationResult<T> | null {
    if (this.samples.length === 0) {
      return null;
    }

    // 计算与每个样本的距离
    const distances = this.samples.map(sample => ({
      label: sample.label,
      distance: this.euclideanDistance(features, sample.features),
    }));

    // 排序并选择k个最近邻
    const nearestNeighbors = distances.sort((a, b) => a.distance - b.distance).slice(0, k);

    // 计票
    const votes = new Map<T, number>();
    for (const neighbor of nearestNeighbors) {
      votes.set(neighbor.label, (votes.get(neighbor.label) || 0) + 1);
    }

    // 找出得票最多的类别
    let maxLabel = nearestNeighbors[0].label;
    let maxVotes = votes.get(maxLabel) || 0;

    for (const [label, voteCount] of votes.entries()) {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        maxLabel = label;
      }
    }

    // 计算置信度
    const confidence = maxVotes / k;

    return { label: maxLabel, confidence };
  }

  /**
   * 计算欧氏距离
   */
  private euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error("特征向量长度不匹配");
    }

    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  }
}

/**
 * 简单决策树分类器
 */
export class SimpleDecisionTree<T extends string | number = string> {
  // 决策树实现...
  // 注：完整实现需要更复杂的逻辑，这里仅作为示例
}

// 同时提供命名空间对象
export const classification = {
  NaiveBayesClassifier,
  KNNClassifier,
  SimpleDecisionTree,
};

// 默认导出命名空间对象
export default classification;
