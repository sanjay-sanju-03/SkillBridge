const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

async function connectDB() {
    await mongoose.connect(process.env.MONGODB_URI);
    const exists = await User.findOne({ role: "admin" });
    if (!exists) {
        await User.create({
            name: "Admin",
            email: process.env.ADMIN_EMAIL,
            password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
            role: "admin"
        });
        console.log("Admin account created");
    }
    console.log("MongoDB connected");
}

module.exports = connectDB;
