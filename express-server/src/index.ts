import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://falcon-nexus.netlify.app",
  "https://steadfast-assessment-server.onrender.com",
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Length", "X-Request-ID"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(["/api", "/storage", "/uploads"], async (req, res) => {
  const targetUrl = `https://157.230.240.97:9999${req.originalUrl}`;

  try {
    const response = await axios({
      url: targetUrl,
      method: req.method,
      responseType: "stream",
      headers: {
        ...req.headers,
        host: "157.230.240.97:9999",

        Origin:
          req.headers.origin ||
          "https://steadfast-assessment-server.onrender.com",
      },

      httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
    });

    res.header({
      "Access-Control-Allow-Origin": req.headers.origin || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Expose-Headers": "Content-Length, X-Request-ID",
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
