// import { ref, watch } from "vue";
// import { getSystemTheme, watchSystemTheme, ThemeMode } from "@xihan-ui/utils";
// type ThemeModeType = (typeof ThemeMode)[keyof typeof ThemeMode];

// /**
//  * 主题组合式函数
//  */
// export function useTheme(initialMode: ThemeModeType = "system") {
//   const mode = ref(initialMode);
//   const theme = ref(initialMode === "system" || initialMode === "auto" ? getSystemTheme() : initialMode);

//   // 更新主题
//   const updateTheme = (newTheme: "light" | "dark") => {
//     document.documentElement.setAttribute("data-theme", newTheme);
//     theme.value = newTheme;
//   };

//   // 设置主题模式
//   const setMode = (newMode: ThemeModeType) => {
//     mode.value = newMode;
//     if (newMode === "system" || newMode === "auto") {
//       updateTheme(getSystemTheme());
//       // 监听系统主题变化
//       watchSystemTheme(updateTheme);
//     } else {
//       updateTheme(newMode as "light" | "dark");
//     }
//   };

//   // 初始化
//   watch(
//     () => mode.value,
//     newMode => setMode(newMode),
//     { immediate: true },
//   );

//   return {
//     mode,
//     theme,
//     setMode,
//   };
// }
