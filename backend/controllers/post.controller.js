// import sharp from "sharp"
import cloudinary from "../util/cloudinary.js"
import { Post } from "../models/post.model.js"
import { User } from "../models/user.model.js"
import { Comment } from "../models/comment.model.js"
import { getReceiverSocketID, io } from "../socket/socket.js"

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body
        const image = req.file
        const authorId = req.id

        if (!image) {
            return res.status(400).json({
                message: "Image required"
            })
        }
        // image upload
        let cloudResponse;

        // Check if the image file has a buffer (in case it's being uploaded directly)
        if (image.buffer) {
            const fileUri = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;
            cloudResponse = await cloudinary.uploader.upload(fileUri, {
                folder: "posts",
                width: 800,
                height: 800,
                crop: "fit",
                quality: "auto",
                format: "jpeg"
            });
        } else {
            // Fallback: Upload the image using the file path (if using multer)
            cloudResponse = await cloudinary.uploader.upload(image.path, {
                folder: "posts",
                width: 800,
                height: 800,
                crop: "fit",
                quality: "auto",
                format: "jpeg"
            });
        }


        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });

        const user = await User.findById(authorId)
        if (user) {
            user.posts.push(post._id)
            await user.save()
        }

        await post.populate({ path: 'author', select: '-password' })
        return res.status(201).json({
            message: 'New post added',
            post,
            success: true
        })

    } catch (error) {
        console.log(error)
    }
}

export const getallPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            })
        return res.status(200).json({
            posts,
            success: true
        })

    } catch (error) {
        console.log(error)
    }
}

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username, profilePicture'
                }
            })
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const likepost = async (req, res) => {
    try {
        const likekrnewaleuserkiid = req.id
        const postId = req.params.id
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            })
        }
        // like logic
        await post.updateOne({ $addToSet: { likes: likekrnewaleuserkiid } })
        await post.save()

        //implementing socket io for real time notification
        const user = await User.findById(likekrnewaleuserkiid).select('username profilePicture')
        const postOwnerId = post.author.toString()
        if (postOwnerId !== likekrnewaleuserkiid) {
            const notification = {
                type: 'like',
                userId: likekrnewaleuserkiid,
                userDetails: user,
                postId,
                message: `${user?.username} liked your post`
            }
            const postOwnerSocketId = getReceiverSocketID(postOwnerId)
            io.to(postOwnerSocketId).emit('notification', notification)
        }


        return res.status(200).json({
            message: 'Post liked',
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const dislikepost = async (req, res) => {
    try {
        const likekrnewaleuserkiid = req.id
        const postId = req.params.id
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: 'Post not found',
                success: false
            })
        }
        // like logic
        await post.updateOne({ $pull: { likes: likekrnewaleuserkiid } })
        await post.save()

        //implementing socket io for real time notification
        const user = await User.findById(likekrnewaleuserkiid).select('username profilePicture')
        const postOwnerId = post.author.toString()
        if (postOwnerId !== likekrnewaleuserkiid) {
            const notification = {
                type: 'dislike',
                userId: likekrnewaleuserkiid,
                userDetails: user,
                postId,
                message: `${user?.username} disliked your post`
            }
            const postOwnerSocketId = getReceiverSocketID(postOwnerId)
            io.to(postOwnerSocketId).emit('notification', notification)
        }


        return res.status(200).json({
            message: 'Post Disliked',
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id
        const commentkarnewalauserkiid = req.id

        const { text } = req.body
        const post = await Post.findById(postId)

        if (!text) return res.status(400).json({ message: 'Text is required', success: false })

        const comment = await Comment.create({
            text,
            author: commentkarnewalauserkiid,
            post: postId
        })

        await comment.populate({
            path: 'author',
            select: 'username profilePicture'
        })

        post.comments.push(comment._id)
        await post.save()
        return res.status(201).json({
            message: 'Comment added',
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const getCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id
        const comments = await comment.find({ post: postId }).populate('author', 'username profilePicture');

        if (!comments) return res.status(404).json({ message: 'No comments found for this post', success: false })

        return res.status(200).json({ success: true, comments })
    } catch (error) {
        console.log(error)
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id
        const authorId = req.id

        const post = await Post.findById(postId)
        if (!post) return res.status(404).json({ message: 'Post not found', success: false })

        // check if the logged in user is the owner of the post 
        if (post.author.toString() !== authorId) return res.status(403).json({ message: 'Unauthorized' })

        // delete post 
        await Post.findByIdAndDelete(postId)

        // remove the post id from the user's post
        let user = await User.findById(authorId)
        user.posts = user.posts.filter(id => id.toString() !== postId)
        await user.save()

        // delete associated comments
        await comment.deleteMany({ post: postId })
        return res.status(200).json({ message: 'Post deleted', success: true })

    } catch (error) {
        console.log(error)
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id
        const authorId = req.id

        const post = await Post.findById(postId)
        if (!post) return res.status(404).json({ message: 'Post not found', success: false })

        const user = await User.findById(authorId)
        if (user.bookmarks.includes(post._id)) {
            //already bookmarked -> remove from the bookmark because it not bookmark 2 or more times one post
            await user.updateOne({ $pull: { bookmarks: post._id } })
            await user.save()
            return res.status(200).json({ type: 'Unsaved', message: 'Post removed form the bookmark', success: true })
        } else {
            // bookmark karna padega
            await user.updateOne({ $addToSet: { bookmarks: post._id } })
            await user.save()
            return res.status(200).json({ type: 'Saved', message: 'Post bookmarked', success: true })
        }
    } catch (error) {
        console.log(error)
    }
}