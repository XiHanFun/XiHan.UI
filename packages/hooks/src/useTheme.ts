import { ref, watch } from "vue";
import { getSystemTheme, watchSystemTheme, ThemeMode } from "@xihan-ui/utils/css/theme";

/**
 * 主题组合式函数
 */
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
      // 监听系统主题变化
      watchSystemTheme(updateTheme);
    } else {
      updateTheme(newMode);
    }
  };

  // 初始化
  watch(
    () => mode.value,
    newMode => setMode(newMode),
    { immediate: true }
  );

  return {
    mode,
    theme,
    setMode,
  };
}
