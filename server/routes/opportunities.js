const express = require("express");
const Opportunity = require("../models/Opportunity");
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const search = req.query.search || "";
        const data = await Opportunity.find({ title: { $regex: search, $options: "i" } }).sort({ createdAt: -1 });
        res.json(data);
    } catch (error) { res.status(500).json({ message: "Unable to load opportunities" }); }
});

router.get("/:id", async (req, res) => {
    try {
        const data = await Opportunity.findById(req.params.id);
        if (!data) return res.status(404).json({ message: "Opportunity not found" });
        res.json(data);
    } catch (error) { res.status(500).json({ message: "Unable to load opportunity" }); }
});

module.exports = router;
