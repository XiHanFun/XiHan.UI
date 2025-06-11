/**
 * 性能分析器
 * 提供详细的性能分析功能
 */

// =============================================
// 性能分析器
// =============================================

export class Profiler {
  private profiles: Map<string, ProfileData> = new Map();
  private activeProfiles: Set<string> = new Set();

  /**
   * 开始性能分析
   */
  start(name: string): void {
    if (this.activeProfiles.has(name)) {
      console.warn(`Profile "${name}" is already active`);
      return;
    }

    this.activeProfiles.add(name);
    const startTime = performance.now();

    this.profiles.set(name, {
      name,
      startTime,
      endTime: 0,
      duration: 0,
      memoryStart: this.getMemoryUsage(),
      memoryEnd: null,
      calls: [],
    });
  }

  /**
   * 结束性能分析
   */
  end(name: string): ProfileData | null {
    if (!this.activeProfiles.has(name)) {
      console.warn(`Profile "${name}" is not active`);
      return null;
    }

    const profile = this.profiles.get(name);
    if (!profile) return null;

    const endTime = performance.now();
    profile.endTime = endTime;
    profile.duration = endTime - profile.startTime;
    profile.memoryEnd = this.getMemoryUsage();

    this.activeProfiles.delete(name);
    return profile;
  }

  /**
   * 记录函数调用
   */
  recordCall(profileName: string, functionName: string, duration: number): void {
    const profile = this.profiles.get(profileName);
    if (profile) {
      profile.calls.push({
        functionName,
        duration,
        timestamp: performance.now(),
      });
    }
  }

  /**
   * 获取分析结果
   */
  getProfile(name: string): ProfileData | null {
    return this.profiles.get(name) || null;
  }

  /**
   * 获取所有分析结果
   */
  getAllProfiles(): ProfileData[] {
    return Array.from(this.profiles.values());
  }

  /**
   * 清除分析数据
   */
  clear(name?: string): void {
    if (name) {
      this.profiles.delete(name);
      this.activeProfiles.delete(name);
    } else {
      this.profiles.clear();
      this.activeProfiles.clear();
    }
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceReport {
    const profiles = this.getAllProfiles();
    const totalDuration = profiles.reduce((sum, profile) => sum + profile.duration, 0);

    const slowestProfile = profiles.reduce(
      (slowest, current) => (current.duration > slowest.duration ? current : slowest),
      profiles[0] || { duration: 0 },
    );

    const averageDuration = profiles.length > 0 ? totalDuration / profiles.length : 0;

    const memoryUsage = this.getMemoryUsage();

    return {
      totalProfiles: profiles.length,
      totalDuration,
      averageDuration,
      slowestProfile: slowestProfile.name || "N/A",
      slowestDuration: slowestProfile.duration || 0,
      memoryUsage,
      profiles: profiles.map(profile => ({
        name: profile.name,
        duration: profile.duration,
        callCount: profile.calls.length,
        averageCallDuration:
          profile.calls.length > 0
            ? profile.calls.reduce((sum, call) => sum + call.duration, 0) / profile.calls.length
            : 0,
      })),
    };
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): MemoryUsage | null {
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * 装饰器：自动分析函数性能
   */
  profile<T extends (...args: any[]) => any>(target: T, profileName?: string): T {
    const name = profileName || target.name || "anonymous";

    return ((...args: any[]) => {
      const callStart = performance.now();

      try {
        const result = target.apply(this, args);

        if (result instanceof Promise) {
          return result.finally(() => {
            const callEnd = performance.now();
            this.recordCall(name, target.name, callEnd - callStart);
          });
        } else {
          const callEnd = performance.now();
          this.recordCall(name, target.name, callEnd - callStart);
          return result;
        }
      } catch (error) {
        const callEnd = performance.now();
        this.recordCall(name, target.name, callEnd - callStart);
        throw error;
      }
    }) as T;
  }
}

// =============================================
// 类型定义
// =============================================

interface ProfileData {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  memoryStart: MemoryUsage | null;
  memoryEnd: MemoryUsage | null;
  calls: CallData[];
}

interface CallData {
  functionName: string;
  duration: number;
  timestamp: number;
}

interface MemoryUsage {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceReport {
  totalProfiles: number;
  totalDuration: number;
  averageDuration: number;
  slowestProfile: string;
  slowestDuration: number;
  memoryUsage: MemoryUsage | null;
  profiles: Array<{
    name: string;
    duration: number;
    callCount: number;
    averageCallDuration: number;
  }>;
}

// =============================================
// 导出实例
// =============================================

export const profiler = new Profiler();
