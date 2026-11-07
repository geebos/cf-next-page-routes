import { DEFAULT_LOCALE } from "@repo/i18n";
import { makeStaticProps } from "@/lib/i18n-static";
import HomeRoute from "./[locale]/index";

// 默认语言（en）使用无前缀 URL：复用 [locale] 的页面组合，只强制 locale。
export default HomeRoute;

export const getStaticProps = makeStaticProps(
  ["common", "demo"],
  DEFAULT_LOCALE,
);
