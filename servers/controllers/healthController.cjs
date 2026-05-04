const mongoose = require("mongoose");

exports.healthCheck = (req, res) => {
    res.json({
        ok: true,
        db: mongoose.connection.readyState === 1 ? "connected" : "not-connected",
    });
};