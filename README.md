# The House in Fata Morgana

《海市蜃楼之馆》的独立 Web 移植工程。读取用户提供的 Steam KRKR2 版本（app303310/build21523397）的 KS/TJS、宏和资源，转换为标准 Program/protobuf，由独立安装的 [galbox SDK](https://github.com/myouo/galbox) 执行。

**游玩：[fata.morgana.love](https://fata.morgana.love)** · [当前范围](STATUS.md) · [参与贡献](CONTRIBUTING.md) · [文档索引](docs/README.md)

已发布八种语言的序章、第一至八门、终章、两次调查和七个坏结局，并接入原章节书、通关标题、画廊、音乐室、后台与隐藏序章。中英七结局累计解锁已验收；原作逐像素、原生存档互通和全部累计路径仍分别验收，见[差异清单](docs/REPLICA_GAPS.md)。

## 从哪里开始

| 想做什么 | 入口 |
| --- | --- |
| 修正文案、翻译 | [翻译指南](locales/README.md)，编辑 `locales/<BCP47>/*.po` 或 `chapters/` |
| 修改界面、输入、存档适配 | `src/`，先读[贡献指南](CONTRIBUTING.md) |
| 修改源解析、转换和表现映射 | `tooling/`，先读[架构](docs/ARCHITECTURE.md)与[开发说明](docs/DEVELOPMENT.md) |
| 修复通用引擎能力 | `galbox/` 子模块；构建真实 tarball 后由本工程消费 |
| 报告问题 | 附语言、浏览器、复现操作和预期结果；不要提交原游戏文件、存档或凭据 |

## 安装与检查

需要 Node.js ≥22.12（本机验收为 Node 24）、`package.json` 指定版本的 pnpm，以及 Git。先构建 SDK 实包，再安装本工程依赖：

```sh
git clone --recurse-submodules https://github.com/myouo/morgana.git
cd morgana
pnpm sdk:build
pnpm install --frozen-lockfile
pnpm check
pnpm test
```

`pnpm check` 和 `pnpm test` 不需要游戏资料或线上登录。后者只运行合成数据/仓库文本的单元测试；原资料与旧档回归另用 `pnpm test:source`，详见[测试说明](tests/README.md)。

完整游戏、旧发布快照、依赖 tarball 和生成站点不随 Git 分发。本地游玩需要自行准备原资料及已验证的 `generated/integrated`，见[开发说明](docs/DEVELOPMENT.md)；准备好后，统一使用 `pnpm dev`，访问 `http://127.0.0.1:4184/?lang=zh`。`pnpm convert` 目前只生成序章/第一门基线，不能当作整作一键构建。

## 项目边界

游戏安装目录只读；TJS 仅作数据解析，不执行 `eval`，不增加另一套剧情解释器。SDK 只通过实际 tarball 和公开 exports 使用。Git 保存适配源码、测试和已整理 PO；原包、KS/TJS、二进制素材、存档、生成物、日志和凭据全部留在 ignored 目录。

正式站与 Requiem 独立；`test.morgana.love` 仅作测试预览，`testsdk.morgana.love` 用于鉴权回归。存档按语言和域名隔离，测试域旧档不会自动迁往正式站。部署与当前版本见[部署说明](deployment/README.md)和[正式发布记录](docs/evidence/PRODUCTION_FATA.md)。
