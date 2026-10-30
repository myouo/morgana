# The House in Fata Morgana · 独立 SDK 移植工程

用户提供的 Steam KRKR2 版本（app303310/build21523397），通过 `galbox/` 子模块的实际 tarball 和公开 exports 使用 SDK。原安装只读；根据 KS/TJS、宏、资源和原配置生成标准 Program，不逆向 exe，不运行另一套 KAG VM。

当前内容已接通：原标题与OP、新周目完整序章、八语完整第一门→第一间章→完整二门、memory1两个选择及章尾间章→完整第三门21场景，至 `search.ks:*start` 调查章节入口。正式旧第一门和旧两门Web存档均可接续；第三门也已接入原章节回放，关闭后主线保持原状态。实际范围与限制见[三门接续验收](docs/evidence/CONNECTED_DOORS.md)。

公开可玩预览：[test.morgana.love](https://test.morgana.love)。自动化网络回归使用独立的 testsdk.morgana.love。

## 文本与资源在哪里

- 可编辑正文：`locales/<BCP47>/story.po`、`prologue.po`；章节为 `locales/<BCP47>/chapters/{door1,interlude1,door2,memory1,door3}/*.po`。中文目录是 `locales/zh-Hans/chapters/door1/`。
- 系统文字：各语言 `ui.po`；选择文字：`choices.po`。
- 浏览器从Worker静态资源读取 `/programs/zh.modules.pb`、按SHA命名的代码模块、标题与 `/text/zh.ui.pb`；旧单门的指令模板/文本目录仅用于兼容。这些pb **不在 R2**，也不进 Git。
- 图片、音频、字体由专用 R2 桶按 SHA 内容地址提供。只有跨全部语言相同的字节共享，其余按语言隔离。

PO 是维护源，protobuf 是经 Schema/控制关系/字体检查后生成的发布格式，不能通过修改二进制维护剧情。[翻译说明](locales/README.md)和[章节说明](docs/CHAPTERS.md)列出保留标记与校验命令。

## 本地运行

1. `git submodule update --init galbox`；`pnpm sdk:build`；`pnpm install --frozen-lockfile`。
2. `uv venv private/.venv`；`uv pip sync --python private/.venv/bin/python requirements.txt`。
3. `pnpm extract`；`pnpm inspect`。游戏路径见 `source.example.yaml`；更改路径时同步 `FATA_SOURCE`，提取支持 `--source`。
4. `pnpm compat:fetch`取得按摘要锁定的旧 SDK Program；`pnpm convert`。首次重建旧来源时先运行 `pnpm integration:build all --previous`、`pnpm connection:freeze`；已有冻结来源则保留。然后 `pnpm integration:build all`、`pnpm check`、`pnpm build`。
5. `pnpm dev`，访问 `http://127.0.0.1:4184/`。语言：`?lang=en/fr/it/jp/ko/pt-br/ru/zh`（选其中一个）。默认 WebGL2 优先、不可用则 Canvas；`?renderer=canvas`可显式选择兼容路径。

新 clone 不含游戏、tarball、构建或凭据。完整测试还需要原资料和 ignored `private/compat32`、`private/compat93`和 `private/compat-modules` 的真实旧发布快照；缺失会明确失败。SDK 构建只使用子模块锁定提交，不能通过 workspace 源码别名消费。

## 游玩与保存

正文窗口不滚动：完整页放不下时由SDK缩排，短页保留原字号，未显出的文字也参与排版；详见[整页验收](docs/evidence/TEXT_FIT.md)。默认鼠标滚轮逐次显完/推进，上滚历史；触控板可在设置选择单手势模式，刷新保留。历史到底后再次下滚返回并保护150ms尾部，存读档页滚轮循环翻页；菜单右键先取消确认再返回；阅读右键或快捷按钮可隐藏文字框，首次点击/滚轮仅恢复，回放同样支持。浏览器原生菜单与文字选中禁用。Esc 菜单，F5/F9 快速存读档。触摸开始/读档请求全屏，不支持时按 VisualViewport 与 safe-area 调整4:3区域；HMR 自动重载关闭。

原设置提供独立已读字速与两个行内停顿开关，刷新保留；历史保留富格式与源角色分组。显示变体不改变剧情存档身份，见[本轮界面验收](docs/evidence/INTERFACE_COMPLETION.md)。

存档在当前域名 IndexedDB，带真实图文缩略图；已登记的旧SDK档、完整第一门和旧两门Web档使用显式源版本映射，保留历史、已发生选择和旧槽。未知发行版明确拒绝。这不是 KRKR 原生 tft 存档互通。不同语言和域名分别存储。

默认 balanced 提前4页、64MiB估算驻留；设置可选0/2/4/8页，刷新保留。预取跨已加载静态函数，受资源/内存预算约束；`?loading=demand`提供纯按需策略。长音乐和长单发音效走 versioned-url/HEAD/Range；短音效完整摘要校验。历史窗口按原作只读，未开启不使用的整页回滚快照。资源等待与本作历史页保持已有音乐；实际性能与限制见[验证记录](docs/evidence/PERFORMANCE_READING.md)。

`pnpm test`运行适配器与完整源路径，`pnpm test:browser`运行真实浏览器。整章单语可用 `FATA_TEST_LOCALE=en pnpm exec tsx --test tests/door-runtime.test.ts`；`pnpm test:reading`保留旧单门性能命令；当前完整接续未复用其测量结论。新增第二门IR测试还需 `pnpm chapters:convert interlude1 --staging` 与 `pnpm chapters:convert door2 --staging`，暂存不代表可玩。网络节流仅在测试 CDP，不在 Worker/R2/预览。

旧模块迁移仅缓存原始清单，临时旧代码对象在迁移完成后可回收；无引用旧资源空闲2秒后分批回收，当前画面/媒体/候选与前看资源保留；后台释放Canvas临时工作面，恢复时重建。HTTP目录不额外保留整章副本。实际数据及边界见[滚轮与内存验收](docs/evidence/WHEEL_MEMORY.md)。

## 完整二门本地入口

八语完整二门、章尾间章与memory1的两个选择已生成标准Program。已有第一门构建/原资料环境中运行 `pnpm door2:build all`、`pnpm door2:verify all`，然后 `pnpm dev:door2:full`，访问 `http://127.0.0.1:4183/?lang=zh`。初次从原生章头开始，之后可以继续本地存档；`&cut=start`显式重新从章头开始。`pnpm test:door2:full`运行中英真实浏览器回归。测试期间冻结生成目录。

独立gameId/series/DB保护正式旧槽；当前在去往scenario3的入口结束，没有第三门正文。第一门→二门的正式接续、旧档及回放已接入主入口；4183仍是独立测试命名空间。八语二门/回忆PO在locales，原KS/TJS/素材保持ignore。范围、命令和表现缺口见[完整二门验收](docs/evidence/SECOND_DOOR_FULL.md)。4182的旧小片段入口仅保留为早期证据。

## 第三门本地入口

第三门以独立命名空间接通 21 个场景，终止于原脚本的 `search.ks` 调查章节入口。已有原资料与第一门基线的环境中运行 `pnpm chapters:convert door3`、`pnpm door3:build all`、`pnpm door3:verify all`、`pnpm dev:door3`，访问 `http://127.0.0.1:4185/?lang=zh`。之后直接继续本地存档，`&cut=start`重新从第三门章头开始。`pnpm test:door3`验证图文刷新、效果交接、滚轮与全文无滚动；构建完毕后冻结生成目录再测试。详见[第三门验收](docs/evidence/THIRD_DOOR.md)。

4185仍保留为独立测试入口；正式三门接续使用4184。旧两门清单和原代码按摘要保留，经SDK W1-03B3A显式验证来源后升级；新版本保留旧槽。公开域名仍是此前两门发布，本轮未重新部署。长残像为有限采样近似，原作逐像素与通关变体仍未认证。

## 仍未完成

调查章节及后续门、通关变体、结局鉴赏、原版 tft codec、原作逐帧和真实移动设备对照。当前SDK v2已支持富文/窗口/演出/源音频、鉴赏、剧本UI/流程图/视频/计时/RNG与注册operations的模块组合；正式本地主入口已接通三门，跨v2 manifest的Web槽迁移已验收。模块recipe/SaveBridge/历史回溯仍列W1-03B3，完整旧性能/真机矩阵没有沿用为本版重验。

当前事实和下一步见 [STATUS](STATUS.md)、[能力边界](docs/CAPABILITIES.md)、[部署说明](deployment/README.md)。游戏原包/解包/KS/TJS/素材/字体/日志/trace全部 ignore；Git 仅保存适配源码、允许提交的 PO 和短报告。SDK 包不含游戏、证据或日志。

首次历史清理和删除LICENSE已完成；后续使用正常追加提交、快进推送，不反复重写已发布提交。
