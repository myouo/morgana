# 正式入口、测试预览与网络回归

正式入口为 [fata.morgana.love](https://fata.morgana.love)，Worker `fata-morgana`，
发布目录 `generated/edge-production`。独立于 Requiem 和主域粉丝站；
当前版本、线上真实UI及字节核验见[正式发布记录](../docs/evidence/PRODUCTION_FATA.md)。

2026-11-07最新阅读收尾已发布到两站，SDK实包d222adf212da（来源bd2cab2）。
27项线上检查、旧线上40175已读存档的v4→v5布局升级、匿名预览存刷及
7196文件全站字节核对通过，见[发布记录](../docs/evidence/READING_POLISH_RELEASE.md)。

第五门主线、八语章节回放、旧终点续接及发布验收状态见[第五门记录](../docs/evidence/FIFTH_MAINLINE.md)。存读档提速记录见[秒级响应](../docs/evidence/INSTANT_LOAD.md)；第五门整合后的独立复测仍保持本机约0.5–0.6秒连续读取。

最新界面状态：过场点击/Enter/Ctrl、原存档分页/保护/删除、章节与调查回放及结局列表已验收并更新两站。新增资源仅进入已有专用私有R2；当前详情及百分百原作认证限制见[界面与交互记录](../docs/evidence/INTERACTIVE_UI.md)。

独立工程通过实际SDK tarball运行。`fata.morgana.love`是正式游玩入口，`test.morgana.love`是测试预览，`testsdk.morgana.love`是自动化回归。三者使用不同Worker与前端目录，均由静态前端/程序/文本与私有R2绑定组成，共用本作的桶`morgana-sdk-network-test`。`workers.dev`和preview URL关闭，桶r2.dev公开入口关闭。按用户要求，production/preview环境公开页面和媒体；regression环境仍先认证。登录资料只在本机ignored `private/cloudflare/access.md`，回归Worker只保存`TEST_AUTH` secret。

`pnpm convert`先将原作准备到ignored public，再仅按8语言Program和标题/菜单资源闭包构建`generated/site.next`；全部摘要与文本绑定通过后原子提升为`generated/site`。Vite只服务该发布目录，旧public孤儿不会进入构建/上传。8语言字面剧情和UI分别为protobuf，模板摘要/文本身份验证后恢复标准Program，原图片里的文字继续作为本地化图片。

资源为`assets/shared/{images,audio,fonts}/<sha256>.<ext>`或`assets/locales/<BCP47>/...`；按SHA复用相同字节，旧路径继续保留，所选语言的manifest决定实际闭包。切换语言确认后回标题，字体/美术/正文/UI/locale偏好同步；存档按语言隔离，已登记旧SDK槽自动迁移并保留，未知release拒绝。

`pnpm cloudflare:prepare`只把前端和protobuf目录复制到`generated/edge-preview`（回归为`generated/edge-regression`），媒体只进R2。上传脚本从当前程序/展示资源引用闭包取文件，不再扫描所有历史文件。`pnpm r2:upload --oauth`使用已有Wrangler OAuth、4并发、完整摘要对象名校验与可续传标记；不删除既有对象。不要对其他桶执行该脚本。本机环境变量API Token缺R2权限，所以本次明确选择已登录的OAuth。

正式构建 `pnpm build:production` 在已验证预览基础上，覆盖前端与由当前PO编译的
八份系统UI目录到独立`generated/edge-production`。`dist.production`不复制完整媒体，
剧情程序/正文不重编。准备步骤要求既有预览身份收据，验证八语清单/标题及代码摘要；
只有固定16个UI PB/Brotli路径可采用编译器输出，其余PB逐字节保持父版。
准备收据按日期写入`artifacts/production-YYYY-MM-DD`，可用`FATA_PRODUCTION_RUN`
指定一次独立验收目录，旧证据不覆盖。
`FATA_PRODUCTION=1`在编译时剔除测试导入钩子和test-seed模块；测试域仍保留回归能力。
当前命令面向本次冻结父版，父版变化后需先更新并通过对应验收，不能跳过收据门槛。

在本机接续：

先完成[贡献环境](../CONTRIBUTING.md)及[当前整合基线](../docs/DEVELOPMENT.md)准备。
下面是维护者的分阶段发布步骤，不是一份新clone的一键部署命令。

```sh
pnpm install --frozen-lockfile
# 已有经过对应章节验收的 generated/integrated 后：
pnpm cloudflare:check
pnpm test
pnpm test:browser
pnpm r2:upload --oauth
env -u CLOUDFLARE_API_TOKEN pnpm cloudflare:deploy
env -u CLOUDFLARE_API_TOKEN pnpm cloudflare:deploy:regression
pnpm preview:check
pnpm r2:probe
MORGANA_RUN=full pnpm test:remote
# 已有通过验收的预览父版后，单独构建与部署正式环境：
pnpm build:production
env -u CLOUDFLARE_API_TOKEN pnpm exec wrangler deploy --env production
FATA_PRODUCTION_ORIGIN=https://fata.morgana.love pnpm test:browser:production
FATA_CHECK_TARGET=production FATA_PREVIEW_VERSION=实际生产版本ID python3 tooling/check-preview.py
```

新clone不含原资料、SDK tarball、生成站点或登录secret，先按项目intake/安装记录准备；不得提交这些内容。本机已有登录不需要再生成密码。预览不再使用TEST_AUTH；回归写入命令加`--env regression`。需要写入Worker时用`env -u CLOUDFLARE_API_TOKEN pnpm exec wrangler secret put TEST_AUTH < private/cloudflare/auth-header.txt`，不把值放命令参数。

Worker对R2响应直接传递body流，支持HEAD、单范围/后缀Range、强版本ETag、If-Match/If-None-Match/If-Range、304/404/405/412/416。回归环境先认证再查Cache API；内部缓存公共不可变字节，浏览器响应为private immutable。响应头用Headers.set覆盖，避免大小写不同的Cache-Control被合并而残留private导致MISS。失败缓存写入只记录固定错误码，无凭据。

实例当前默认balanced、提前4页、64MiB估算驻留，设置提供0/2/4/8页；`?loading=demand`提供纯按需。长音乐和长音效使用versioned-url渐进传输。资源目录可以大于驻留集，实际加载仍受预算和引用约束。64MiB不是浏览器总内存硬上限。

当前主线包含八语序章、第一至八门、终章、两次调查和七个坏结局；完整范围与未认证矩阵见[STATUS](../STATUS.md)。原版逐帧/逐像素、全部累计路径、原生存档codec与真实多机型仍另验。用户授权增加本作正式子域名，不扩展根域名或其他作品。测试用Snapshot/Profile和备份切点不进入发布目录。

浏览器存档按域名隔离，测试域旧档不会自动出现在正式域。保留原测试入口，
不强制跳转；部分长期进度受便携备份100万JSON字符上限限制，跨域迁移不能
视为已完成，见差异F-07。

限速只存在tests/browser/network.spec.ts中的Chrome CDP模拟（180ms、750000B/s），不会写入构建、Worker或R2，也没有部署站点带宽限额。网络故障/慢网回归与资源全量probe固定指向testsdk，正式站/预览只进行无故障注入/无节流的真实UI及构建一致性读取。`pnpm preview:check`逐文件确认预览与本地dist相同；`FATA_CHECK_TARGET=production`核对正式树，其中前端与dist.production比较，16个系统UI文件与当前整合目录比较，其余与dist比较，同时校验匿名访问、媒体Range及回归鉴权。

原包、解包目录、KS/TJS、图像/音频/字体等二进制提取物由ignore和提交边界检查双重排除；用户允许的i18n文本与解包脚本分别管理，本轮整理后的PO正文/UI文本作为贡献源入Git，原KS/TJS留在本地ignored目录。GitHub实例只含迁移器/应用/测试/配置/文档，不携带游戏载荷。

长音乐使用SHA版本化HTTP串流；Worker检查galbox-version与内容地址，HEAD/Range保持原协议。Vite dev/preview同样接versioned-media中间件；不再靠完整OP音轨bytes阻挡首屏。测试streaming.spec.ts在CDP慢网下证明OP实际playing时累计媒体体字节小于整轨；下载限速只存在于该测试，站点/R2没有限速。

静态PB由本地build生成`.pb.br`无损副本；Worker按Accept-Encoding选择，使用encodeBody=manual避免重复压缩，保留原URL、原始PB回退、ETag/HEAD与鉴权。41个PB本地实测30937690→3592854字节，英语程序+正文3531372→397481字节。`pnpm test:edge`以真正workerd验证压缩和R2缓存协议；原文本和保存身份不改变。规范依据：[Cloudflare Response](https://developers.cloudflare.com/workers/runtime-apis/response/)；HEAD可省略Content-Length，见[RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.2)。
