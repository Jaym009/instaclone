import Signup from './components/Signup'
import Login from './components/Login'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Home from './components/Home'
import Profile from './components/Profile'
import Posts from './components/Posts'
import Feed from './components/feed'
import EditProfile from './components/EditProfile'
import ChatPage from './components/ChatPage'
import { io } from "socket.io-client"
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnslice'
import { setMessageNotification } from './redux/rtmslice'
import ProtectedRoute from './components/ProtectedRoute'

const browserRouter = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute> <MainLayout /> </ProtectedRoute> ,
    children: [
      {
        index: true,
        element: <ProtectedRoute> <Home /> </ProtectedRoute>
      },
      {
        path: '/profile/:id',
        element: <ProtectedRoute> <Profile /> </ProtectedRoute>
      },
      {
        path: '/account/edit',
        element: <ProtectedRoute> <EditProfile /> </ProtectedRoute>
      },
      {
        path:  '/chat',
        element: <ProtectedRoute> <ChatPage /> </ProtectedRoute>
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  }
])
function App() {
  const { user } = useSelector(store => store.auth)
  const {socket} = useSelector(store => store.socketio)
  const dispatch = useDispatch()
  useEffect(() => {
    if (user) {
      const socketio = io("http://localhost:8000", {
        query: {
          userId: user?._id
        },
        
        transports: ['websocket']
      });
      dispatch(setSocket(socketio))

      // listen all the events
      socketio.on('getOnlineUsers', (onlineusers) => {
        dispatch(setOnlineUsers(onlineusers))
      })

      socketio.on('notification', (Notification) => {
        dispatch(setLikeNotification(Notification))
      })

      

      return () => {
        socketio.close()
        dispatch(setSocket(null))
      }
    } else if(socket) {
      socket?.close()
      dispatch(setSocket(null))
    }
  }, [user, dispatch])
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  )
}

export default App
