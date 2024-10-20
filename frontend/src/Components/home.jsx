import React from 'react'
import Register from '../Components/Register'
import About from '../Components/AboutUs'
import { useStore } from '../../Store'
function home() {
    const home = useStore(state => state.home)
    const reg = useStore(state => state.register)
    const about_t = useStore(state => state.about)
    const bring_reg = useStore(state => state.reg_bring)
    const remove_home = useStore(state => state.home_rem)
    
    const toggle = ()=>{
        bring_reg()
        remove_home()
        console.log(home)
    console.log(reg)
    console.log(about_t)
    }
    if(home==1){
        return(
        <div>
    <h1>ENJOY YOUR FAVOURITE
            <br/><span> MUSIC </span><br/>
            WITH YOUR FRIENDS</h1>
        <div className='btns'>
            <div className='btn1' onClick={toggle}>
                <h3>Listen Music with Friends</h3>
            </div>
            {/* <div className='btn2'>
                <h3>Sing for your Friends</h3>
            </div> */}
        </div>
  </div>)}
    else if(about_t==1){
        return <About/>
    }
  else if(reg==1){
    return <Register/>}

    }
  



export default home