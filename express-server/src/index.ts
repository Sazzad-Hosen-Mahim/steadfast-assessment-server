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
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
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
  const targetUrl = `https://steadfast-assessment-server.onrender.com${req.originalUrl}`;

  try {
    const response = await axios({
      url: targetUrl,
      method: req.method,
      responseType: "stream",
      headers: {
        ...req.headers,
        host: "steadfast-assessment-server.onrender.com",
      },
    });

    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    response.data.pipe(res);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Error proxying request");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
