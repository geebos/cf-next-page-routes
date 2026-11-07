import { DEFAULT_LOCALE } from "@repo/i18n";
import { makeStaticProps } from "@/lib/i18n-static";
import TodoRoute from "./[locale]/todo";

// 默认语言（en）todo 页面：/todo/ 直接输出英文页面，不再按浏览器语言跳转。
export default TodoRoute;

export const getStaticProps = makeStaticProps(
  ["common", "todo"],
  DEFAULT_LOCALE,
);
