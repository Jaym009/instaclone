import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from 'axios'
import { toast } from 'sonner'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authslice'

const Login = () => {
    const {user} = useSelector(store => store.auth)
    const [input, setInput] = useState({
        email: "",
        password: ""
    })
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value })
    }

    useEffect(() => {
        if(user){
            navigate('/')
        }
    }, [])

    const signupHandler = async (e) => {
        e.preventDefault();
        // console.log(input)
        try {
            setLoading(true)
            const res = await axios.post('https://instaclone-o3w0.onrender.com/api/v2/user/login', input, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            })
            if (res.data.success) {
                dispatch(setAuthUser(res.data.user))
                navigate('/')
                toast.success(res.data.message)
                setInput({
                    email: "",
                    password: ""
                })
            }
        } catch (error) {
            console.log(error)
            toast.error(error.res.data.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex items-center w-screen h-screen justify-center'>
            <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8 '>
                <div className='my-4'>
                <h1 className='my-8 pl-12 font-bold text-xl flex items-center'>
                    Instagram</h1>
                    <p className='text-sm text-center'>Login to see photos & videos from your friends</p>
                </div>
                <div>
                    <span className='py-1 font-medium'>Email</span>
                    <Input
                        type="email"
                        name='email'
                        value={input.email}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2"
                    />
                </div>
                <div>
                    <span className='py-1 font-medium'>Password</span>
                    <Input
                        type="text"
                        name='password'
                        value={input.password}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2"
                    />
                </div>
                {
                    loading ? (
                        <Button>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin'/>
                            Please wait...
                        </Button>
                    ) : (
                        <Button type='submit'>Login</Button>
                    )
                }
                
                <span className='text-center'>Don't have an account! <Link to='/signup' className='text-blue-600'>Signup</Link></span>
            </form>
        </div>
    )
}

export default Login

