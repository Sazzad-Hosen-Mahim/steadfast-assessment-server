import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

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
