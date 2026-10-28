# 可玩预览与独立网络回归

独立工程通过实际SDK tarball运行。`test.morgana.love`是本地Vite build的可玩预览，`testsdk.morgana.love`是自动化回归。两者使用不同Worker与前端目录，均由静态前端/程序/文本与私有R2绑定组成，桶名`morgana-sdk-network-test`。`workers.dev`和preview URL关闭，桶r2.dev公开入口关闭。按用户要求，preview环境直接公开页面和媒体；regression环境仍先认证。登录资料只在本机ignored `private/cloudflare/access.md`，Worker只保存`TEST_AUTH` secret。

`pnpm convert`先将原作准备到ignored public，再仅按8语言Program和标题/菜单资源闭包构建`generated/site.next`；全部摘要与文本绑定通过后原子提升为`generated/site`。Vite只服务该发布目录，旧public孤儿不会进入构建/上传。8语言字面剧情和UI分别为protobuf，模板摘要/文本身份验证后恢复标准Program，原图片里的文字继续作为本地化图片。

资源为`assets/shared/{images,audio,fonts}/<sha256>.<ext>`或`assets/locales/<BCP47>/...`；只有全部语言引用的相同字节共享，其余保守归属所选语言。前端只请求当前语言目录。切换语言确认后回标题，字体/美术/正文/UI/locale偏好同步；存档按语言隔离，已登记旧32/93页SDK槽自动迁移并保留，未知release拒绝。

`pnpm cloudflare:prepare`只把前端和protobuf目录复制到`generated/edge-preview`（回归为`generated/edge-regression`），媒体只进R2。`pnpm r2:upload --oauth`使用已有Wrangler OAuth、4并发、完整摘要对象名校验与可续传标记；不删除既有对象。不要对其他桶执行该脚本。本机环境变量API Token缺R2权限，所以本次明确选择已登录的OAuth。

在本机接续：

```sh
pnpm install --frozen-lockfile
pnpm convert
pnpm cloudflare:check
pnpm test
pnpm test:browser
pnpm r2:upload --oauth
env -u CLOUDFLARE_API_TOKEN pnpm cloudflare:deploy
env -u CLOUDFLARE_API_TOKEN pnpm cloudflare:deploy:regression
pnpm preview:check
pnpm r2:probe
MORGANA_RUN=full pnpm test:remote
```

新clone不含原资料、SDK tarball、生成站点或登录secret，先按项目intake/安装记录准备；不得提交这些内容。本机已有登录不需要再生成密码。预览不再使用TEST_AUTH；回归写入命令加`--env regression`。需要写入Worker时用`env -u CLOUDFLARE_API_TOKEN pnpm exec wrangler secret put TEST_AUTH < private/cloudflare/auth-header.txt`，不把值放命令参数。

Worker对R2响应直接传递body流，支持HEAD、单范围/后缀Range、强版本ETag、If-Match/If-None-Match/If-Range、304/404/405/412/416。回归环境先认证再查Cache API；内部缓存公共不可变字节，浏览器响应为private immutable。响应头用Headers.set覆盖，避免大小写不同的Cache-Control被合并而残留private导致MISS。失败缓存写入只记录固定错误码，无凭据。

实例当前默认balanced、提前4页、64MiB估算驻留，设置提供0/2/4/8页；`?loading=demand`提供纯按需。长音乐和长音效使用versioned-url渐进传输。资源目录可以大于驻留集，实际加载仍受预算和引用约束。64MiB不是浏览器总内存硬上限。

本轮是完整新周目序章和第一门；原版逐帧、原生存档、第二门以后及真实多机型仍另验。授权只覆盖两个test子域名和专桶，不扩展根域名或其他作品。

限速只存在tests/browser/network.spec.ts中的Chrome CDP模拟（180ms、750000B/s），不会写入构建、Worker或R2，也没有部署站点带宽限额。自动化配置与资源全量probe固定指向testsdk，预览只进行无时钟/无故障注入/无节流的构建一致性读取。`pnpm preview:check`逐文件确认预览与本地dist相同，并校验预览匿名访问及回归鉴权。

原包、解包目录、KS/TJS、图像/音频/字体等二进制提取物由ignore和提交边界检查双重排除；用户允许的i18n文本与解包脚本分别管理，本轮整理后的PO正文/UI文本作为贡献源入Git，原KS/TJS留在本地ignored目录。GitHub实例只含迁移器/应用/测试/配置/文档，不携带游戏载荷。

长音乐使用SHA版本化HTTP串流；Worker检查galbox-version与内容地址，HEAD/Range保持原协议。Vite dev/preview同样接versioned-media中间件；不再靠完整OP音轨bytes阻挡首屏。测试streaming.spec.ts在CDP慢网下证明OP实际playing时累计媒体体字节小于整轨；下载限速只存在于该测试，站点/R2没有限速。

静态PB由本地build生成`.pb.br`无损副本；Worker按Accept-Encoding选择，使用encodeBody=manual避免重复压缩，保留原URL、原始PB回退、ETag/HEAD与鉴权。41个PB本地实测30937690→3592854字节，英语程序+正文3531372→397481字节。`pnpm test:edge`以真正workerd验证压缩和R2缓存协议；原文本和保存身份不改变。规范依据：[Cloudflare Response](https://developers.cloudflare.com/workers/runtime-apis/response/)；HEAD可省略Content-Length，见[RFC9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.3.2)。
