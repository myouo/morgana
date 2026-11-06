# The House in Fata Morgana · 独立 SDK 移植工程

用户提供的 Steam KRKR2 版本（app303310/build21523397），通过 `galbox/` 子模块的实际 tarball 和公开 exports 使用 SDK。原安装只读；根据 KS/TJS、宏、资源和原配置生成标准 Program，不逆向 exe，不运行另一套 KAG VM。

当前已发布八语完整序章、第一至八门、终章、两次调查及badend1–7。原章节书十二入口接同一主Program；通关后前四门/调查变体、原通关标题、画廊、音乐室、后台和隐藏序章已接入。中英实际累计七结局解锁隐藏序章通过；其他语言完整累计、原作逐像素和原档互通仍分别验收。最新范围与限制见[STATUS](STATUS.md)。

用户已授权线上发布；[test.morgana.love](https://test.morgana.love) 为可玩预览，[testsdk.morgana.love](https://testsdk.morgana.love) 为鉴权网络回归站。当前发布版本与验收见[历史注释整合发布](docs/evidence/HISTORY_RELEASE.md)，后续本地优化另行记录，不冒充已经上线。

本轮已按八语源参数补齐OP/序章的点击、Enter与Ctrl演出跳过，存档保护/删除/原分页及章节、调查回放和结局列表。原素材界面由正式SDK运行，开发说明不进入游戏画面。日文存档为10页，其余为11页；原作逐像素和全部累计/真机矩阵仍未认证。当前验收与发布状态见[过场、存档与回放记录](docs/evidence/INTERACTIVE_UI.md)。

存读档卡顿已定位到重复代码校验/装载和保存画面的重复重绘，SDK修复与真实存档对比见[响应记录](docs/evidence/SAVE_LOAD_RESPONSIVENESS.md)。右键消息窗口与富文本共同隐藏。第五门八语主线与回放已发布，见[第五门验收](docs/evidence/FIFTH_MAINLINE.md)。第六门及第四坏结局已发布，限时选择、旧档与章节回放验收见[第六门记录](docs/evidence/SIXTH_MAINLINE.md)；通关态称呼按用户确认不调整。

## 文本与资源在哪里

- 可编辑正文：`locales/<BCP47>/story.po`、`prologue.po`；章节位于 `locales/<BCP47>/chapters/`，包含主线、两次调查、坏结局、后台与奖励序章。中文目录为 `locales/zh-Hans/chapters/`。
- 系统文字：各语言 `ui.po`；选择文字：`choices.po`。
- 浏览器从Worker静态资源读取 `/programs/zh.modules.pb`、按SHA命名的代码模块、标题与 `/text/zh.ui.pb`；旧单门的指令模板/文本目录仅用于兼容。这些pb **不在 R2**，也不进 Git。
- 图片、音频、字体由专用 R2 桶按 SHA 内容地址提供。只有跨全部语言相同的字节共享，其余按语言隔离。

PO 是维护源，protobuf 是经 Schema/控制关系/字体检查后生成的发布格式，不能通过修改二进制维护剧情。[翻译说明](locales/README.md)和[章节说明](docs/CHAPTERS.md)列出保留标记与校验命令。

早期四门候选使用prepare-release/verify-release/stage-release；这些命令不代表当前完整主包的重建。当前整合发布沿用经过验收的父版和冻结旧来源，最新命令见[本批发布记录](docs/evidence/HISTORY_RELEASE.md)。生成目录与测试数据均不进Git。

## 本地运行

1. `git submodule update --init galbox`；`pnpm sdk:build`；`pnpm install --frozen-lockfile`。
2. `uv venv private/.venv`；`uv pip sync --python private/.venv/bin/python requirements.txt`。
3. `pnpm extract`；`pnpm inspect`。游戏路径见 `source.example.yaml`；更改路径时同步 `FATA_SOURCE`，提取支持 `--source`。
4. `pnpm compat:fetch`取得按摘要锁定的旧 SDK Program；`pnpm convert`。首次重建旧来源时先运行 `pnpm integration:build all --previous`、`pnpm connection:freeze`；已有冻结来源则保留。升级历史三门帧版本时用 `pnpm integration:build all --frames`、`pnpm exec tsx tooling/freeze-frame-release.ts` 固定旧来源；已有固定来源则跳过。冻结旧实时三门来源后（`pnpm exec tsx tooling/freeze-heartbeat-source.ts`；新环境须先以 `compile-procedural.ts` 重建旧实时心跳版本），再 `pnpm integration:build all`、`pnpm check`、`pnpm build`。
5. 保留现有三门冻结来源后，`pnpm search:freeze`、`pnpm search:build all`、`pnpm search:verify all`；八语验收后 `pnpm search:promote`。
6. `pnpm dev`，访问 `http://127.0.0.1:4184/`。语言：`?lang=en/fr/it/jp/ko/pt-br/ru/zh`（选其中一个）。默认 WebGL2 优先、不可用则 Canvas；`?renderer=canvas`可显式选择兼容路径。

新 clone 不含游戏、tarball、构建或凭据。完整测试还需要原资料和 ignored `private/compat32`、`private/compat93`和 `private/compat-modules` 的真实旧发布快照；缺失会明确失败。SDK 构建只使用子模块锁定提交，不能通过 workspace 源码别名消费。更新SDK实包后应重启开发服务器；长开Vite可能仍持有旧预构建，必要时用`FATA_MODULES=1 pnpm exec vite --force`重新预构建。

## 游玩与保存

正文窗口不滚动：完整页放不下时由SDK缩排，短页保留原字号，未显出的文字也参与排版；详见[整页验收](docs/evidence/TEXT_FIT.md)。默认鼠标滚轮逐次显完/推进，上滚历史；触控板可在设置选择单手势模式，刷新保留。历史到底后再次下滚返回并保护150ms尾部，存读档页滚轮循环翻页；菜单右键先取消确认再返回；阅读右键或快捷按钮可隐藏文字框，首次点击/滚轮仅恢复，回放同样支持。浏览器原生菜单与文字选中禁用。Esc 菜单，F5/F9 快速存读档。触摸开始/读档请求全屏，不支持时按 VisualViewport 与 safe-area 调整4:3区域；HMR 自动重载关闭。

原设置提供独立已读字速与两个行内停顿开关，刷新保留；历史保留富格式与源角色分组。显示变体不改变剧情存档身份，见[本轮界面验收](docs/evidence/INTERFACE_COMPLETION.md)。

存档在当前域名 IndexedDB，带真实图文缩略图；已登记的旧SDK档、完整第一门和旧两门Web档使用显式源版本映射，保留历史、已发生选择和旧槽。未知发行版明确拒绝。这不是 KRKR 原生 tft 存档互通。不同语言和域名分别存储。

默认 balanced 提前4页、64MiB估算驻留；设置可选0/2/4/8页，刷新保留。预取跨已加载静态函数，受资源/内存预算约束；`?loading=demand`提供纯按需策略。长音乐和长单发音效走 versioned-url/HEAD/Range；短音效完整摘要校验。历史窗口按原作只读，未开启不使用的整页回滚快照。资源等待与本作历史页保持已有音乐；实际性能与限制见[验证记录](docs/evidence/PERFORMANCE_READING.md)。

`pnpm test`运行适配器与完整源路径，`pnpm test:browser`运行真实浏览器。整章单语可用 `FATA_TEST_LOCALE=en pnpm exec tsx --test tests/door-runtime.test.ts`；`pnpm test:reading`保留旧单门性能命令；当前完整接续未复用其测量结论。正式 `integration:build`/`connection:build` 默认使用实时效果；`--frames`只用于旧三门兼容来源重建，4185历史独立目录不作为本次实时版本入口。新增第二门IR测试还需 `pnpm chapters:convert interlude1 --staging` 与 `pnpm chapters:convert door2 --staging`，暂存不代表可玩。网络节流仅在测试 CDP，不在 Worker/R2/预览。

原作旧电影/残像/心跳染色模糊改由SDK从参数及原图实时绘制，当前没有对应生成帧或派生心跳图被程序引用；[缺口核查](docs/evidence/EFFECT_GAPS.md)。旧模块迁移仅缓存原始清单，临时旧代码对象在迁移完成后可回收；无引用旧资源空闲2秒后分批回收，当前画面/媒体/候选与前看资源保留；后台释放Canvas临时工作面，恢复时重建。HTTP目录不额外保留整章副本。实际数据及边界见[滚轮与内存验收](docs/evidence/WHEEL_MEMORY.md)。

## 完整二门本地入口

八语完整二门、章尾间章与memory1的两个选择已生成标准Program。已有第一门构建/原资料环境中运行 `pnpm door2:build all`、`pnpm door2:verify all`，然后 `pnpm dev:door2:full`，访问 `http://127.0.0.1:4183/?lang=zh`。初次从原生章头开始，之后可以继续本地存档；`&cut=start`显式重新从章头开始。`pnpm test:door2:full`运行中英真实浏览器回归。测试期间冻结生成目录。

独立gameId/series/DB保护正式旧槽；当前在去往scenario3的入口结束，没有第三门正文。第一门→二门的正式接续、旧档及回放已接入主入口；4183仍是独立测试命名空间。八语二门/回忆PO在locales，原KS/TJS/素材保持ignore。范围、命令和表现缺口见[完整二门验收](docs/evidence/SECOND_DOOR_FULL.md)。4182的旧小片段入口仅保留为早期证据。

## 第三门本地入口

第三门以独立命名空间接通 21 个场景，终止于原脚本的 `search.ks` 调查章节入口。已有原资料与第一门基线的环境中运行 `pnpm chapters:convert door3`、`pnpm door3:build all`、`pnpm door3:verify all`、`pnpm dev:door3`，访问 `http://127.0.0.1:4185/?lang=zh`。之后直接继续本地存档，`&cut=start`重新从第三门章头开始。`pnpm test:door3`验证图文刷新、效果交接、滚轮与全文无滚动；构建完毕后冻结生成目录再测试。详见[第三门验收](docs/evidence/THIRD_DOOR.md)。

4185仍保留为独立测试入口；4184为当前整合主线。旧两门清单和原代码按摘要保留，经SDK W1-03B3A显式验证来源后升级；新版本保留旧槽。公开域名的当前发布范围见[STATUS](STATUS.md)。正式实时残像每32ms累积，原作逐像素与通关变体仍未认证。

## 第四门本地入口

第四门正文、后段选择及三种坏结局内容已在八语独立命名空间接通，止于原 `scenario5.ks` / `first.ks` 跳转边界。八语已验证记忆条件、分支、旧档和排版。运行 `pnpm door4:build all`、`pnpm door4:verify all`、`pnpm test:door4:full`、`pnpm door4:promote` 后 `pnpm dev:door4`，访问 `http://127.0.0.1:4190/?lang=zh`，`&cut=start`重开。正式三门→search→四门接续已验收；[范围及八语验收](docs/evidence/FOURTH_DOOR_FULL.md)。

## 仍未完成

原历史行缓冲与部分注释/当前正文语义、确认glyph、强制取消Auto/Skip、文字定位/字体与音轨精确恢复、跨文件书签继承、较大备份及跨清单导入、原版tft codec、原作逐帧和真实移动设备对照仍待完成。八语全部章节菜单累计路径与IndexedDB累计耐久未全部认证。具体状态见[差异清单](docs/REPLICA_GAPS.md)，不会因全线贯通而标为整作100%。

当前事实和下一步见 [STATUS](STATUS.md)、[能力边界](docs/CAPABILITIES.md)、[部署说明](deployment/README.md)。游戏原包/解包/KS/TJS/素材/字体/日志/trace全部 ignore；Git 仅保存适配源码、允许提交的 PO 和短报告。SDK 包不含游戏、证据或日志。

首次历史清理和删除LICENSE已完成；后续使用正常追加提交、快进推送，不反复重写已发布提交。

## 本轮界面构建

保留发布基线 `generated/release-public`（由已有四门发布流程重建），依次运行 `pnpm interfaces:build all`、`pnpm interfaces:menus`、`pnpm interfaces:share`。共享候选为 `generated/interfaces-shared`；先 `pnpm exec tsx tooling/prepare-interface-cuts.ts` 生成当前测试切点，`FATA_INTERACTION_OUTPUT=generated/interfaces-shared pnpm interfaces:verify all` 与 `FATA_INTERFACE_ROOT=generated/interfaces-shared FATA_INTERFACE_RUN=shared-final pnpm test:interfaces` 验收，`pnpm interfaces:promote` 只在记录通过后提升默认入口并保留旧文件。当前切点夹具由 `prepare-interface-cuts.ts` 从真实旧来源验证、迁移并重新验证生成，只在ignored目录。

## 第五、六门整合重建

既有原资料与界面基线下，`pnpm door5:build all`、`pnpm door5:connect all`、`pnpm door5:verify:main all`，再运行第五门浏览器验收与stage/promote，保留 `generated/fifth-public` 作为不可变输入。第六门依次运行 `pnpm door6:build all`、`pnpm door6:verify all`、`pnpm door6:connect all`、`pnpm door6:verify:main all`；`pnpm test:door6 --fully-parallel --workers=2` 完整通过后才可 `pnpm door6:stage`、`pnpm door6:promote`。这不会删除旧代码/素材，也不会把测试存档放入站点。

整作复刻持续目标与推进顺序见[计划](docs/REPLICA_PLAN.md)，剩余差异见[清单](docs/REPLICA_GAPS.md)。主线已贯通；当前按[启动装载优化](docs/evidence/STARTUP_LOADING.md)、[历史追加与换行](docs/evidence/HISTORY_APPEND_FLOW.md)、[明确角色重置](docs/evidence/HISTORY_SPEAKER_RESETS.md)、[历史保留与累计存储](docs/evidence/HISTORY_RETENTION.md)、[等待正文前缀](docs/evidence/HISTORY_PREFIX.md)、[前导换行](docs/evidence/HISTORY_LEADING_BREAKS.md)等记录逐项收尾。
