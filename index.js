const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { init: initDB, Counter } = require("./db");

const logger = morgan("tiny");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(logger);

// 首页
app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// 更新计数
app.post("/api/count", async (req, res) => {
  const { action } = req.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }
  res.send({
    code: 0,
    data: await Counter.count(),
  });
});

// 获取计数
app.get("/api/count", async (req, res) => {
  const result = await Counter.count();
  res.send({
    code: 0,
    data: result,
  });
});

// 小程序调用，获取微信 Open ID
app.get("/api/wx_openid", async (req, res) => {
  if (req.headers["x-wx-source"]) {
    res.send(req.headers["x-wx-openid"]);
  }
});
// ========== 去水印解析接口 ==========
app.use(express.json());

app.post('/api/parse', async (req, res) => {
  try {
    const url = (req.body && req.body.url) || '';
    if (!url) {
      return res.json({ code: 400, msg: 'url 不能为空', data: {} });
    }

    // 占位：后续替换为真实解析逻辑
    const result = await parseShareUrl(url);

    return res.json({
      code: 1,
      msg: '解析成功',
      data: result || {}
    });
  } catch (e) {
    console.error('parse error:', e);
    return res.json({ code: 500, msg: String(e.message || e), data: {} });
  }
});

// 占位函数，后续按平台实现
async function parseShareUrl(url) {
  // TODO: 根据 url 判断平台，调用对应解析器
  // 返回格式: { platform, type, title, author, cover_url, video_url, images }
  return {};
}

const port = process.env.PORT || 80;

async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}

bootstrap();
