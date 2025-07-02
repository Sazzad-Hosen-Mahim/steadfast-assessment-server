import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());

app.use("/api", async (req, res) => {
  const targetUrl = `http://157.230.240.97:9999${req.originalUrl}`;
  try {
    const { data } = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
    });
    res.json(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Proxy fetch error:",
        error.response?.data || error.message || error
      );
    } else {
      console.error("Proxy fetch error:", error);
    }
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(3000, () => console.log("Proxy running on http://localhost:3000"));
