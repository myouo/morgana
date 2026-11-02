# 存读档继续提速（2026-11-02）

本轮继续解决实际读档等待，没有改变游戏进度、存档格式或原作表现参数。
实例仍只消费 SDK 实际 tarball 和 public exports。原资料、生成程序、素材、
存档、CPU profile 与浏览器 trace 仍在 ignored 目录。

## 改动

SDK 在摘要、原始 ABI 与资源绑定验证后保留不可变代码，内部复用已链接的
模块投影，公开 DTO 仍独立。内存内 HTTP 代码缓存有 64 条/64MiB 估计库存
上限；验证来源绑定和完整 URL 后才可复用，自定义 provider 始终经过 acquire。
可变输入、克隆伪造、坏摘要、错 ABI、取消或未知函数均不能跳过检查。

旧档迁移改为按实际调用栈、任务来源、窗口、历史文字与图像过滤来源选择
代码。调查样本由 34 模块/18684178 编码字节降到 5 模块/2721664 字节。
原宽绑定先检查，再收敛可达闭包；不重写旧槽位或猜测玩家选择。

只读存储查询只解析返回的 profile/head、目标槽位、历史或摘要，仍检查原热根
容量和当前持久化权威；写入保持完整验证、事务与 CAS。恢复时只对当前流程
内部完整校验并冻结的同源候选复用证明，实际持久化返回值先重新解析，再
逐字段比较；外部克隆/不同内容/注册表/模式不会继承。普通数字零按原协议
规范化，f64 位模式仍精确保留。

切换会话仍停止旧媒体、更新 epoch 并重画 WebGL 前景；背景画布的像素若与
目标切点完全相同则保留。相机、滤镜、图层、栅格阶段或背景变化仍会重画。
真实像素测试覆盖相同切点复用和不同颜色切点恢复，没有以缩略图代替恢复。

## 实测与限制

默认 auto/WebGL、本机 Chromium、真实调查档、无网络节流，计时直到
`player.load` 完成持久化确认、真实 Core/媒体/画面接管并停在
`search-places:wait`。刷新并清 HTTP 缓存的首次读取与同页连续读取分开记录；
不把有 CPU 采样的计时混入下面的无采样结果。

最终源码实现 aeaa8bf，文档验收提交 bb00d77；tarball SHA256
`e72d64250792d2fd304bab99f0bdf4f689c4978ba9e7b0e248ca389d8737feea`。

| 实际工作负载 | 上一轮发布记录 | 本轮最终实包 |
| --- | ---: | ---: |
| 当前档首次冷读 | 3344ms | 1652ms |
| 当前档同页再读 | 1190–1374ms | 480–495ms |
| 旧档首次迁移冷读 | 20341ms | 2802ms |
| 旧档同页再读 | 2376–2392ms | 607–614ms |

连续读取已低于1秒；首次冷读仍未全部达到1秒。不同时间机器/GPU负载有变化，
以上不是相同硬件负载的严格倍数、用户设备/公网延迟或 P95 承诺。中途负载
较高的一轮曾整体变慢；没有删除这一限制，也没有为了数据改用 Canvas。

最终同切点保存：无图181–197ms、图文360–507ms。真实40图文槽全部创建，
再逐槽覆盖保留上一修订，然后连续覆盖第20槽三次为498/498/547ms，最长
主线程任务121/128/122ms；40槽仍存在，文字/帧保持原切点，再读和刷新读回
均停在 `search-places:wait`。3项最终性能浏览器测试通过（2.4分钟），没有
出现容量拒绝或卡死。CPU采样的图文保存与未采样满槽覆盖分别记录，不混作P95。

## 验证

- SDK `pnpm check`、449 单元（89文件）、35 项真实浏览器与
  `pnpm test:consumer` 独立 tarball 安装通过；精确恢复比较收尾再次通过
  `pnpm check` 与针对性证明测试。测试初版错误地把 f64 位字符串当作原生
  数字负零，随后改为验证既有规范化及正负零位模式，没有修改协议来过测试。
- 实例 `pnpm check`、`pnpm test`：116 Node / 7 Python 通过。
  `pnpm exec tsx tooling/verify-scoped-save-cuts.ts all`：8语127真实旧切点
  通过，每切点最多6模块，保留文字、帧与任务时钟，原槽位 DTO 未修改。
- `pnpm sdk:update` 消费新的真实 tarball；性能命令为
  `pnpm exec playwright test --config playwright.performance.config.ts load-profile.spec.ts -g auto`。
  性能配置只允许隔离本地浏览器，不在预览或 Worker 注入节流。

最终性能命令：
`pnpm exec playwright test --config playwright.performance.config.ts -g 'auto profile|populated forty|logical and illustrated'`。

最终来源 `bb00d770d74a45eb0e623e791ce6fd13d3c5755d` 上执行
`pnpm sdk:build` 重现相同 e72d64250792 实包；此包再次通过八语127旧切点和
`pnpm build`。新增公网刷新读档测试后又运行 `pnpm exec tsc --noEmit` 通过。

## 发布与公网

同一本地构建先部署回归 `5100a554-19bb-445f-b8a4-25e0537599df`，再部署预览
`9f4391d1-c85b-4a80-999b-94c95ebf79a5`。两个目录/Worker继续隔离，只更新
5个前端文件；没有新增媒体或重复上传R2游戏载荷。

`FATA_INTERFACE_ORIGIN=https://testsdk.morgana.love FATA_INTERFACE_RUN=instant-final pnpm exec playwright test --config playwright.interactions.config.ts interface.spec.ts -g 'source load confirmation|source save pages|SDK chapter menu'`
得到4项通过（3.0分钟）：实际界面确认读档、刷新后的保存切点与文字恢复、
连续读取、保护/取消删除/删除，以及英中章节/结局/隔离调查回放。新用例不靠
固定成功对象或延长产品时限，读取后确实比较 frames/textId/epoch。

公网两次同页读取实测628ms与2093ms，有明显波动。媒体激活仍保留联网版本
重检；不能将本机0.5秒样本称为所有公网操作稳定1秒，也不把该波动隐藏。
预览只正常读取和字节核对；所有自动化交互均在testsdk，无站点/Worker/R2节流。

最终 `pnpm preview:check` 通过：1953文件、780076631解码字节与本地dist
逐文件相同，匿名访问/媒体Range通过，回归仍鉴权。实例实现731052c，SDK
main为bb00d77；只对已授权main正常追加/快进，不强推或推旧分支/tag。实例
可达历史和两库本轮发布差异路径检查没有真实KS/TJS/XP3、原包、解包素材、
生成载荷、存档、tarball或日志；SDK旧历史中的原创合成fixture另行区分。

第五门、原生存档兼容和原作逐像素/全通状态验收不因本轮性能结果扩大认证。
