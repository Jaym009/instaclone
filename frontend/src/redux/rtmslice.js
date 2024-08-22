import { createSlice } from "@reduxjs/toolkit";

const rtmSlice = createSlice({
    name:'realtimeMessage',
    initialState:{
        messageNotification:[]
    },
    reducers:{
        setMessageNotification:(state, action)=>{
            if(action.payload.type === 'newMessage'){
                state.messageNotification.push(action.payload)
            }
        }
    }
})
export const {setMessageNotification} = rtmSlice.actions
export default rtmSlice.reducer