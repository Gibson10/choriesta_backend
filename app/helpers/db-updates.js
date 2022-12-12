import User from "../models/src/user.model";
import Messages from "../models/src/messages.model";

class dbUpdate {
  /**
   * @description update messages  on the user message array
   * @param {String} sender - The id of the sender of the message
   * @param {String} receiver - The id of the receiver of the message
   * @param {String} senderName - The name of the sender of the message
   * @param {String} choreTitle - The title of the chore
   * @returns {Object} - The new message
   */
  static async createMessage(sender, receiver, senderName, choreTitle) {
    return new Promise(async (resolve, reject) => {
      const message = {
        sender: sender,
        receiver: receiver,
      };
      const messageText = {
        message: `It’s a chore match! You have been matched for the chore of ${choreTitle} by ${senderName}. Start the conversation to agree on the chore date, duration, and pay.
         `,
      };
      const newMessage = await new Messages(message).save();
      newMessage.updateMessages(messageText);
      resolve(newMessage);
    });
  }
  /**
   * @description update applicant chores
   * @param {String} applicantId - The id of the applicant
   * @param {String} choreid - The id of the chore
   * @returns {Object} - The updated user object
   */

  static async updateUser(applicantId, choreid) {
    return new Promise(async (resolve, reject) => {
      User.findOne({ _id: applicantId }).exec(async (error, user) => {
        const choreId = { choreId: choreid };
        user.chores.push(choreId);
        user.save();
        console.log(user.chores.length);
        resolve(user);
      });
    });
  }
  /**
   * @description update chore status
   * @param {String} choreistaId - The id of the choreista
   * @param {String} choreid - The id of the chore
   * @param {String} status - The status of the chore
   * @returns {Object} - The updated user object
   */

  static async updateChoreStatus(choreistaId, choreid, status) {
    return new Promise(async (resolve, reject) => {
      User.findOne({ _id: choreistaId })
        .populate("chores.choreId")
        .exec(async (error, user) => {
          user.startChore(choreid, status);
          resolve(user);
        });
    });
  }
}

export default dbUpdate;
