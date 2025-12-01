import jwt from "jsonwebtoken";

// Provjera JWT tokena i dekodiranje payloada
export function jwtCheck(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Bearer token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role }; // Sprema korisnika u req za kasniju upotrebu
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
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