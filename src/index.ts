import express from 'express';
import "./config/dbConfig";

const app = express();
app.use (express.json());

app.listen(3000, () => {
  console.log('Server corriendo en el puerto 3000');
});