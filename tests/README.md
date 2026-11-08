# 测试入口

所有命令在仓库根目录执行。先按[贡献指南](../CONTRIBUTING.md)构建 SDK 实包并安装依赖。

| 命令 | 验证内容 | 前置资料 |
| --- | --- | --- |
| `pnpm check` | 全部 TS/TSX、八语 PO/章节契约、提交边界 | 仓库文件和已安装 SDK |
| `pnpm test` | `unit/`：合成 KAG、PO、历史 UI、迁移计划和 HTTP 协议 | 仓库文件和已安装 SDK |
| `pnpm test:extractor` | 合成 XP3、图像规则 | Python 及 `requirements.txt`，不需要游戏 |
| `pnpm test:source` | `source/`：原宏/正文/素材、生成程序及旧档回归 | 对应原资料、发布快照和生成物 |
| `pnpm test:browser` | 当前主应用的八语标题、中英原菜单存刷读和触屏快进冒烟 | Chromium、已准备的整合站点；不需要旧档夹具 |
| `pnpm test:edge` | 本地 workerd 鉴权、缓存、Brotli、Range | Python、已安装 Wrangler；使用合成资源 |
| `pnpm test:remote` | 鉴权测试域的网络回归 | 已发布测试版本、本机回归凭据与夹具 |

`pnpm test` 不混入必须读取原资料的回归；后者缺资料时明确失败，不以 skip 冒充通过。当前无游戏资料环境验证默认单元测试为59项、0跳过；这不是整作或原生存档兼容的验收数量。

Python依赖装在 `private/.venv` 时，使用 `PATH="$PWD/private/.venv/bin:$PATH" pnpm test:extractor`。

默认浏览器配置为根目录 `playwright.config.ts`，指向 `config/local.config.ts` 和当前主应用；自动在本机4261启动独立测试服务，避免占用日常开发的4184。`smoke-browser/`只通过原菜单操作，不导入存档切点。各章节的独立小应用只作为测试夹具，不作为贡献者的开发入口。

```sh
pnpm exec playwright install chromium
pnpm test:browser --list
# 专项回归示例，先按对应证据记录准备生成物：
pnpm exec playwright test --config tests/config/history-prefix.config.ts --list
pnpm exec playwright test --config tests/config/full-door.config.ts
# 横竖屏触屏、左右Ctrl、八语未读快进选项与持久化：
pnpm exec playwright test --config tests/config/touch-skip.config.ts
# 两门/三门兼容接续矩阵仍单独保留：
pnpm exec playwright test --config tests/config/integrated.config.ts
```

配置和测试产物路径基于仓库根目录解析；`config/paths.ts` 统一提供路径，避免从根入口和专项入口运行时相对路径漂移。默认本地配置不读取线上密码。远端配置会读取 ignored 的 `private/cloudflare/auth-header.txt`，不要向 Issue/PR 上传 Playwright JSON 配置或原始 trace。

正式站有独立的真实UI冒烟配置，编译产物中不启用测试导入钩子：

```sh
FATA_PRODUCTION_ORIGIN=https://fata.morgana.love pnpm test:browser:production
```

未设置该变量时，正式配置只连接本机4260的正式构建预览服务，需要维护者自行准备；日常开发使用自动启动4261服务的 `pnpm test:browser`。两种配置共用真实UI流程，正式配置额外带 `__test` 查询验证导入钩子仍被编译关闭。

旧章节夹具需要与当前前端匹配的系统UI目录。出现 `UI_TEXT_MISSING` 时先检查夹具的UI生成版本，按当前PO重建对应 `InterfaceTextCatalog`；不要填默认文字或删校验来掩盖旧产物。

网络故障、损坏资源及慢网回归仍放在 `testsdk.morgana.love`，节流仅在测试浏览器CDP中模拟。当前默认/专项配置不自动发布任何站点。

`docs/evidence/` 的历史记录保留当时实际执行的旧配置名、测试路径及阶段命令。当前专项配置从根目录的 `playwright.<name>.config.ts` 移到 `tests/config/<name>.config.ts`；普通TS测试从 `tests/` 分到 `unit/`、`source/`。旧第一门默认配置保留为 `config/legacy.config.ts`，废弃的局部二门演示已经移除。
