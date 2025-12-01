import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { jwtCheck, authorizeAdmin, authorizeFaculty } from "./middleware/authMiddleware.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

//posli kad bude postavljena baza onda cu postaviti jwt ovo za sad
// da se vidi primjer middlewarea kako se naslaga
//maknuti posli, micite jwt, next middleware taj error cete dobit
//dok se ne ne generira jwt pri loginu npr
app.get("/protected", jwtCheck, (req, res) => {
  res.send(`Hello, user with ID: ${req.user.id}`);
});


app.get("/admin", authorizeAdmin, (req, res) => {
  res.send("Hello, admin!");
});


app.get("/admin", jwtCheck, authorizeFaculty, (req, res) => {
  res.send("Hello, faculty!");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err,
    message: err.message || "Internal Server Error",
  });
});

app.get("/", (req, res) => {
  res.send("Hello from backend!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));