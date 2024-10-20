import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing_page from './Pages/Landing_page/Landing_page'
import Player_page from './Pages/Player_page/Player_page'
import './App.css'
function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Landing_page/>}/>
        <Route path='/player' element={<Player_page/>}/>
      </Routes>
    </Router>
    
  )
}

export default App
