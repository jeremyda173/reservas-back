import express from 'express';
import "./src/config/dbConfig";
import app from "./src/app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server corriendo en http://localhost:${PORT}`);
});