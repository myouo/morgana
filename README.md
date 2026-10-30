# The House in Fata Morgana · 独立 SDK 移植工程

用户提供的 Steam KRKR2 版本（app303310/build21523397），通过 `galbox/` 子模块的实际 tarball 和公开 exports 使用 SDK。原安装只读；根据 KS/TJS、宏、资源和原配置生成标准 Program，不逆向 exe，不运行另一套 KAG VM。

当前可玩：原标题与 OP、新周目完整序章的两条选择路线、八语完整第一门（scenario1start→zero3，共2478–2481段）。第一门完成后按原 flag 解锁序章/第一门回放；同章函数在 SDK 临时 Player/Store 中运行，关闭不改写主线。原菜单、文字/角色、音效槽、双 BGM、运动、规则转场、雨/花瓣、闪白、存档截图与历史均接正式 SDK。证据见 [FIRST_DOOR](docs/evidence/FIRST_DOOR.md)。

公开可玩预览：[test.morgana.love](https://test.morgana.love)。自动化网络回归使用独立的 testsdk.morgana.love。

## 文本与资源在哪里

- 可编辑正文：`locales/<BCP47>/story.po`、`prologue.po`；第一门为 `locales/<BCP47>/chapters/door1/*.po`。中文目录是 `locales/zh-Hans/chapters/door1/`。
- 系统文字：各语言 `ui.po`；选择文字：`choices.po`。
- 浏览器从 Worker 静态资源读取 `/text/zh.story.pb`、`/text/zh.ui.pb`；`/programs/zh.pb`是指令模板和资源引用。这些 pb **不在 R2**，也不进 Git。
- 图片、音频、字体由专用 R2 桶按 SHA 内容地址提供。只有跨全部语言相同的字节共享，其余按语言隔离。

PO 是维护源，protobuf 是经 Schema/控制关系/字体检查后生成的发布格式，不能通过修改二进制维护剧情。[翻译说明](locales/README.md)和[章节说明](docs/CHAPTERS.md)列出保留标记与校验命令。

## 本地运行

1. `git submodule update --init galbox`；`pnpm sdk:build`；`pnpm install --frozen-lockfile`。
2. `uv venv private/.venv`；`uv pip sync --python private/.venv/bin/python requirements.txt`。
3. `pnpm extract`；`pnpm inspect`。游戏路径见 `source.example.yaml`；更改路径时同步 `FATA_SOURCE`，提取支持 `--source`。
4. `pnpm compat:fetch`取得按摘要锁定的旧 SDK Program；`pnpm convert`；`pnpm check`；`pnpm build`。
5. `pnpm dev`，访问 `http://127.0.0.1:4180/`。语言：`?lang=en/fr/it/jp/ko/pt-br/ru/zh`（选其中一个）。默认 WebGL2 优先、不可用则 Canvas；`?renderer=canvas`可显式选择兼容路径。

新 clone 不含游戏、tarball、构建或凭据。完整测试还需要原资料和 ignored `private/compat32`、`private/compat93`的真实旧发布快照；缺失会明确失败。SDK 构建只使用子模块锁定提交，不能通过 workspace 源码别名消费。

## 游玩与保存

默认鼠标滚轮逐次显完/推进，上滚历史；触控板可在设置选择单手势模式，刷新保留。历史到底后再次下滚返回并保护150ms尾部，存读档页滚轮循环翻页；菜单右键先取消确认再返回；阅读右键或快捷按钮可隐藏文字框，首次点击/滚轮仅恢复，回放同样支持。浏览器原生菜单与文字选中禁用。Esc 菜单，F5/F9 快速存读档。触摸开始/读档请求全屏，不支持时按 VisualViewport 与 safe-area 调整4:3区域；HMR 自动重载关闭。

原设置提供独立已读字速与两个行内停顿开关，刷新保留；历史保留富格式与源角色分组。显示变体不改变剧情存档身份，见[本轮界面验收](docs/evidence/INTERFACE_COMPLETION.md)。

存档在当前域名 IndexedDB，带真实图文缩略图；已登记的旧32/93页 SDK 存档读入时自动迁移，保留历史、已发生选择和旧槽。未知发行版明确拒绝。这不是 KRKR 原生 tft 存档互通。不同语言和域名分别存储。

默认 balanced 提前4页、64MiB估算驻留；设置可选0/2/4/8页，刷新保留。预取跨已加载静态函数，受资源/内存预算约束；`?loading=demand`提供纯按需策略。长音乐和长单发音效走 versioned-url/HEAD/Range；短音效完整摘要校验。历史窗口按原作只读，未开启不使用的整页回滚快照。资源等待与本作历史页保持已有音乐；实际性能与限制见[验证记录](docs/evidence/PERFORMANCE_READING.md)。

`pnpm test`运行适配器与完整源路径，`pnpm test:browser`运行真实浏览器。整章单语可用 `FATA_TEST_LOCALE=en pnpm exec tsx --test tests/door-runtime.test.ts`；`pnpm test:reading`对比按需和2/4/8页预取。新增第二门IR测试还需 `pnpm chapters:convert interlude1 --staging` 与 `pnpm chapters:convert door2 --staging`，暂存不代表可玩。网络节流仅在测试 CDP，不在 Worker/R2/预览。

无引用旧资源空闲2秒后分批回收，当前画面/媒体/候选与前看资源保留；后台释放Canvas临时工作面，恢复时重建。HTTP目录不额外保留整章副本。实际数据及边界见[滚轮与内存验收](docs/evidence/WHEEL_MEMORY.md)。

## 二门本地接续入口

本地已接第一间章与二门前三节（八语79–80+351–355个源候选段），从实际Core生成的切点开始；当前工作区可运行`pnpm dev:door2`，访问`http://127.0.0.1:4182/?lang=zh`。新gameId/series/DB与正式存档隔离；公开预览仍是上一版第一门。

重新准备：先完成普通原资料/第一门构建，再运行`pnpm chapters:convert interlude1 --staging`、`pnpm chapters:convert door2 --staging`、`pnpm chapters:build all`；需要的语言执行`pnpm chapters:verify zh`（或en/fr/it/jp/ko/pt-br/ru），最后`pnpm dev:door2`。`pnpm test:door2`验证真实浏览器。程序生成期间先停止测试；该片段没有完整标题/鉴赏，回标题控件禁用。完整范围与限制见[二门验收](docs/evidence/SECOND_DOOR_SLICE.md)。

## 仍未完成

第二门剩余内容/memory1支线以后、通关变体、结局鉴赏、原版 tft codec、原作逐帧和真实移动设备对照。高级表现与按需剧情代码模块的组合仍是 SDK 后续任务；不能把当前整章 Program 称作已实现所有代码分包。

当前事实和下一步见 [STATUS](STATUS.md)、[能力边界](docs/CAPABILITIES.md)、[部署说明](deployment/README.md)。游戏原包/解包/KS/TJS/素材/字体/日志/trace全部 ignore；Git 仅保存适配源码、允许提交的 PO 和短报告。SDK 包不含游戏、证据或日志。

首次历史清理和删除LICENSE已完成；后续使用正常追加提交、快进推送，不反复重写已发布提交。
