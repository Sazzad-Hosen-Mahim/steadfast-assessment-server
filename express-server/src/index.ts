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

// Set up default CORS for Express routes (not proxy streams)
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

// Preflight handler for proxy paths
app.options(["/api/*", "/storage/*", "/uploads/*"], (req, res) => {
  const origin = req.headers.origin ?? allowedOrigins[0];
  res
    .header("Access-Control-Allow-Origin", origin)
    .header("Access-Control-Allow-Credentials", "true")
    .header(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS"
    )
    .header(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] || "*"
    )
    .header("Vary", "Origin")
    .sendStatus(204);
});

// Proxy route with full CORS headers
app.use(["/api", "/storage", "/uploads"], async (req, res) => {
  const origin = req.headers.origin ?? allowedOrigins[0];
  res.header({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Expose-Headers": "Content-Length, X-Request-ID",
    Vary: "Origin",
  });

  const targetUrl = `https://157.230.240.97:9999${req.originalUrl}`;
  try {
    const response = await axios({
      url: targetUrl,
      method: req.method,
      responseType: "stream",
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      transformResponse: [
        (data) =>
          typeof data === "string"
            ? data.replace(/http:\/\//g, "https://")
            : data,
      ],
    });

    // Copy upstream headers
    for (const [key, value] of Object.entries(response.headers)) {
      if (
        !["content-length", "transfer-encoding"].includes(key.toLowerCase())
      ) {
        res.setHeader(key, value as string);
      }
    }

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
