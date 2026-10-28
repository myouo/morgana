# 滚轮、取消与安全回收

2026-10-30。G1-05 的滚轮/菜单取消继续接入，H3-04 完成本轮资源回收；F-01F 推进到第二门/间章的八语 IR 验证，第二门尚未成为可玩 Program。生产 SDK `95823ec` + `c69d144`，实包 SHA256 `57f43cd113cfd401d148c87307ad7fee1d3c643dd2a78d9dfbc02aaa5d79debc`，只从公开 exports 使用。

## 动作

按私有 MainWindow.tjs / HistoryLayer.tjs / config.ks 读取数据核对，没有运行 TJS 或逆向 exe。阅读下滚逐次模拟点击；历史上/下滚对应旧/新行，已经到底后，超过 150 ms 再下滚返回；返回手势不能直接推进正文。存读档下/上滚循环下一/上一页（当前 12 手动槽策略对应 3 页，不声称已复制原 11 页库）。右键先取消确认框，再返回菜单；标题设置、历史、存读档及回放目录已接取消，阅读中的完整文本框隐藏仍待无框变体。

SDK 的 input.wheelMode 可选 step/gesture，旧设置缺字段时使用作品默认；本作默认鼠标 step，设置可选择触控板 gesture，刷新保留。SDK 缺省仍保留原手势模式。一次动作未完成时不积压未来推进；prompt/epoch、读档/焦点/菜单返回、横向滚动、修饰键、输入框和多实例保护仍有效。没有根据 delta 大小自动猜输入设备。历史单位滚动按当前源行高 25，正文起点补入原 controlHeight：marginTop20+20=40，文字恢复白色；未声称历史富文本、重复姓名、原字体栅格化等已完整还原。单位模式参考 [W3C Pointer Events 草案](https://w3c.github.io/pointerevents/#wheel-events)。

## 回收范围

旧场景显示成功、租约释放后，延迟 2 秒回收无引用 ready 资源，每批最多 2 项并交还事件循环；当前前看集合受保护。当前画面、后台页/转场两端、活动媒体、候选准备、鉴赏/捕获及加载中资源不删。重新需要时走原加载/摘要/HTTP 版本校验，不清存档、profile、历史或全局 Pixi 池。eager/chapter 明确保留的引用仍有效。

页面隐藏只释放本实例 Canvas 滤镜池/scratch/CPU blur 数组，保留输出与 back buffer，显示时按原预算重建。身份滤镜解除时释放本实例已不用的 filter。HTTP provider 仍完整验证输入 Program，但闭包只持有已私有化的 assets/gameId/release；不再额外留住未使用的整章 functions。

## 实际数据

以正式 Core 遍历得到的固定 protobuf 存档对照前版 `b3d5f5a`/`647a24aaebd3` 与本版；每对 browser、driver SHA、backup SHA 相同。恢复后采样，静置 3.3 秒、显式 GC，再隐藏 1 秒/显示，最后真实图文保存再读取。脚本 `tests/performance/reclaiming.mjs`；page500/dance 对应原 driver 副本保留在 ignored artifacts/wheel-memory，避免脚本增加切点参数后丢失测量身份。

| 实际切点 | 静置后驻留估算 bytes（旧 → 新） | GC 后 JS heap bytes（旧 → 新） | 已加载资产（旧 → 新） |
| --- | ---: | ---: | ---: |
| 第一门第 500 段 | 38353290 → 20512435 | 38203424 → 35006744 | 14 → 9 |
| 循环立绘 | 39359998 → 21519143 | 38821868 → 35897756 | 15 → 10 |
| 第 100 段，带暗化滤镜 | 39679283 → 21838428 | 38886140 → 35823632 | 15 → 10 |

带滤镜切点的 Canvas 工作面估算由前台 14745600 降到后台 7372800，回来恢复 14745600；前版后台保持 14745600。另两个切点没有额外滤镜工作面，本来就是 7372800，没有伪报下降。三例的正文/控制栈未推进、真实 BGM 时间持续递增、保存恢复的文本身份及缩略图有效，浏览器/播放器错误为空；`node tooling/compare-reclaiming.mjs` 实际通过。原始配对 JSON、固定存档、driver 副本、CPU/网络/页面资料均 ignore。

独立 provider 的合成 10000 指令样本：保留 provider 与释放它后分别 GC，额外持有量 2272180 → 476 bytes。命令（SDK 目录）`GALBOX_EVIDENCE_DIR=artifacts/provider-retention node tests/tooling/profile-provider.mjs artifacts/provider-retention/before-sdk.js`。全 Program 的 schema 仍检查，调用方随后修改程序/目录也不改变 provider 身份，错误 release 仍拒绝。

数字是所测切点的 SDK 驻留/工作面估算和 GC 后 JS heap，不能相加当作浏览器总 RAM，不承诺 OS/GPU 立即归还或数小时无增长。当前必要的隐藏后台页、活动播放/恢复意图及前看资源仍保留。没有重跑上一轮 4×CPU 帧率矩阵，不把本轮内存结果说成全设备帧率认证。

## 验证与章节准备

SDK `pnpm check`、352 单元、213 全浏览器、实际 tarball consumer、compatibility、package 审计通过；CLI 69/release 在第一阶段 `95823ec` 通过，provider 收窄后另验 32 项 HTTP/音频/加载/回收、完整 213 及 consumer/package。实例 `pnpm build`、90 Node 测试、3 提取器通过；18 项界面回归通过，最终 provider 实包又通过 11 项滚轮/存档/历史/渐进音频回归。每次 Playwright 输出目录隔离，构建完成后再运行，未在浏览器读取期间替换 dist。

回归站 `MORGANA_RUN=wheel-memory FATA_READING_MS=100 pnpm exec playwright test --config playwright.remote.config.ts ...` 实际 9 项通过：滚轮与偏好、确认层取消、历史/BGM、OP 渐进播放、PB 原字节传输及同一序章 95 次快速推进。默认 4 页、180 ms/750000 B/s/阅读 100 ms，P95 440 ms，资源暂停和 media waiting 均 0，最大驻留 66692315 < 67108864。公网波动与原作转场仍存在，不声称零等待。

`pnpm exec tsx --test tests/door-ir.test.ts tests/next-door-ir.test.ts` 两项通过：既有第一门八语控制顺序不变；前置间章 79–80 段，第二门含章尾间章 3672–3682 段，各语言全部标签、控制顺序、脚本数据、段落边界与去往 scenario2/scenario3 的跳转保留，second20 之后没有截掉。下一步处理有限条件/选择、noise/heartbeat/eyecatch 等源宏及高级代码模块组合，未生成第二门可玩程序。新增测试的私有暂存前提是 `pnpm chapters:convert interlude1 --staging` 和 `pnpm chapters:convert door2 --staging`。

32 个剧情程序/release/压缩文件及 910 个媒体与前版逐文件相同；变化仅界面标题元数据、UI PO/PB 和前端。没有新增媒体上传。发布核验见下文。

## 发布核验

最终子模块文档修订 d5b541c65e36246f01edb6174870b252885c7953，以 `pnpm sdk:build` 复现同一 57f43cd113cf 实包。`pnpm exec tsx tooling/prepare-edge.ts regression` 后部署回归，版本396f4ad4-9fd5-4966-aa9c-e98b569f728a；全部9项通过后，从冻结dist准备preview并部署版本5389e102-a688-4009-ae85-efa4787de872。

`pnpm preview:check`匿名核验109文件、39883907 decoded bytes与本地一致，媒体Range通过；回归匿名401。Worker/前端目录隔离，原910个私有R2资产未改写，也未加服务器限速。SDK只正常快进myouo/galbox main；实例只对已确认旧main 55a7e8b7314cc289aed491c02dcd63ef3fbfec88 使用明确force-with-lease，维持单个无父根提交，无LICENSE。不推旧分支/tag，最终引用及提交树审计留本地ignored artifacts/wheel-memory。
