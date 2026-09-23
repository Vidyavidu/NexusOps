import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // now every route after this can read req.user.id and req.user.role
    next(); // move on to the actual route
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireEmployee(req, res, next) {
  if (req.user.role !== "EMPLOYEE") {
    return res.status(403).json({ error: "Employees only" });
  }
  next();
}