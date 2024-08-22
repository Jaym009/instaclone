import { setPosts } from '@/redux/postslice'
import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetAllPost = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        const fetchAllPost = async () => {
            try {
                const res = await axios.get("https://instaclone-o3w0.onrender.com/api/v2/post/all", { withCredentials: true });
                if(res.data.success){
                    dispatch(setPosts(res.data.posts))
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchAllPost();
    }, []);
}
export default useGetAllPost
