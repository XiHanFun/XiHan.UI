import { createApp } from "vue";
import App from "./src/App.vue";
import XihanUI from "xihan-ui";

const app = createApp(App);
app.use(XihanUI);
app.mount("#app");
