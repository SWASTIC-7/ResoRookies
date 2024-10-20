import React from 'react'
import vid from '../../../src/assets/clip.mp4'
import './Landing_page.css'
import Navbar from '../../Components/Navbar'
import Home from '../../Components/home'
function Landing_page() {
  return (
    <div className='Landing_page'>
       
        <div className='filter'></div>
        <Navbar/>
        
        <video className='video' src={vid} controls={false} autoPlay loop muted playsInline></video>
        <Home/>
    </div>
  )
}

export default Landing_page