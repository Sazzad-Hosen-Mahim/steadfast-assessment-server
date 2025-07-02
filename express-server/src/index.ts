import express from "express";
import axios from "axios";
import cors from "cors";
import https from "https";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://falcon-nexus.netlify.app",
  "https://steadfast-assessment-server.onrender.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposedHeaders: ["Content-Length", "X-Request-ID"],
  })
);

app.use((req, res, next) => {
  res.header(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  next();
});

app.use(["/api", "/storage", "/uploads"], async (req, res) => {
  const targetUrl = `https://157.230.240.97:9999${req.originalUrl}`;

  try {
    res.header({
      "Access-Control-Allow-Origin": req.headers.origin || allowedOrigins[0],
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin",
    });

    const response = await axios({
      url: targetUrl,
      method: req.method,
      responseType: "stream",
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      transformResponse: [
        (data) => {
          if (typeof data === "string") {
            return data.replace(/http:\/\//g, "https://");
          }
          return data;
        },
      ],
    });

    Object.entries(response.headers).forEach(([key, value]) => {
      if (
        !["content-length", "transfer-encoding"].includes(key.toLowerCase())
      ) {
        res.setHeader(key, value);
      }
    });

    response.data.pipe(res);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: "Proxy error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
