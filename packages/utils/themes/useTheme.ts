import { ref, watch } from "vue";
import type { Ref } from "vue";
import { getSystemTheme, watchSystemTheme, type ThemeMode } from "./theme";

export function useTheme(initialMode: ThemeMode = "system") {
  const mode = ref(initialMode);
  const theme = ref(initialMode === "system" ? getSystemTheme() : initialMode);

  // 更新主题
  const updateTheme = (newTheme: "light" | "dark") => {
    document.documentElement.setAttribute("data-theme", newTheme);
    theme.value = newTheme;
  };

  // 设置主题模式
  const setMode = (newMode: ThemeMode) => {
    mode.value = newMode;
    if (newMode === "system") {
      updateTheme(getSystemTheme());
    } else {
      updateTheme(newMode);
    }
  };

  // 监听系统主题变化
  if (initialMode === "system") {
    watchSystemTheme(systemTheme => {
      if (mode.value === "system") {
        updateTheme(systemTheme);
      }
    });
  }

  return {
    mode,
    theme,
    setMode,
  };
}
