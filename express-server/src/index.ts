import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://falcon-nexus.netlify.app",
  "https://steadfast-assessment-server.onrender.com",
];

interface CorsOptions {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => void;
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

const corsOptions: CorsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

app.use(["/api", "/storage", "/uploads"], async (req, res) => {
  const targetUrl = `http://157.230.240.97:9999${req.originalUrl}`;
  try {
    const response = await axios({
      url: targetUrl,
      method: req.method,
      responseType: "stream",
      headers: {
        ...req.headers,
        host: "157.230.240.97:9999",
      },
    });
    response.data.pipe(res);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Proxy error:", error.message);
    } else {
      console.error("Proxy error:", error);
    }
    res.status(500).send("Error proxying request");
  }
});

app.listen(3000, () => console.log("Proxy running on http://localhost:3000"));
