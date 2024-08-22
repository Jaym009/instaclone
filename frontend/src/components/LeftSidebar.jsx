import { setAuthUser } from '@/redux/authslice'
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import axios from 'axios'
import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postslice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'

const LeftSidebar = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(store => store.auth)
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const { likeNotification } = useSelector(store => store.realTimeNotification)
    
    


    const logoutHandler = async () => {
        try {
            const res = await axios.get('https://instaclone-o3w0.onrender.com/api/v2/user/logout', { withCredentials: true })
            if (res.data.success) {
                dispatch(setAuthUser(null))
                dispatch(setSelectedPost(null))
                dispatch(setPosts([]))
                navigate('/login')
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.res.data.message)
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler()
        } else if (textType === "Create") {
            setOpen(true)
        } else if (textType === 'Profile') {
            navigate(`/profile/${user?._id}`)
        } else if (textType === 'Home') {
            navigate('/')
        } else if (textType === 'Messages') {
            navigate('/chat')
        }
    }

    const sideBarItems = [
        { icon: <Home />, text: "Home" },
        { icon: <Search />, text: "Search" },
        { icon: <TrendingUp />, text: "Explore" },
        { icon: <MessageCircle />, text: "Messages" },
        { icon: <Heart />, text: "Notifications" },
        { icon: <PlusSquare />, text: "Create" },
        {
            icon: (
                <div className='w-8 h-8'>
                    <Avatar className='w-full h-full'>
                        <AvatarImage src={user?.profilePicture} className='w-full h-full rounded-full' />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>
            ), text: "Profile"
        },
        { icon: <LogOut />, text: "Logout" },
    ]
    return (
        <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen'>
            <div className='flex flex-col'>
                <h1 className='my-8 pl-3 font-bold text-xl flex items-center'>
                    Instagram</h1>
                <div>
                    {
                        sideBarItems.map((Item, index) => {
                            return (
                                <div onClick={() => sidebarHandler(Item.text)} key={index} className='flex items-center gap-4 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3'>
                                    {Item.icon}
                                    <span>{Item.text}</span>
                                    {
                                        Item.text === 'Notifications' && likeNotification.length > 0 && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button size='icon' className='rounded-full h-5 w-5 absolute bottom-6 left-6 bg-red-600 hover:bg-red-600'>{likeNotification.length}</Button>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <div>
                                                        {
                                                            likeNotification.length === 0 ? (<p>No new notification</p>) : (
                                                                likeNotification.map((notification) => {
                                                                    return (
                                                                        <div key={notification.userId} className='flex items-center gap-2 my-2'>
                                                                            <Avatar>
                                                                                <AvatarImage src={notification.userDetails?.profilePicture}/>
                                                                                <AvatarFallback>CN</AvatarFallback>
                                                                                <p className='text-sm'><span className='font-bold'>{notification.userDetails?.username}</span> Liked your Post</p>
                                                                            </Avatar>
                                                                        </div>
                                                                    )
                                                                })
                                                            )
                                                        }
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )
                                    }
                                   
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <CreatePost open={open} setOpen={setOpen} />
        </div>
    )
}

export default LeftSidebar
