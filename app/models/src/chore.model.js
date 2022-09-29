"use strict";
import mongoose from "mongoose";

const choreModuleSchema = mongoose.Schema({
	creator: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "users",
	},
	title: {
		type: String,
		trim: true,
		required: true,
	},
	description: {
		type: String,
		trim: true,
		required: true,
	},

	category: {
		type: String,
		trim: true,
	},
	startTime: {
		type: String,
		trim: true,
		required: true,
	},
	applicants: [
		{
			applicantId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "users",
			},
			message: { type: String, trim: true },
			choreAccepted: { type: Boolean, default: false },
			createdAt: {
				type: Date,
				default: Date.now(),
			},
		},
	],
	endTime: {
		type: String,
		trim: true,
		required: true,
	},
	Date: {
		type: Date,
		required: true,
	},
   choreStarted:{
        status:{type: Boolean, default: false },
        message:{type: String,	
                 enum: ["started", "completed"],
			        default: "started",},
   },
   completedDate:{type: Date},
   completedTime:String,
   	completed: {
		type: Boolean,
		default: false,
	},
   payRate:Number,
   totalHours:Number,
	isDeleted: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now(),
	},
	updatedAt: {
		type: Date,
		default: Date.now(),
	},
	paid: { type: Boolean, default: false },
});


choreModuleSchema.methods.startChore = async function (id) {
	///update chore started
   const chore=this;
   const updatedChore= chore.applicants.filter(applicant =>applicant.applicantId===id)
	await chore.save();
	return chore;
};
const ChoreModule = mongoose.model("chores", choreModuleSchema);

export default ChoreModule;
