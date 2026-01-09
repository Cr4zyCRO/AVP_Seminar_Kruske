import jwt from "jsonwebtoken";
import redisClient from "../config/redisClient.js";

// Provjera JWT tokena i dekodiranje payloada
export async function jwtCheck(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("Authorization header missing");
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("Bearer token missing");
    return res.status(401).json({ error: "Bearer token missing" });
  }

  console.log("Redis client status:", redisClient.isOpen ? "Connected" : "Not connected");

  if (!redisClient.isOpen) {
    console.error("Redis client is not connected.");
    return res.status(500).json({ error: "Redis connection error" });
  }

  console.log("Checking token in Redis...");

    try {
    // Dohvati vrijednost iz Redis-a koristeći await
    const result = await redisClient.get(token);
    console.log("Redis GET result:", result);

    if (result === "blacklisted") {
      console.log("Token is blacklisted");
      return res.status(403).json({ error: "Token is blacklisted" });
    }

    console.log("Verifying token...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role }; // Sprema korisnika u req za kasniju upotrebu
    console.log("Token decoded successfully:", decoded);
    next(); // Nastavlja na sljedeći middleware ili rutu
  } catch (err) {
    console.error("Error during Redis GET or JWT verification:", err);
    return res.status(403).json({ error: "Invalid token or Redis error" });
  }
}

// Provjera je li korisnik admin
export function authorizeAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Faculty
export function authorizeFaculty(req, res, next) {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ error: "Faculty access required" });
  }
  next();
}

export function authorizeStudent(req, res, next) {
  if (req.user.role != "student") {
    return res.status(403).json({error: "Student access required"});
  }
  next();
}