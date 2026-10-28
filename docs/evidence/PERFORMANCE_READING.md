# 立绘运动、驻留资源与快速阅读

2026-10-30 接续。当前改动是 SDK H3-03 / W1-06 的性能与媒体连续性修复；第二门、设置/历史页的原作对照和右键隐藏属于后续 F-01F / G1-05，没有据此标完成。

SDK 生产源码 `e95be27d7995d44f880ae83cd27f977c323db172`，独立实例实际安装 `vendor/galbox-sdk-647a24aaebd3.tgz`，SHA256 `647a24aaebd3eb537dcff5ae16a1e59dbbe45ef2b0b80b508b56d303c0d8f14a`。只用公开 exports，没有复制 SDK 实现。比较基线为此前第一门发布的 SDK `5c965e5` / tarball `4ab3e922857c`。

逐帧复用引擎已校验的不可变状态和静态目录；移动角色时保留未改变的 Pixi 层级。Canvas 对未变的上层和静态角色颜色工作面复用已有结果，完成绘制后交换已有下层画布，减少整屏读回/复制；隐藏备用层不再预留未使用的滤镜工作面。不增加缓存画布或资源预算，WebGL、转场和截图仍走原生产路径。

连续翻页先接续仍有用的预取，再释放旧窗口；资源准备仍阻止剧情提交、输入和保存，已有音乐继续。预备的版本音频元素由首个播放声部独占接手，另一个声部仍有独立播放头；未消费元素在缓存淘汰/销毁时释放。保留原 HTTP 版本重验，不以预载绕过版本变化/离线/失败。完整编码字节和 1 MiB 设备预留计入流音频驻留估算。实例默认提前 4 页，0/2/4/8 页可保存；真正超过 350 ms 的资源等待显示小型加载提示。

## 固定工作负载

`tests/performance/playing.mjs` 从正式 Core 遍历得到的第一门 `dance` 存档恢复循环立绘，不手改快照。Canvas、1280×950、固定预取 2 页，正常 CPU 与 CDP 4 倍 CPU 降速分别比较；原始 `.cpuprofile`、逐帧记录和 GC 后 JS heap 留在 ignored `artifacts/performance/`。性能采样单独执行，不与全套测试同时运行。基线从保留的 `artifacts/door3/baseline-dist` 在 4182 端口服务，新版固定构建在 4183；两者使用相同 910 个媒体文件和相同剧情程序。驻留数字仅为 SDK 估算，不是浏览器总 RAM；CPU 降速也不等于真机认证。

网络回归在 `testsdk.morgana.love`，CDP 180 ms / 750000 B/s、每段阅读 100 ms，完整序章 95 次同源推进。预览和 Worker/R2 没有添加限速。`reading-network.spec.ts` 记录冷启动、推进 P50/P95/最大值、资源导致的 AudioContext 暂停、媒体 waiting 和驻留估算。`compare-reading.mjs` 比较同路线/网络/阅读间隔，要求所有策略保留音乐、驻留不超 64 MiB；延迟数值包括原作转场和新分支，逐项报告，不再要求按需策略故意暂停音乐。

历史基线：旧包提前 2 页、100 ms 阅读，P95 561.8 ms、资源暂停 11 次、媒体 waiting 1 次。上一轮最终实包公网 4 页记录为 P95 830.6 ms、资源暂停 0 次、媒体 waiting 0 次；该次没有证明推进 P95 优于旧包，不沿用更早中间包的 185 ms 成绩。真正冷资源、新分支和网络尾延迟仍可能等待，不声称全程本地般流畅。

本次公网 `MORGANA_RUN=resume-isolated FATA_READING_MS=100 pnpm exec playwright test --config playwright.remote.config.ts history-music.spec.ts prefetch-settings.spec.ts streaming.spec.ts reading-network.spec.ts static-transport.spec.ts`：15 项全部通过；`node tooling/compare-reading.mjs artifacts/remote/resume-isolated-results.json` 通过同路线/网络/驻留检查。

| 策略 | 推进 P50 ms | 推进 P95 ms | 资源暂停 | 媒体 waiting | 最大驻留字节 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 按需 0 页 | 20.6 | 1260.1 | 0 | 0 | 66160304 |
| 提前 2 页 | 21.5 | 1101.2 | 0 | 1 | 66692315 |
| 提前 4 页（默认） | 21.4 | 573.4 | 0 | 0 | 66692315 |
| 提前 8 页 | 20.7 | 1214.5 | 0 | 0 | 66692315 |

每种均 95 次推进、180 ms / 750000 B/s / 100 ms 阅读；冷启动为 13.4–15.2 秒。4 页在这次比较中优于按需和 2/8 页，不能推出普遍单调收益或零网络停顿。本次同时有其他功能回归在运行，CPU 负载与公网波动均会影响数值；它不是严格隔离的旧版/新版性能门槛。2 页的一次 waiting 如实保留。全部原始结果在 ignored artifacts/remote/resume-isolated-results.json。

## 最终同机性能对照

两版依次运行，期间没有其他浏览器回归。Chromium 156.0.8078.4、同一 driver SHA、同程序/存档/媒体、Canvas、预取 2 页。实际命令：`FATA_PROFILE_BASE=http://127.0.0.1:<4182或4183> FATA_PROFILE_CUTS=dance FATA_PROFILE_CPU=<1或4> FATA_PROFILE_DURATION=<10000或60000> node tests/performance/playing.mjs <resume-before或resume-after>-<CPU>`。正常 CPU 每版 10 秒，4 倍降速每版 60 秒。

| CPU 降速 | 帧 P95 ms（旧 → 新） | >33 ms 帧（旧 → 新） | GC 后 heap 字节（旧 → 新） | 本次 heap 增量字节（旧 → 新） |
| --- | ---: | ---: | ---: | ---: |
| 1× | 19.4 → 17.9 | 0 → 0 | 39706180 → 38781872 | 1859400 → 1360996 |
| 4× | 74.9 → 59.1 | 859 → 1085 | 40846604 → 38986440 | 3003212 → 1433320 |

普通 CPU 本次两版均已接近 60 Hz 上限，P95 仅改善约 7.7%；探索比较器自设的“普通 CPU 至少改善 20%”断言未通过，失败日志保留，不能称它通过，也不复用更早 37.7 ms 的基线。4 倍降速 P95 改善约 21.1%，仍有明显低帧率，不能宣称弱设备已达到 60 FPS。隔离身份、无设备错误、64 MiB 估算预算及单次 GC 后 heap 增量检查通过。

资源驻留估算 32023152 → 37440158 字节，增加来自版本音频编码字节/设备预留的保守计账；总上限保持 67108864。GC 后 JS heap 和单次增长降低，不据此断言浏览器总 RAM、GPU/原生媒体缓冲或数小时游玩均无增长。原始输出 `artifacts/performance/resume-{before,after}-{1,4}-playing.json`、CPU profiles、比较失败和汇总均保留于 ignored artifacts。

## 本次验收

已实际执行 `pnpm check`、`pnpm test`、`pnpm test:consumer`、`pnpm test:compatibility`、`pnpm test:cli`：SDK 350 单元、独立实包播放/保存/刷新/备份及 CLI 69 命令通过，原生存档认证仍按工具报告保留缺口。SDK `pnpm test:browser` 全部 209 项通过，`pnpm test:release` / `pnpm test:package` 通过。实例 `pnpm check` / `pnpm test` / `pnpm build` / `pnpm cloudflare:check` 通过：89 项 TypeScript 测试和 3 项提取器测试，包括八语整章 Core 遍历、原存档切点和迁移；41 个 PB 的无损压缩为 30938158 → 3593138 字节。

实例最初的全浏览器运行在整章中途失败：测试尚在读取时，同一 `dist` 被本轮并行构建替换，trace 记录了音频瞬时 404，继而 AUDIO_UNAVAILABLE；该次运行日志保留且不作为通过证据。修正构建/运行顺序，在固定输出的独立本地端口重跑整章和定向浏览器集。公网初次高负载运行亦有激活就绪失败；辅助函数现要求 lifecycle=playing 后才推进测试时钟，15 秒就绪门槛和产品超时均未提高。随后两次本地运行共用 Playwright 产物目录，使整章全部断言完成后仍在 trace 收尾报 ENOENT；该次不记为 runner 通过。31 项定向浏览器集已全部通过（八语回放、五种演出、真实存档刷新、历史音乐、预取、Canvas、快捷菜单与滚轮）。最终实际命令 `pnpm exec playwright test tests/browser/door1.spec.ts --grep 'complete first door' --output artifacts/continuation/whole-door-final-output`：1 项正式通过（11.5 分钟）；全部正文、500/1500 段保存刷新、章末解锁、最终存档及历史查看通过，runner 正常收尾。JSON 复制到 ignored artifacts/continuation/whole-door-final.json。31 项定向集另在 artifacts/continuation/app-focused.json。最终 SDK 子模块 b3d5f5a3513991203807986e4207559f2c8063a8 通过 `pnpm sdk:build` 复现同一 647a24aaebd3 实包，工作区干净。部署与推送见下文。

新旧本地构建的 48 个程序文件及 910 个媒体文件逐文件 SHA 一致，没有新增/移除或改变。SDK 待推引用的 87 个历史提交已检查原资料路径，作品相关历史路径仅短 Markdown；既有 SDK 历史证据日志未重写，凭据模式扫描无命中，当前树不含日志。实例保持单根提交、无 LICENSE，最终提交后再核查可达树。原资料、存档切点、资源、登录、构建和本轮原始日志不提交。

## 发布

本轮没有新增媒体，不重复上传/改写 910 个 R2 对象。冻结的本地 dist 共 1019 个文件，打包 SDK 文档修订后摘要集合仍完全一致。实际执行 `pnpm exec tsx tooling/prepare-edge.ts preview`、`env -u CLOUDFLARE_API_TOKEN pnpm exec wrangler deploy`、`pnpm preview:check`。

预览 Worker 版本 `6e33b555-a3c0-4f9e-a554-f465e02c9ecf`；回归保留已验收的 `7ddf7f80-f543-4549-8ddc-7a55f32d593a`，发布目录/Worker 分开，共用原私有 R2 桶。预览匿名读取 109 个前端/文本/压缩文件、39875622 decoded bytes，与本地 dist 全部一致，媒体 Range 正常；回归匿名请求仍为 401。没有 Worker/R2/预览限速。

只推 myouo/galbox 与 myouo/morgana 的 main：SDK 正常快进到 b3d5f5a；实例维持一个无父根提交、无 LICENSE，仅对事先确认的旧 main a5f079598ea219abffcacd495a800c191c9ea93a 使用精确 force-with-lease。最终远端/可达树核对结果留 ignored artifacts/continuation；没有推旧分支/tag、原包/KS/TJS、二进制素材、登录或原始记录。
