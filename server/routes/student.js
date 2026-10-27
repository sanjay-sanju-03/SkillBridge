const express = require("express");
const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");
const router = express.Router();

function studentOnly(req, res, next) {
    if (!req.session.user || req.session.user.role !== "student") return res.status(401).json({ message: "Student login required" });
    next();
}

router.get("/applications", studentOnly, async (req, res) => {
    try {
        const data = await Application.find({ studentId: req.session.user.id }).populate("opportunityId").sort({ appliedAt: -1 });
        res.json(data);
    } catch (error) { res.status(500).json({ message: "Unable to load applications" }); }
});

router.post("/apply", studentOnly, async (req, res) => {
    try {
        const { opportunityId } = req.body;
        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) return res.status(404).json({ message: "Opportunity not found" });

        // Ensure the deadline extends to the end of that day (23:59:59)
        const deadlineEnd = new Date(opportunity.deadline);
        deadlineEnd.setUTCHours(23, 59, 59, 999);

        if (deadlineEnd < new Date()) return res.status(400).json({ message: "Application deadline has passed" });

        const exists = await Application.findOne({ studentId: req.session.user.id, opportunityId });
        if (exists) return res.status(400).json({ message: "Already applied" });
        await Application.create({ studentId: req.session.user.id, opportunityId });
        res.json({ message: "Application submitted" });
    } catch (error) { res.status(500).json({ message: "Application failed" }); }
});

module.exports = router;
