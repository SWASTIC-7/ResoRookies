import React from 'react'
import { useStore } from '../../Store'
import { Navigate, useNavigate } from 'react-router-dom'
import './Navbar.css'
function Navbar() {
    const navigate = useNavigate();
    const home_val = useStore((state) => state.home_bring)
    const home_dec = useStore((state) => state.home_rem)
    const about = useStore((state) => state.about_bring)
    const abo = () => {
        about()
        home_dec()
    }
    const home = () => {
        home_val()
        navigate('/')
    }
  return (
    <div className='Navbar'>
        <h2 onClick={home }>ResoRookies</h2>
        <h3 onClick={abo}>About us</h3>
    </div>
  )
}

export default Navbar