import {Conversation} from "../models/conversation.model.js"
import { Message } from "../models/message.model.js"
import { User } from "../models/user.model.js"
import { getReceiverSocketID, io } from "../socket/socket.js"

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id
        const receiverId = req.params.id
        const {textMessage:message} = req.body

        let conversation = await Conversation.findOne({
            participants: {$all:[senderId, receiverId]}
        })

        //establish the convertsation if not started yet
        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderId, receiverId]
            })
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        })
        if(newMessage) conversation.messages.push(newMessage._id)
        //also use
        // await conversation.save() and newMessage.save()
        await Promise.all([conversation.save(), newMessage.save()])

        // implement socket io for real time data transfer 
        const receiverSocketId = getReceiverSocketID(receiverId)
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', newMessage)
        }

        return res.status(201).json({success: true, newMessage})
    } catch (error) {
        console.log(error)
    }
} 

export const getMessage = async (req, res) => {
    try {
        const senderId = req.id
        const receiverId = req.params.id

        const conversation = await Conversation.findOne({
            participants: {$all: [senderId, receiverId]}
        }).populate('messages'); 

        if(!conversation){
            return res.status(200).json({
                messages: [],
                success: true
            })
        }
        return res.status(200).json({
            messages:conversation?.messages,
            success: true
        })

        
    } catch (error) {
        console.log(error)
    }
}