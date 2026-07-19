# `docs/i18n.md` Review 意见（第十四轮）

评审对象：`docs/i18n.md`（已根据第十三轮 review 修订）

## 上一轮已闭环

第十三轮 3 条意见（P2×3）均已处理：`pickLocale` `isLeaf` 分支（第 473 行）改 `as unknown as Messages` 双重断言，与 primitive/array 分支一致；JSDoc「类型注记」段指明 `isLeaf` 分支的 cast 隐藏 `undefined`，并覆盖 primitive/array 分支的 type-unsoundness；JSDoc 加行内小标题（`**leaf 判定**`/`**缺字段回退**`/`**类型注记**`/`**边界**`），合并「类型注记」+「防御性分支」段，段数从 6 减到 4。

经过 14 轮 review，文档已基本收敛——所有 P0/P1 问题在历轮已修复（`fallbackLng` 双 locale resources、`Messages` 递归类型、`pickLocale` 边界、`isActive` pathname bug、`LOCAL_URL_BASE`/`PREFERRED_LOCALE_KEY` 抽常量、`Seo.tsx` import 补全等）。本轮仅发现 2 条非常次要的 cosmetic 问题。

---

## 新发现问题

| # | 级别 | 位置 | 问题描述 | 简单建议 |
|---|---|---|---|---|
| 1 | P2 | 第九节 `pickLocale` JSDoc「边界」措辞 | JSDoc 里「边界」出现两次：(1) 第 440 行作为 `**leaf 判定**` 段内的行内子注「边界:language.en 的 value... 也是 leaf,正确提取」；(2) 第 454 行作为独立段标题「**边界**:leaf 误加非支持语言的 key...」。同一词「边界」既作行内子注又作独立段标题，格式不一致。读者扫一眼可能困惑两者关系。 | 把第 440 行的行内「边界:」改成「正例:」或「注:」（因为这是正确处理的正面案例，不是误用边界），与第 454 行的「**边界**」段（反面误用案例）区分。或把第 454 行的段标题改成「**误用边界**」明确是反面案例。 |
| 2 | P2 | 第六节 `_app.tsx` `resources` 对象字面量 | 第 211-214 行 `resources: { [pageProps.locale]: pageProps.messages, [DEFAULT_LOCALE]: pageProps.fallbackMessages }`——当 `pageProps.locale === DEFAULT_LOCALE` 时，两个 computed key 都是 `DEFAULT_LOCALE`，第二个 `[DEFAULT_LOCALE]: pageProps.fallbackMessages` 覆盖第一个 `[pageProps.locale]: pageProps.messages`，第一个赋值是浪费。`messages` 和 `fallbackMessages` 此时是同引用（第九节 `getI18nProps` 复用 `picked`），所以覆盖无功能影响，但对象字面量里写两个同 key 不优雅。 | 用条件展开：`resources: pageProps.locale === DEFAULT_LOCALE ? { [DEFAULT_LOCALE]: pageProps.messages } : { [pageProps.locale]: pageProps.messages, [DEFAULT_LOCALE]: pageProps.fallbackMessages }`。或接受这个写法并在注释里说明「`locale === DEFAULT_LOCALE` 时第二个 key 覆盖第一个，因 `messages`/`fallbackMessages` 同引用所以无影响」。 |

---

## 修复优先级

- **P1（应改，影响正确性）**：无
- **P2（cosmetic / 代码风格）**：#1–#2

无 P0 阻塞性问题，无 P1。两条都是 cosmetic 问题，不影响正确性或可落地性。

## 文档收敛评估

经过 14 轮 review，`docs/i18n.md` 已基本收敛：

- **架构层面**：合并格式 + `pickLocale` + 裸 `react-i18next` 方案稳定，`_app.tsx` `useMemo` + `I18nextProvider` 同步初始化、`useEffect` dispose、双 locale `resources` + `fallbackLng` 回退链完整。
- **类型安全**：`Messages` 递归类型可赋值给 i18next `ResourceKey`；`AppLocale` 字面量联合从 `settings.ts` 一路传到页面；`pickLocale` 三处 cast 统一 `as unknown as Messages` 双重断言，JSDoc 显式标注 type-unsoundness。
- **边界处理**：`isActive` 用 `asPath` + pathname 提取（忽略 search/hash）；`pickLocale` leaf 判定 + non-locale key 禁止；`fallbackLng` 双 locale resources 让缺字段回退生效；`LOCAL_URL_BASE`/`PREFERRED_LOCALE_KEY`/`SESSION_KEY` 抽常量避免 magic string。
- **文档完整性**：`pickLocale` JSDoc 4 段带小标题；`_app.tsx` `AppProps<PageProps>` 注释说明扩展 props；常见错误 9 条覆盖关键 bug；落地顺序 16 步可执行。

本轮 2 条 cosmetic 问题可改可不改。若主人认为文档已可落地，可在此轮收尾；若要继续打磨，#1（「边界」措辞）和 #2（`resources` 同 key 覆盖）都是 5 分钟内可修的小问题。
