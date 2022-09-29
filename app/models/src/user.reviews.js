'use strict'
import mongoose from 'mongoose';

const reviewUserModule = mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    },
    reviewed:{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'users'
    },
    chore:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'chores'
    },
    completedTime:String,
    comment:String,
    stars:Number,
    createdAt: {
        type: Date,
        default: Date.now(),
    },

})



const ReviewsModule = mongoose.model("reviews", reviewUserModule);

export default ReviewsModule;