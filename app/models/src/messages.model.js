import mongoose from "mongoose";

const MessageSchema = mongoose.Schema(
   {
      messages: [
         {
         fromOwner: {
            type: Boolean,
            default: false
         },
         message: { type: String },
         createdAt: {
            type: Date,
            default: Date.now(),
         },
         },
      ],
      sender: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "users",
         required: true,
      },
      receiver: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "users",
         required: true,
      },
      read: { type: Date },
      createdAt: {
         type: Date,
         default: Date.now(),
      },
   },
   {
      timestamps: true,
   }
);
//update messages array 
MessageSchema.methods.updateMessages = async function (newmessage) {
    const message = this;
    message.messages.push(newmessage);
    await message.save();
    return message;
  };

const MessagesModule = mongoose.model("messages", MessageSchema);




export default MessagesModule;
