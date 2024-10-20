import React,{useState, useRef, useEffect} from 'react'
import './Player_page.css'
import Nav2 from '../../Components/Navbar2'
import pattern from '../../assets/pattern.jpeg'
import play_icon  from '../../assets/play.png'
import pause from '../../assets/pause.png'
import next from '../../assets/next.png'
import song from '../../assets/song.mp3'
function Player_page() {
    const audioRef = useRef(null)
    const [play, setPlay] = useState(false)
    const [song, setSong] = useState([])
    const [audioIndex, setAudioIndex] = useState(1)
    let arr = ["animals.mp3","something_just_like_this.mp3","xenogenesis.mp3"]
    // const wave = document.querySelector('.wave')
        

    let audio = new Audio(`http://10.81.87.61:8080/songs/${arr[audioIndex]}`);  //loading audiofile form server
    audioRef.current = audio;
    useEffect(() => {
        
        console.log(audio)
        audio.load();
        console.log('index',arr[audioIndex])

      
        if (arr.length>0 && arr[audioIndex]) {    // check if there exists audio
        
        
       //connect to websocket
        const socket = new WebSocket("ws://10.81.87.61:8080/ws?room_id="+localStorage.getItem('room')+"&username="+localStorage.getItem('user'));
        
        audio.preload = "auto"; 
        
        socket.onmessage = function(event) {
            let data = event.data;
            console.log("Message from server:", data);
    
            if (data.startsWith("INIT")) {
                audio.pause();
                audio.currentTime = 0;
    
                let startTime = parseInt(data.split(" ")[1], 10);
                let currentTime = Date.now();
                let delay = startTime - currentTime;
                socket.send(delay.toString());
               
            } else if (data.startsWith("START")) {
                let startTime = parseInt(data.split(" ")[1], 10);
                let currentTime = Date.now();
                let delay = startTime - currentTime;
                console.log("delay", delay);
                
               
                while (delay > 0) {
                    currentTime = Date.now();
                    delay = startTime - currentTime;
                }
                audio.play().catch(console.log);
                setPlay(true)
                
                socket.send('SET true')
                
            } else if (data.startsWith("STOP")) {
                audio.pause();
                setPlay(false)
                socket.send('SET false')
            }
             else if (data.startsWith("SYNC")) {
                let username = data.split(" ")[1];
                let isAdmin = data.split(" ")[2] === 'true';
                
                    socket.send(`SYNC ${audio.currentTime +5} ${Date.now()+5000} ${username}`);
                    console.log(`SYNC ${audio.currentTime +5} ${Date.now()+5000} ${username}`)
                    console.log(audio.currentTime);
                
                
               
            } else if (data.startsWith("RANDOM")) {
                audio.currentTime = parseFloat(data.split(" ")[1]);
                let startTime = parseInt(data.split(" ")[2], 10);
              
                let currentTime = Date.now();
                let delay = startTime - currentTime;
                console.log("delay", delay);
    
               
                while (delay > 0) {
                    currentTime = Date.now();
                    delay = startTime - currentTime;
                }
                
                audio.play().catch(console.log);
                setPlay(true)
            }


            return () => {
                console.log("WebSocket cleanup");
                socket.close();
            };
        };
    
        socket.onopen = function() {
            console.log("Connected to server");
            socket.send("CLOSE")
            socket.send("JOINED " + localStorage.getItem('user'));
        };
    
        socket.onclose = function() {
            socket.sent("CLOSE")
            console.log("Disconnected from server");
        };
    
        socket.onerror = function(error) {
            console.log("WebSocket Error:", error);
        };
        }
    
    }, [audioIndex])
    
    
   

    //play button
    const toggle = () => {
       
        if(play){
            audioRef.current.pause();
            fetch("http://10.81.87.61:8080/stop?room_id="+localStorage.getItem('room')+"&username="+localStorage.getItem('user'))
            .then(res=>res.json())
            .then(data=>{
                console.log(data)
                if(data.message === 'You are not the admin'){
                    
                    console.log(audio.currentTime)
                    console.log('paused')
                }
                
            })

       
        }
        else{
            
            fetch("http://10.81.87.61:8080/start?room_id="+localStorage.getItem('room')+"&username="+localStorage.getItem('user'))
            console.log('playing')
            fetch("http://10.81.87.61:8080/sync?room_id="+localStorage.getItem('room')+"&username="+localStorage.getItem('user'))
         
        }
    }

    //next button
    const next_song = () => {
        
        

        setAudioIndex(audioIndex+1)
       
        
        fetch("http://10.81.87.61:8080/start?room_id="+localStorage.getItem('room')+"&username="+localStorage.getItem('user'))
        
    }

    //previous button
    const prev_song = () => {
       

        setAudioIndex(audioIndex-1)
        fetch("http://10.81.87.61:8080/start?room_id="+localStorage.getItem('room')+"&username="+localStorage.getItem('user'))
        
    }
    
   
   


  return (
    <div className='Player_page'>
      
        <Nav2/>
        <div className={ play ? 'wave' : 'wi'}>
        </div>
                <div className='player'>
                    <img src={pattern}></img>
                </div>
                <div className='cc'>
                <img className='C_img' src={pattern}></img>
                    <div className='content'>
                            <h1>SONG NAME</h1>
                            <h2>ARTIST NAME</h2> 
                            <div className='controls'>
                                <img className='prev' src={next} onClick={prev_song}></img>
                                <img src={play ? pause : play_icon} onClick={toggle}></img>
                                <img src={next} onClick={next_song}></img>
                            </div>
                    </div>
                </div>
    </div>
  )
}

export default Player_page


// import React, { useState, useRef, useEffect } from 'react';
// import './Player_page.css';
// import Nav2 from '../../Components/Navbar2';
// import pattern from '../../assets/pattern.jpeg';
// import play_icon from '../../assets/play.png';
// import pause from '../../assets/pause.png';
// import next from '../../assets/next.png';

// function Player_page() {
//   const audioRef = useRef(null); // To hold the current Audio object
//   const [play, setPlay] = useState(false); // To track play/pause state
//   const [audioIndex, setAudioIndex] = useState(0); // Index of current song
//   const arr = ["animals.mp3", "something_just_like_this.mp3", "xenogenesis.mp3"]; // Song array

//   // Effect to load a new song when `audioIndex` changes
//   useEffect(() => {
//     if (audioRef.current) {
//       // Pause and stop the previous audio if exists
//       audioRef.current.pause();
//       audioRef.current.src = "";
//     }

//     // Create a new Audio object for the new song
//     if (arr.length > 0 && arr[audioIndex]) {

//         const newAudio = new Audio(`http://10.81.87.61:8080/songs/${arr[audioIndex]}`);
//         newAudio.preload = "auto";
//         audioRef.current = newAudio; // Update the reference to the new audio
//     const socket = new WebSocket("ws://10.81.87.61:8080/ws?room_id="+localStorage.getItem('room')+"&username="+localStorage.getItem('user'));
            
//     socket.onmessage = function(event) {
//                     let data = event.data;
//                     console.log("Message from server:", data);
            
//                     if (data.startsWith("INIT")) {
//                         audioRef.current.pause();
//                         newAudio.currentTime = 0;
            
//                         let startTime = parseInt(data.split(" ")[1], 10);
//                         let currentTime = Date.now();
//                         let delay = startTime - currentTime;
//                         socket.send(delay.toString());
//                         // output.innerText = "Starting song in: " + delay.toString() + " milliseconds";
//                     } 
//                     else if (data.startsWith("START")) {
//                                         let startTime = parseInt(data.split(" ")[2], 10);
//                                         newAudio.currentTime = parseFloat(data.split(" ")[1]);
//                                         let currentTime = Date.now();
//                                         let delay = startTime - currentTime;
//                                         console.log("delay", delay);
                            
//                                         // output.innerText = "Starting song in: " + delay.toString() + " milliseconds";
//                                         while (delay > 0) {
//                                             currentTime = Date.now();
//                                             delay = startTime - currentTime;
//                                         }
//                                         audioRef.current.play().catch(console.log);
//                                         setPlay(true)
//                                         // console.log("delay", delay);
//                                         // setTimeout(() => {
//                                         //     audio.play().catch(console.log);
//                                         // }, delay);
//                                     }
//                                     else if (data.startsWith("STOP")) {
//                                                         audioRef.current.pause();
//                                                         setPlay(false)}
                                
//                                 }



//          socket.onopen = function() {
//                     console.log("Connected to server");
//                 };
            
//                 socket.onclose = function() {
//                     console.log("Disconnected from server");
//                 };
            
//                 socket.onerror = function(error) {
//                     console.log("WebSocket Error:", error);
//                 };

    
     

//       // If the play state is true, play the new song
//       if (play) {
//         audioRef.current.play().catch(console.log);
//       }
//     }
//   }, [audioIndex, play]); // Re-run this effect when `audioIndex` or `play` changes

//   // Toggle play/pause
//   const togglePlayPause = () => {
//     if (play) {
//         fetch("http://10.81.87.61:8080/stop?room_id="+localStorage.getItem('room')+"&username="+localStorage.getItem('user'))


//       // Pause the current audio
//       setPlay(false);
//     } else {
//     //   audioRef.current.play().catch(console.log); 
//       fetch("http://10.81.87.61:8080/start?room_id="+localStorage.getItem('room')+"&username="+localStorage.getItem('user'))
//       // Play the current audio
//       setPlay(true);
//     }
//   };

//   // Play the next song
//   const nextSong = () => {
//     setAudioIndex((prevIndex) => (prevIndex + 1) % arr.length); 
//     fetch("http://10.81.87.61:8080/start?room_id="+localStorage.getItem('room')+"&username="+localStorage.getItem('user'))

//     // Increment and wrap around
//     setPlay(true); // Auto play the next song
//   };

//   // Play the previous song
//   const prevSong = () => {
//     setAudioIndex((prevIndex) => (prevIndex - 1 + arr.length) % arr.length);
    
//     setPlay(true); // Auto play the previous song
//   };
//   const trimSongName = (name, maxLength) => {
//     return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
//   };
//   return (
//     <div className='Player_page'>
//       <Nav2 />
//       <div className='wave'></div>
//       <div className='player'>
//         <img src={pattern} alt='pattern' />
//       </div>
//       <div className='cc'>
//         <img className='C_img' src={pattern} alt='song cover' />
//         <div className='content'>
//           <h1>{trimSongName(arr[audioIndex], 10)}</h1>
//           <h2>ARTIST NAME</h2>
//           <div className='controls'>
//             <img className='prev' src={next} onClick={prevSong} alt='previous song' />
//             <img src={play ? pause : play_icon} onClick={togglePlayPause} alt='play/pause' />
//             <img src={next} onClick={nextSong} alt='next song' />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Player_page;
