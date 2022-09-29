import User from '../models/src/user.model'
import Messages from '../models/src/messages.model'

class dbUpdate{
      //update messages  on the user message array
      static async createMessage(sender,receiver,user,chore){
      return new Promise(async(resolve,reject) =>{
         const message={
               sender:sender,
               receiver:receiver,
         }
         const messageText={ message:`It’s a chore match! You have been matched for the chore of ${chore} by ${user}. Start the conversation to agree on the chore date, duration, and pay.
         `}
         const newMessage = await new Messages(message).save()
         newMessage.updateMessages(messageText)
      resolve(newMessage)
         

      })

      }
      //update applicant chores
      static async updateUser(user,choreid){
         return new Promise(async(resolve,reject) =>{
            User.findOne({_id:user}).exec(async (error,user)=>{
               const choreId={choreId:choreid}
               user.chores.push(choreId)
               user.save()
               console.log(user.chores.length)
               resolve(user)
            })
            
      
         })   

      }
  //update applicant chores
      static async choreStatus(user,choreid,status){
         return new Promise(async(resolve,reject) =>{
            User.findOne({_id:user}).populate("chores.choreId")
                .exec(async (error,user)=>{
                user.startChore(choreid,status)
               resolve(user)
            })
            
      
         })   

      }


}

export  default dbUpdate