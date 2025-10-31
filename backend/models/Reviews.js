import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    name: String,
    email: String,
    feedback: String,
    locationId:{
        type: String,
        required: true
    },
    businessName: String,
    rating: Number,
})

export default mongoose.model("Reviews", reviewSchema)
