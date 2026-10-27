const express = require("express");
const Opportunity = require("../models/Opportunity");
const Application = require("../models/Application");
const User = require("../models/User");
const router = express.Router();

function adminOnly(req, res, next) {
    if (!req.session.user || req.session.user.role !== "admin") return res.status(401).json({ message: "Admin login required" });
    next();
}

router.get("/dashboard", adminOnly, async (req, res) => {
    try {
        const opportunities = await Opportunity.countDocuments();
        const applications = await Application.countDocuments();
        const students = await User.countDocuments({ role: "student" });
        res.json({ opportunities, applications, students });
    } catch (error) { res.status(500).json({ message: "Unable to load dashboard" }); }
});

router.get("/opportunities", adminOnly, async (req, res) => {
    try { res.json(await Opportunity.find().sort({ createdAt: -1 })); }
    catch (error) { res.status(500).json({ message: "Unable to load opportunities" }); }
});

router.post("/opportunities", adminOnly, async (req, res) => {
    try {
        const { title, description, category, date, deadline, venue } = req.body;
        if (!title || !description || !category || !date || !deadline || !venue) return res.status(400).json({ message: "All fields are required" });
        if (new Date(deadline) > new Date(date)) return res.status(400).json({ message: "Deadline cannot be after event date" });
        res.json(await Opportunity.create({ title, description, category, date, deadline, venue }));
    } catch (error) { res.status(500).json({ message: "Unable to add opportunity" }); }
});

router.put("/opportunities/:id", adminOnly, async (req, res) => {
    try {
        const { title, description, category, date, deadline, venue } = req.body;
        if (!title || !description || !category || !date || !deadline || !venue) return res.status(400).json({ message: "All fields are required" });
        if (new Date(deadline) > new Date(date)) return res.status(400).json({ message: "Deadline cannot be after event date" });
        const data = await Opportunity.findByIdAndUpdate(req.params.id, { title, description, category, date, deadline, venue }, { new: true, runValidators: true });
        if (!data) return res.status(404).json({ message: "Opportunity not found" });
        res.json(data);
    } catch (error) { res.status(500).json({ message: "Unable to update opportunity" }); }
});

router.delete("/opportunities/:id", adminOnly, async (req, res) => {
    try {
        const data = await Opportunity.findByIdAndDelete(req.params.id);
        if (!data) return res.status(404).json({ message: "Opportunity not found" });
        await Application.deleteMany({ opportunityId: req.params.id });
        res.json({ message: "Opportunity deleted" });
    } catch (error) { res.status(500).json({ message: "Unable to delete opportunity" }); }
});

router.get("/applications", adminOnly, async (req, res) => {
    try {
        const data = await Application.find().populate("studentId", "name email").populate("opportunityId", "title").sort({ appliedAt: -1 });
        res.json(data);
    } catch (error) { res.status(500).json({ message: "Unable to load applications" }); }
});

router.put("/applications/:id/status", adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Status must be approved or rejected" });
        const data = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
        if (!data) return res.status(404).json({ message: "Application not found" });
        res.json(data);
    } catch (error) { res.status(500).json({ message: "Unable to update application status" }); }
});

router.delete("/applications/:id", adminOnly, async (req, res) => {
    try {
        const data = await Application.findByIdAndDelete(req.params.id);
        if (!data) return res.status(404).json({ message: "Application not found" });
        res.json({ message: "Application deleted" });
    } catch (error) { res.status(500).json({ message: "Unable to delete application" }); }
});

router.get("/students", adminOnly, async (req, res) => {
    try {
        res.json(await User.find({ role: "student" }).select("name email createdAt").sort({ createdAt: -1 }));
    } catch (error) { res.status(500).json({ message: "Unable to load students" }); }
});

router.delete("/students/:id", adminOnly, async (req, res) => {
    try {
        const student = await User.findOneAndDelete({ _id: req.params.id, role: "student" });
        if (!student) return res.status(404).json({ message: "Student not found" });
        await Application.deleteMany({ studentId: req.params.id });
        res.json({ message: "Student deleted" });
    } catch (error) { res.status(500).json({ message: "Unable to delete student" }); }
});

module.exports = router;
