"use strict";
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Chores from './chore.model'
import Reviews from './user.reviews'
import randomGenerate from "../../helpers/codeGenerate";

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			lowercase: true,
			unique: true,
			trim: true,
			required: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("Valid email is required");
				}
			},
		},
		phoneNumber: {
			type: String,
			trim: true,
		},
		residentialAddress: {
			streetAddress: {
				type: String,
				trim: true,
			},
			city: {
				type: String,
				trim: true,
			},
			state: {
				type: String,
				trim: true,
			},
			zipcode: {
				type: String,
				trim: true,
			},
		},
		guardianInformation: {
			firstName: {
				type: String,
				trim: true,
			},
			lastName: {
				type: String,
				trim: true,
			},
			email: {
				type: String,
				trim: true,
			},
			phoneNumber: {
				type: String,
				trim: true,
			},
		},
		drivingLicense: {
			licenceNumber: {
				type: String,
				trim: true,
			},
			expirationDate: {
				type: String,
				trim: true,
			},
			licenceImage: {
				type: String,
				trim: true,
			},
		},
		notifications: {
			chores: {
				type: Boolean,
				default: true,
			},
			matches: {
				type: Boolean,
				default: true,
			},
			message: {
				type: Boolean,
				default: true,
			},
			scheduledChores: {
				type: Boolean,
				default: true,
			},
			parentAlerts: {
				type: Boolean,
				default: true,
			},
			choreLocation: {
				type: Boolean,
				default: true,
			},
		},
		emergencyContact: {
			name: {
				type: String,
				trim: true,
			},
			phone: {
				type: String,
				trim: true,
			},
			email: {
				type: String,
				trim: true,
			},
			location: {
				type: String,
				trim: true,
			},
		},

		dateOfBirth: {
			type: String,
			trim: true,
		},
		availability: [
			{
				day: { type: String, trim: true },
				start: {
					type: Date,
					trim: true,
				},
				end: {
					type: Date,
					trim: true,
				},
            switch:{type:Boolean,default:false}
			},
		],
		registerCode: {
			type: String,
			trim: true,
		},

		resetPasswordCode: {
			type: String,
			trim: true,
		},
		chorePreferences: [],
		chores: [
			{
				choreId: { type: mongoose.Schema.Types.ObjectId, ref: "chores" },
				choreStarted: {
					type: Boolean,
					default: false,
				},
				choreCompleted: {
					type: Boolean,
					default: false,
				},
				paid: {
					type: Boolean,
					default: false,
				},
			},
		],
		password: {
			type: String,
			trim: true,
			minlength: 8,
			required: true,
		},
		profilePicture: {
			type: String,
			trim: true,
		},
		// Track user logins.
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
		role: {
			type: String,
			enum: ["choreowner", "student"],
			default: "student",
		},
		isVerified: {
			type: Boolean,
			default: false,
		},

		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.methods.toJSON = function () {
	/// Gives us access to user data
	const user = this;
	const userObject = user.toObject();
	/// Hide private data
	delete userObject.password;
	delete userObject.tokens;
	return userObject;
};

userSchema.methods.generateToken = async function () {
	/// Gives us access to user data
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, "livingCorporate2021");
	user.tokens = user.tokens.concat({ token });
	await user.save();
	return token;
};
userSchema.methods.generateSignUpCode = async function () {
	/// Gives us access to user data
	const user = this;
	const code = randomGenerate();
	user.registerCode = code;
	await user.save();
	return code;
};
userSchema.methods.generateresetPasswordCode = async function () {
	/// Gives us access to user data
	const user = this;
	const code = randomGenerate();
	user.resetPasswordCode = code;
	await user.save();
	return code;
};
userSchema.methods.confirmUser = async function () {
	/// Gives us access to user data
	const user = this;
	user.isVerified = true;
	await user.save();
	return user;
};
userSchema.methods.startChore = async function (id, status) {
	///update chore started
	const user = this;
	const updateduser = user.chores.filter(
		(chore) => chore.choreId._id.toString() === id.toString()
	);

	status == "started"
		? (updateduser[0].choreStarted = true)
		: (updateduser[0].choreCompleted = true),
		await user.save();
	return user;
};
userSchema.methods.completeChore = async function (id) {
	///update chore started
	const user = this;
	const updateduser = user.chores.filter(
		(chore) => chore.choreId.toString() === id.toString()
	);
   console.log(updateduser)
	(updateduser[0].choreCompleted = true), await user.save();
	return user;
};

userSchema.statics.findUserByCredentials = async (email, password) => {
	const user = await User.findOne({ email }).populate("chores.choreId");
	if (!user) {
		throw new Error("Unable to login");
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error("Unable to login");
	}
	return user;
};

/// save password
userSchema.pre("save", async function (next) {
	const user = this;
	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});


// Delete choreowner and chores 
userSchema.methods.deleteChoreowner = async function () {
	const user = this;
     await user.deleteOne({_id:user._id});
    await Chores.deleteMany({ creator: user._id });
    await Messages.deleteMany({ sender: user._id });
    await Reviews.deleteMany({ creator: user._id });

};
// Delete choreista and chores 
userSchema.methods.deleteChoreista = async function () {
   const user = this;
    await user.deleteOne({_id:user._id});
    await Chores.deleteMany({ creator: user._id });
    await Messages.deleteMany({ receiver: user._id });
    await Reviews.deleteMany({ reviewed: user._id });

};


const User = mongoose.model("users", userSchema);

export default User;
