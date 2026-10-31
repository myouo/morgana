# 八语言调查与第四门正式接续

2026-10-31。仅本地构建；资源上传、R2发布、Worker部署继续停止。

## 范围

正式主线现在连接序章/OP、第一至三门、`search.ks` 与第四门。
探索保留四问去重、取/拒钥匙、八个地点去重、已取得钥匙的卧室长支线、
女仆次数与第十次事件、最终彩窗及memory2对话差异。memory1沿第二门真实
选择传入，memory2由探索取钥匙获得；双记忆才开放第四门第三项。

转换器根据KS/TJS数据和宏生成普通Program、表达式、调用/分支与SDK UI。
没有第二套剧情解释器、运行时TJS/eval或exe逆向。未消费指令明确拒绝。
各语言保留本地源顺序、段落和autosave差异，未按英文行号拼接。

菜单沿用原框、按钮三态、声音及原字体小标签。互斥条件中的换行只在
相应条件成立时计入行位；已访问地点保留源中的空行。所有标签在原按钮
位置附近显示，透明UI只负责原位交互。进出淡化使用SDK任务。

## SDK与存档

实包源：`ac57d453033090a8c328dc389f9179f31527d3b6`；SHA-256：
`5c5fe3df3fe312cf0d0f0775ed96b67b8d58c0b2bbb004a7129352ac6a1d7d2e`。

G5-03提供透明原位UI、三态图片按钮、资源/声音准备及活动UI自动保存点；
W1-07仅展开无等待的纯叶辅助函数，显式重绑定旧混合任务来源。新程序
162–163函数，197–198个叶函数被展开；未提高函数、能力或wire上限。
已验证闭包保存在SDK私有四项缓存，调用者获得隔离副本；安装后失效。

旧快照先以原清单/代码验证，再迁移目标闭包、字体签名与任务来源；结束于
三门边界的旧槽追加真实接续等待。旧槽不删、不猜选择。兼容字体按原摘要
保留。调查来源映射清单使用指令体字典，避免反复保存相同签名。

完整主线的已读集合较大，运行快照即时历史统一为64条，与现有回看策略
一致，避免日文路线导出超过既定备份上限；历史旧槽在迁移时原样保留，
后续正常段落按该策略收集。没有提高备份限制或删除持久已读标记。

## 实际验证

- `pnpm check`：类型、94025条章节条目、源控制和边界检查通过。
- `pnpm exec tsx --test --test-concurrency=1 tests/search-conditions.test.ts tests/leaf-plan.test.ts tests/image-filter-migration.test.ts tests/save-migration.test.ts`：21项通过。
- `pnpm search:build <locale>`：八语均完成。每份输入使用与冻结摘要精确匹配的generated/heartbeat三门基线和已验收的独立四门来源；不会把已推广的四门主线再追加一次。
- `pnpm search:verify <locale>`：八语24条真实探索路线；全部走到四门入口，8条双记忆路线继续走完四门正线至scenario5入口。另两路不重跑已单独验过的四门后段。
- 独立KS/PO文本期望与实际运行覆盖均为2887段：日/韩各360，意大利语362，其余各361。
- `FATA_FIT_LOCALES=en,fr,it,jp,ko,pt-br,ru,zh pnpm exec playwright test --config playwright.search.config.ts text-fit`：8项，17912个布局单元，零溢出。
- `FATA_SEARCH_REPORT=menus-seven pnpm exec playwright test --config playwright.search.config.ts search.spec --grep-invert 'ko native'` 及对应韩语单项：7+1共8项通过，实际IndexedDB菜单保存、图像缩略图、刷新/冷加载、标签与按钮位置、进入已解锁卧室；64MiB驻留预算。
- `pnpm search:old-cuts zh`、`pnpm search:old-cuts en`：59及47个真实旧切点验证通过，保留控制栈/正文与已有任务时钟；八语还各从真实旧终点接续。
- SDK `pnpm check`、81文件/429单元、严格隔离实包消费通过；图片UI的6项Canvas/WebGL设备测试见SDK证据。完整根测试集曾为控制并发而中止，不计为通过；本轮相关适配器与上述流程分别验收。

`pnpm search:promote`完成八语本地切换，旧文件删除数为0；4184八份HTTP清单均为本轮版本。`FATA_SEARCH_URL=http://127.0.0.1:4184 FATA_SEARCH_REPORT=promoted-slot pnpm exec playwright test --config playwright.search.config.ts old-slot.spec`另验证真实三门旧槽进入调查首段且原槽版本保留。

截图、PB、原始日志、字体、KS/TJS、素材与tarball全部ignore。

## 资源与限制

电影/残像/心跳继续按原图及参数实时绘制；新增菜单没有状态组合帧。
全部一至四门、八语与兼容字体的SHA唯一资源共457343775字节；路径计数
3218、路径字节合计974451216，包含尚未合并的跨语言相同字节路径。
这不是单章或单次玩家下载量。本轮没有上传这些资源。

本轮完成新周目连续剧情范围。scenario5尚未接入；badend1/2/3代码随四门
保留，相关48条独立四门分支验证沿用此前记录，当前正式入口未认证原生
first.ks返标题流程。鉴赏回放仍截至第三门。独立四门旧槽保留在4190自己的
命名空间，不伪装为主线中实际取得记忆的存档。通关后变体、历史-only注记、
动画glyph、原生tft及原作逐像素/长期真机对照仍未完成。
