const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
        if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already registered" });
        const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: "student" });
        req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
        res.json({ role: user.role });
    } catch (error) { res.status(500).json({ message: "Registration failed" }); }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password" });
        req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
        res.json({ role: user.role });
    } catch (error) { res.status(500).json({ message: "Login failed" }); }
});

router.post("/logout", (req, res) => req.session.destroy(() => res.json({ message: "Logged out" })));
module.exports = router;
