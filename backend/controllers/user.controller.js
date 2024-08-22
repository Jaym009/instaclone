import {User} from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cloudinary from '../util/cloudinary.js'
import getDataUri from '../util/dataUri.js'
import { Post } from "../models/post.model.js"


export const register = async (req, res) => {
    try {
        const {username, email, password} = req.body
        if(!username || !email || !password){
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false
            })
        };
        const user = await User.findOne({email})
        if(user){
            return res.status(401).json({
                message: "Email already registered!, Try different email",
                success: false
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        await User.create({
            username, 
            email,
            password:hashedPassword
        })
        return res.status(201).json({
            message: "Account created successfully",
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body

        if(!email || !password){
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false
            })
        };

        let user = await User.findOne({email})
        if(!user){
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if(!isPasswordMatch){
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false
            })
        }
        const token = jwt.sign({userId: user._id},process.env.SECRET_KEY,{expiresIn:'1d'}) 

        // populate each post if in the posts array 
        const populatedPosts = await Promise.all(
            user.posts.map(async (postId)=>{
                const post = await Post.findById(postId)
                if(post.author.equals(user._id)){
                    console.log(post)
                    return post;
                }
                return null;
            })
        )
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: populatedPosts
        }

       
        return res.cookie('token', token, {httpOnly: true, sameSite: 'strict', maxAge: 1*24*60*60*1000}).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user
        })
    } catch (error) {
        console.log(error)
    }
}

export const logout = async (_, res) => {
    try {
        return res.cookie("token","",{maxAge: 0}).json({
            message: "Logged out successfully",
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).populate({path:'posts', createdAt: -1}).populate('bookmarks')
        return res.status(200).json({
            user,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const editProfile = async (req, res) => {
    try {
        const userId = req.id
        const {bio, gender} = req.body
        const profilePicture = req.file

        let cloudResponse
        if(profilePicture){
            const fileUri = getDataUri(profilePicture)
            cloudResponse = await cloudinary.uploader.upload(fileUri)
        } 

        const user = await User.findById(userId).select("-password")
        if(!user){
            return res.status(404).json({
                message: "User not found.",
                success: false
            })
        }
        
        if(bio) user.bio = bio;
        if(gender) user.gender = gender;
        if(profilePicture) user.profilePicture = cloudResponse.secure_url;

        await user.save()

        return res.status(200).json({
            message: "Profile Updated.",
            success: true,
            user
        })

    } catch (error) {
        console.log(error)
    }
}

export const getSuggestedUser = async (req, res) => {
    try {
        const suggestedUsers = await User.find({_id:{$ne:req.id}}).select("-password");
        if(!suggestedUsers){
            return res.status(400).json({
                message: "Currently do not have any users"
            })
        }
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error)
    }
}

export const followOrUnfollow = async (req, res) => {
    try {
        const followkarnewala = req.id // Jay followkarnewala
        const jiskofollowkarunga = req.params.id // Smit jiskofollowkarunga
        if(followkarnewala === jiskofollowkarunga){
            return res.status(400).json({
                message: "You Cannot follow or unfollow yourself",
                success: false
            })
        }

        const user = await User.findById(followkarnewala)
        const targetuser = await User.findById(jiskofollowkarunga)

        if(!user || !targetuser){
            return res.status(400).json({
                message: "User not found",
                success: false
            })
        }
        
        // to check follow karna hai ya unfollow

        const isFollowing = user.following.includes(jiskofollowkarunga)
        if(isFollowing){
            // unfollow logic
            await Promise.all([
                User.updateOne({_id:followkarnewala},{$pull: {following:jiskofollowkarunga}}),
                User.updateOne({_id:jiskofollowkarunga},{$pull: {followers:followkarnewala}})
            ])

            return res.status(200).json({
                message: "Unfollowed Successfully",
                success: true,
            })
        } else {
            // follow logic
            await Promise.all([
                User.updateOne({_id:followkarnewala},{$push: {following:jiskofollowkarunga}}),
                User.updateOne({_id:jiskofollowkarunga},{$push: {followers:followkarnewala}})
            ])
            return res.status(200).json({
                message: "Followed Successfully",
                success: true,
            })
        }

    } catch (error) {
        console.log(error)
    }
}