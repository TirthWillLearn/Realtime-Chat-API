import express from "express";
import { registerUser, loginUser } from "../service/auth.service";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const token = await registerUser(email, password);

    return res.json({ token });
  } catch (err: any) {
    // handle known errors (like duplicate user)
    if (err.message === "User already exists") {
      return res.status(400).json({ error: err.message });
    }

    return res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const token = await loginUser(email, password);

    return res.json({ token });
  } catch (err: any) {
    // avoid leaking whether email/password is wrong
    if (err.message === "Invalid credentials") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
