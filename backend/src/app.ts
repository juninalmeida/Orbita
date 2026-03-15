import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => { // (_)  silencia o aviso de variáveis não declaradas intencionalmente. "não vou usar"
  res.json({ status: "Orbita API Online!" });
});

export { app };