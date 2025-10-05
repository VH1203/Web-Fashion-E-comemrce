// reviewRoutes.js 
const express = require("express");
const router = express.Router();
const requireRole = require("../middlewares/requireRole");
const auth = require("../middlewares/auth");
const { replyReview } = require("../services/reviewService");
const Review = require("../models/Review");

router.use(auth);

router.get("/", requireRole("cskh","owner","admin"), async (req,res,next)=>{
  try{
    const q = {};
    if (req.query.productId) q.productId = String(req.query.productId);
    if (req.query.rating) q.rating = Number(req.query.rating);
    const items = await Review.find(q).sort("-createdAt").limit(200);
    res.json(items);
  }catch(e){ next(e); }
});

router.patch("/:id/reply", requireRole("cskh","owner","admin"), async (req,res,next)=>{
  try{
    const actor = { id: req.user.id, role: req.user.role };
    const doc = await replyReview(req.params.id, req.body.content, actor, req);
    if(!doc) return res.status(404).json({message:"Not found"});
    res.json(doc);
  }catch(e){ next(e); }
});

module.exports = router;
