/**
 * Cookie操作相关工具函数
 */
export const cookie = {
  get(name: string): string | null {
    const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
    return match ? decodeURIComponent(match[3]) : null;
  },

  set(
    name: string,
    value: string,
    options: { expires?: number; path?: string; domain?: string; secure?: boolean } = {}
  ) {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      const d = new Date();
      d.setTime(d.getTime() + options.expires * 86400000);
      cookie += `;expires=${d.toUTCString()}`;
    }

    if (options.path) cookie += `;path=${options.path}`;
    if (options.domain) cookie += `;domain=${options.domain}`;
    if (options.secure) cookie += `;secure`;

    document.cookie = cookie;
  },

  remove(name: string) {
    this.set(name, "", { expires: -1 });
  },
};
