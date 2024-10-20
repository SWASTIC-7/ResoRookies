import React from 'react'
import './Navbar2.css'

function Navbar2() {
    const code = localStorage.getItem('room')
    const username = localStorage.getItem('user')
  return (
    <div className='Navbar2'>
        <h2>HELLO, {username}</h2>
        <h2>Code: {code}</h2>
    </div>
  )
}

export default Navbar2