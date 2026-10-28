# 媒体Range与边缘缓存

2026-10-28。公网全章回归在原Ogg的尾部Range准备上出现15秒超时；完整摘要正确、原生媒体独立探针存在成功与stall。不得因此加大浏览器时限或把完整Blob下载当流式成功。

原Worker对所有Range绕过缓存。现在授权、版本、If-Match/If-None-Match和range边界仍先校验，再用规范Range查询同域内容地址Cache API；命中必须核对206状态、Content-Length和Content-Range。返回仍是流，未命中直接R2范围读取。

只有完整GET或覆盖0至EOF的完整Range、且对象不超过8MiB时，才把完整响应以200流入缓存，删除Content-Range；不把部分206当完整对象。响应tee可能积累的内容由8MiB限定；较大媒体和部分范围直接串流。身份校验不因缓存命中跳过，不改预览公开/回归鉴权边界，不添加下载限速。未来大视频需要分块缓存策略另验。

依据[Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)：match支持带Content-Length的已缓存完整响应的Range，put不接纳206。类型使用当前wrangler生成的Worker绑定。实际收益和最终发布以evidence/PROLOGUE.md的真实网络复验为准，不能仅由这份设计声称已解决公网不稳定。

缓存命中时以校验过ETag/长度/MIME的完整响应提供元数据，HEAD不再回源；冷对象和缓存不一致仍回R2并使用原生etag条件读取。内容地址按immutable契约保留：若管理员删除R2对象，已缓存副本可持续到过期/显式清除，不把删除当即时失效操作。

`pnpm test:edge`在本地workerd中运行同一个生产Worker，使用合成bytes及独立local R2验证完整Range填充、缓存HEAD/尾段、部分响应不污染完整对象、If-Range/条件请求与暖缓存鉴权。测试固定凭据仅用于local fixture，不读取线上凭据，也不上传测试对象。
