import express from "express";
import Reviews from "../models/Reviews.js";

export const createReview = async (req, res) => {
    console.log(req.body)

    const { name, email, feedback, locationId, businessName, rating } = req.body;
    if (!name || !email || !feedback || !locationId || !businessName || !rating) {
        return res.status(400).json({
            success: false,
            error: "Missing required fields"
        });
    }
    try {
        const review = new Reviews({
            name,
            email,
            feedback,
            locationId,
            businessName,
            rating
        });
        await review.save();
        console.log(review)
        res.json({
            success: true,
            message: "Review created successfully"
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create review"
        });
    }
};

export const getAllReviewsByLocationId = async (req, res) => {

    console.log(req.params.locationId)
    try {
        const reviews = await Reviews.find({ locationId: req.params.locationId });
        console.log(reviews,"reviews")
        res.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch reviews"
        });
    }
}

