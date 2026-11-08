# 本地开发

先完成[贡献指南](../CONTRIBUTING.md)中的 SDK 实包构建和依赖安装。改翻译、界面单元或数据模型时，可以只运行 `pnpm check`、`pnpm test`，无需原游戏或线上账号。

## 原资料与 Python

完整转换面向用户提供的 Steam KRKR2 发行版 app303310/build21523397。原安装只读，提取结果进入 `private/`，报告进入 `artifacts/`。游戏、字体、旧发布快照均不随仓库分发。

```sh
uv venv private/.venv
uv pip sync --python private/.venv/bin/python requirements.txt
export FATA_SOURCE='/absolute/path/to/The House in Fata Morgana'
pnpm extract --source "$FATA_SOURCE"
pnpm inspect
```

`FATA_SOURCE` 用于转换/字体工具；提取器通过 `--source` 读取同一目录。已删除未被代码读取的 `source.example.yaml`，不再要求编辑一份无效配置。Python ≥3.11，依赖版本锁在 `requirements.txt`；提取会检查索引、路径和校验，不运行原脚本。

合成XP3/图像规则测试不需要游戏；依赖安装在虚拟环境时运行：

```sh
PATH="$PWD/private/.venv/bin:$PATH" pnpm test:extractor
```

## 唯一日常应用入口

当前主应用为 `src/main.tsx`，默认数据为 `generated/integrated`。Vite 默认进入模块化主线；`FATA_MODULES=0` 仅供旧单门兼容测试。不要把旧独立章节夹具当作当前主线。

`pnpm dev`、普通/正式build会先从PO重生八份系统UI目录；只写`text/<language>.ui.pb`及其Brotli副本，不改变剧情/存档身份。直接启动专项Vite、或单独修正系统文字时，可先运行 `pnpm exec tsx tooling/refresh-interface-text.ts`。原资料和完整整合目录的前置条件仍然保留。

已有通过验收的整合目录时：

```sh
pnpm dev
# http://127.0.0.1:4184/?lang=zh
pnpm build
pnpm test:browser
```

语言参数为 `en/fr/it/jp/ko/pt-br/ru/zh`，PO目录使用对应BCP47（如 `ja`、`zh-Hans`）。默认优先WebGL2，可用 `?renderer=canvas` 验证兼容路径。更新SDK实包后重启Vite；旧预构建未刷新时用 `FATA_MODULES=1 pnpm exec vite --force`。

`generated/integrated` 不是空目录即可替代的测试夹具。新clone不会自动获得完整游戏，当前也尚无单条从零重建整作和全部旧版兼容快照的命令。缺失原资料/基线时，保留明确失败，并在贡献中注明没有运行完整游戏；不要填充空PB、虚构旧来源或将载荷提交进Git。

## 转换与基线

`pnpm convert` 从原资料、PO及宏生成序章/完整第一门基线 `generated/site`。它不是当前整作构建；在已验证的整合目录中仅重跑它，也不会自动更新后续章节。

后续主线按明确父版逐阶段编译、校验、提升，并保留旧程序/资源SHA，供当前网页旧槽迁移使用。既有环境接续时先确认相应证据中的父版身份；每个阶段使用 `pnpm exec tsx tooling/<工具>.ts`，工具导航见[这里](../tooling/README.md)。主要阶段记录为：

1. [两门整合](evidence/INTEGRATED_DOORS.md)、[三门接续](evidence/CONNECTED_DOORS.md)、[实时效果](evidence/HEARTBEAT_REALTIME.md)。
2. [调查接续](evidence/SEARCH_CONNECTION.md)、[四门整合](evidence/FOURTH_DOOR_FULL.md)、[原界面](evidence/INTERACTIVE_UI.md)。
3. [第五门](evidence/FIFTH_MAINLINE.md)、[第六门](evidence/SIXTH_MAINLINE.md)、[第二次调查](evidence/SECOND_INVESTIGATION.md)、[第七门](evidence/SEVENTH_DOOR_PROGRESS.md)、[第八门与终章](evidence/EIGHTH_AND_ENDING_PROGRESS.md)。
4. [原章节菜单](NATIVE_CHAPTER_REPORT.md)、[奖励与通关态](evidence/POSTCLEAR_RELEASE.md)、[实时通关态](evidence/REALTIME_MAIN_COMPOSITION.md)。
5. [历史主包](evidence/HISTORY_MAIN_COMPOSITION.md)、[阅读收尾发布](evidence/READING_POLISH_RELEASE.md)、[正式入口](evidence/PRODUCTION_FATA.md)。

这些记录是阶段证据，不是一份可在任意父版上顺序重放的脚本。首次准备冻结旧来源需参照对应源码和记录；已经固定的旧来源保持不可变。`compat:fetch` 只负责已登记的早期兼容 Program，不会下载全部整作素材和快照。

## 目录与发布

| 路径 | 用途 |
| --- | --- |
| `private/extracted`、`private/text` | 原包提取结果与可解析脚本 |
| `private/compat*` | 真实旧发布来源；兼容验收所需 |
| `public/` | 转换暂存，不能直接当成当前发布目录 |
| `generated/site` | 序章/第一门发布基线 |
| `generated/integrated` | 当前完整主线的本地输入 |
| `generated/edge-*` | 相互隔离的预览/回归/正式发布树 |
| `dist/`、`dist.production/` | 前端构建结果 |
| `artifacts/` | 本机清单、切点、日志、截图和trace |

以上路径全部 ignored。当前SDK通过 `vendor/` tarball独立安装，不能改成workspace源码引用。正式发布会在编译时移除测试导入钩子；发布、R2上传和线上回归见[部署说明](../deployment/README.md)，不属于普通贡献的必跑步骤。
