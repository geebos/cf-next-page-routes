import { DEFAULT_LOCALE } from "@repo/i18n";
import { makeStaticProps } from "@/lib/i18n-static";
import TestRoute from "./[locale]/test";

// 默认语言（en）test 页面：/test/ 直接输出英文页面，不再按浏览器语言跳转。
export default TestRoute;

export const getStaticProps = makeStaticProps(
  ["common", "test"],
  DEFAULT_LOCALE,
);
