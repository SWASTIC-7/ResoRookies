import React, { useState } from 'react'
import './Register.css'
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();
    const [user,setUser] = useState('')
    const [room,setRoom] = useState('')
    const join = (e) => {
        e.preventDefault()
        
        if(user === ''){
            alert('Please enter a username')
            if(room === ''){
                alert('Please enter a room code')
            }
        }
        if(user !== '' && room !== ''){
            console.log('joining room')
            localStorage.setItem('room',room)
            localStorage.setItem('user',user)
            navigate('/player')
        }
        
        
    }
    const join2 = (e) => {
        e.preventDefault()
        
        console.log(user)
        fetch('/api/create_room',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: user,
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data) 
            localStorage.setItem('room',data.room_id)
            localStorage.setItem('user',user)
            
            navigate('/player')
        })
    }
  return (
    <div className='Register'>
        <h2>Enter Username</h2>
        <input type='text' onChange={(e) => setUser(e.target.value)}></input>
        <h2>Room Code</h2>
        <input type='text' onChange={(e) => setRoom(e.target.value)}></input>
        <button  onClick={join} >join Room</button>
        <h3>Or</h3>
        <button onClick={join2}>Create Room</button>
    </div>
  )
}

export default Register