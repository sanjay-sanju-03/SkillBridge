const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: "Opportunity", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Application", schema);
