import { setSuggestedUsers } from '@/redux/authslice'
import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const useGetSuggestedUsers = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const res = await axios.get("https://instaclone-o3w0.onrender.com/api/v2/user/suggested", { withCredentials: true });
                if(res.data.success){
                    dispatch(setSuggestedUsers(res.data.users))
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchSuggestedUsers();
    }, []);
}
export default useGetSuggestedUsers
