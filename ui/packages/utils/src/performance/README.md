# 性能优化工具集

这个工具集提供了一系列用于优化前端应用性能的工具函数，包括节流、缓存、延迟加载、性能指标收集和空闲时间任务调度等。

## 安装

```bash
npm install @xihan/utils
```

## 使用方法

### 节流函数 (throttle.ts)

提供更强大的节流功能，可控制首次和末次执行，支持基于帧率的节流。

```typescript
import { performance } from "@xihan/utils";

// 基本用法
const throttledScroll = performance.throttle(() => {
  console.log("scroll event throttled");
}, 200);

window.addEventListener("scroll", throttledScroll);

// 高级用法 - 控制首次和末次执行
const throttledResize = performance.throttle(
  () => {
    console.log("resize event throttled");
  },
  {
    wait: 300,
    leading: true, // 首次触发立即执行
    trailing: true, // 最后一次触发后也执行
  },
);

window.addEventListener("resize", throttledResize);

// 基于帧率的节流
const throttledAnimation = performance.throttle(
  () => {
    console.log("animation throttled");
  },
  { fps: 30 },
); // 限制为每秒执行30次

requestAnimationFrame(function animate() {
  throttledAnimation();
  requestAnimationFrame(animate);
});
```

### 函数结果缓存 (memoize.ts)

提供高级缓存功能，支持自定义缓存策略、缓存大小限制和过期时间控制。

```typescript
import { performance } from "@xihan/utils";

// 基本用法
const expensiveCalculation = (a: number, b: number) => {
  console.log("Calculating...");
  return a + b;
};

const memoizedCalculation = performance.memoize(expensiveCalculation);

memoizedCalculation(1, 2); // 输出: Calculating... 然后返回 3
memoizedCalculation(1, 2); // 直接返回缓存的结果: 3

// 高级用法 - 自定义缓存选项
const getUserData = async (userId: string) => {
  console.log("Fetching user data...");
  // 模拟 API 调用
  return { id: userId, name: "User " + userId };
};

const memoizedGetUserData = performance.memoize(getUserData, {
  maxSize: 100, // 最多缓存 100 个结果
  maxAge: 60 * 1000, // 缓存 1 分钟
  resolver: userId => userId, // 自定义缓存键生成函数
});

await memoizedGetUserData("123"); // 将获取并缓存数据
await memoizedGetUserData("123"); // 从缓存返回数据
```

### 延迟加载工具 (lazy.ts)

提供资源和组件的延迟加载功能，优化初始加载性能。

```typescript
import { performance } from "@xihan/utils";

// 延迟加载图片
performance.lazyLoadImage("https://example.com/large-image.jpg", {
  delay: 200,
  crossOrigin: true,
  onSuccess: img => {
    document.body.appendChild(img);
  },
});

// 延迟加载 CSS
performance.lazyResource.css("https://example.com/styles.css", {
  id: "theme-css",
  delay: 100,
});

// 延迟加载 JavaScript
performance.lazyResource.script("https://example.com/widget.js", {
  async: true,
  defer: true,
});

// 创建延迟加载工厂
const heavyModule = performance.createLazyLoad(() => {
  // 返回需要延迟加载的模块或数据
  return import("./heavy-module");
});

// 稍后按需加载
button.addEventListener("click", async () => {
  const module = await heavyModule.load();
  module.doSomething();
});
```

### 性能指标收集 (metrics.ts)

收集和分析关键性能指标，帮助识别性能瓶颈。

```typescript
import { performance } from "@xihan/utils";

// 初始化性能指标收集器
const collector = performance.getMetricsCollector({
  collectCoreWebVitals: true,
  collectNavigationTiming: true,
  reportingUrl: "https://analytics.example.com/metrics",
  reportingMethod: "beacon",
});

// 添加自定义性能指标
collector.addCustomMetric("AppInitTime", 350, "ms", {
  component: "App",
  details: "从初始化到完成渲染的时间",
});

// 使用计时标记测量特定操作
collector.mark("fetchStart");
await fetchData();
collector.mark("fetchEnd");
collector.measure("fetchDuration", "fetchStart", "fetchEnd");

// 获取收集的指标
const metrics = collector.getMetrics();
console.log(metrics);

// 追踪资源加载性能
const imageResources = performance.trackResourceTiming(/\.jpg|\.png/, "img");
const resourceMetrics = performance.calculateResourceMetrics(imageResources);
console.log(`平均图片加载时间: ${resourceMetrics.averageDuration}ms`);
```

### 空闲时间任务调度 (requestIdleCallback.ts)

利用浏览器空闲时间执行非关键任务，避免阻塞主线程。

```typescript
import { performance } from "@xihan/utils";

// 使用空闲时间队列处理任务
performance.idleQueue
  .add(() => {
    console.log("Task executed during browser idle time");
    return "task result";
  })
  .then(result => {
    console.log("Task completed with result:", result);
  });

// 单个空闲任务
const { promise, cancel } = performance.idle(
  () => {
    // 在浏览器空闲时执行
    return processData(largeDataset);
  },
  { timeout: 3000 },
);

promise.then(result => console.log("处理完成:", result));

// 将大量工作分成小块，在空闲时间处理
const items = Array.from({ length: 1000 }, (_, i) => i);

performance
  .idleChunk(
    items,
    (item, index) => {
      return heavyProcessing(item);
    },
    {
      chunkSize: 10,
      timeout: 2000,
      onProgress: (processed, total) => {
        console.log(`进度: ${processed}/${total}`);
      },
    },
  )
  .then(results => {
    console.log("所有项目处理完成:", results);
  });

// 创建使用空闲时间的防抖函数
const idleSearch = performance.idleDebounce(
  query => {
    console.log("Searching for:", query);
    return search(query);
  },
  { timeout: 1000, maxWait: 2000 },
);

searchInput.addEventListener("input", () => {
  idleSearch(searchInput.value);
});
```

## 完整 API

### 节流函数 API

- `throttle(func: Function, wait: number | ThrottleOptions): Function`
- `ThrottleOptions`: 配置节流行为的选项对象
  - `wait`: 等待时间（毫秒）
  - `leading`: 是否在首次调用时立即执行
  - `trailing`: 是否在最后一次调用后也执行
  - `fps`: 每秒执行的次数上限

### 函数结果缓存 API

- `memoize<T>(func: T, options?: MemoizeOptions): T`
- `MemoizeOptions`: 配置缓存行为的选项对象
  - `maxSize`: 缓存的最大项数
  - `maxAge`: 缓存项的过期时间（毫秒）
  - `resolver`: 自定义缓存键生成函数
  - `strategy`: 缓存策略（'lru'|'fifo'）
  - `onCacheHit`: 缓存命中回调
  - `onCacheMiss`: 缓存未命中回调

### 延迟加载工具 API

- `createLazyLoad<T>(factory: () => T | Promise<T>, options?: LazyLoadOptions): LazyLoadResult<T>`
- `lazyLoad<T>(factory: () => Promise<T>, options?: LazyLoadOptions): () => Promise<T>`
- `lazyLoadImage(src: string, options?: LazyLoadOptions & ImageOptions): Promise<HTMLImageElement>`
- `lazyResource`: 资源加载工具对象
  - `css(href: string, options?: CssOptions): Promise<HTMLLinkElement>`
  - `script(src: string, options?: ScriptOptions): Promise<HTMLScriptElement>`

### 性能指标收集 API

- `getMetricsCollector(options?: MetricsCollectionOptions): PerformanceMetricsCollector`
- `autoInitMetricsCollector(options?: MetricsCollectionOptions): void`
- `trackResourceTiming(resourceUrl: string | RegExp, type?: string): PerformanceResourceTiming[]`
- `calculateResourceMetrics(resources: PerformanceResourceTiming[]): ResourceMetrics`
- `measureFunctionExecution<T>(fn: Function, ...args: any[]): { result: T; duration: number }`
- `PerformanceMetricsCollector`: 性能指标收集器类
  - `init()`: 初始化收集器
  - `addMetric(metric: PerformanceMetric): void`
  - `addCustomMetric(name: string, value: number, unit?: string, details?: object): void`
  - `mark(name: string): void`
  - `measure(name: string, startMark?: string, endMark?: string): PerformanceMeasure | undefined`
  - `report(url?: string): Promise<boolean>`
  - `getMetrics(): PerformanceMetrics`
  - `cleanup(): void`

### 空闲时间任务调度 API

- `safeRequestIdleCallback(callback: Function, options?: IdleCallbackOptions): number`
- `safeCancelIdleCallback(id: number): void`
- `idle<T>(callback: () => T | Promise<T>, options?: IdleCallbackOptions): { promise: Promise<T>; cancel: () => void }`
- `idleDebounce<T>(fn: T, options?: IdleCallbackOptions & { maxWait?: number }): Function`
- `idleChunk<T, R>(items: T[], processFn: (item: T, index: number) => R | Promise<R>, options?: ChunkOptions): Promise<R[]>`
- `IdleTaskQueue`: 空闲任务队列类
  - `add<T>(task: IdleTask<T>): Promise<T>`
  - `clear(): void`
  - `size`: 队列中任务数量
  - `busy`: 队列是否正在处理任务
- `idleQueue`: 默认导出的空闲任务队列实例
