import { useEffect, useLayoutEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MENU_ITEMS } from "../constant";
import { actionItemClick } from '@/slice/menuSlice';
import {socket} from "@/socket";



const Board = () => {
  const dispatch = useDispatch();
  const canvasRef = useRef(null);
  const drawHistory = useRef([]);
  const historyPointer = useRef(-1); // Initialize pointer to -1 to handle initial state
  const shouldDraw = useRef(false);
  const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
  const { color, size } = useSelector((state) => state.toolbox[activeMenuItem]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Save the initial blank canvas state
    const initialImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    drawHistory.current.push(initialImageData);
    historyPointer.current = 0;

    const beginPath = (x, y) => {
      context.beginPath();
      context.moveTo(x, y);
    };

    const drawLine = (x, y) => {
      context.lineTo(x, y);
      context.stroke();
    };

    const handleMouseDown = (e) => {
      shouldDraw.current = true;
      beginPath(e.clientX, e.clientY);
      socket.emit('beginPath',{x:e.clientX,y:e.clientY});
    };

    const handleMouseMove = (e) => {
      if (!shouldDraw.current) return;
      drawLine(e.clientX, e.clientY);
      socket.emit('drawLine',{x:e.clientX,y:e.clientY});
    };

    const handleMouseUp = () => {
      shouldDraw.current = false;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      // Clear redo history if a new drawing occurs after undo
      if (historyPointer.current < drawHistory.current.length - 1) {
        drawHistory.current = drawHistory.current.slice(0, historyPointer.current + 1);
      }

      drawHistory.current.push(imageData);
      historyPointer.current = drawHistory.current.length - 1;
    };
    
    const handleBeginPath = (path) =>{
      beginPath(path.x,path.y);
    }
    const handleDrawLine = (path) =>{
      drawLine(path.x,path.y);
    }
    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    

    socket.on('beginPath',handleBeginPath);
    socket.on('drawLine',handleDrawLine);

    // Clean up event listeners
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);

      socket.off('beginPath',handleBeginPath);
    socket.off('drawLine',handleDrawLine);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
      // Create a temporary white background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempContext = tempCanvas.getContext('2d');

      // Draw a white rectangle covering the entire canvas
      tempContext.fillStyle = 'white';
      tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Copy the existing drawing onto the white background
      tempContext.drawImage(canvas, 0, 0);

      // Generate download link with the white background
      const URL = tempCanvas.toDataURL('image/jpeg');
      const anchor = document.createElement('a');
      anchor.href = URL;
      anchor.download = 'sketch.jpg';
      anchor.click();
    } else if (actionMenuItem === MENU_ITEMS.UNDO && historyPointer.current > 0) {
      historyPointer.current -= 1;
      context.putImageData(drawHistory.current[historyPointer.current], 0, 0);
    } else if (actionMenuItem === MENU_ITEMS.REDO && historyPointer.current < drawHistory.current.length - 1) {
      historyPointer.current += 1;
      context.putImageData(drawHistory.current[historyPointer.current], 0, 0);
    }

    // Reset the action
    dispatch(actionItemClick(null));
  }, [actionMenuItem, dispatch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');

    const changeConfig = (color,size) => {
      context.strokeStyle = color;
      context.lineWidth = size;
    };

    const handleChangeConfig =(config)=>{
      changeConfig(config.color,config.size);
    }

    changeConfig(color,size);
    // console.log(color,size)
    socket.on('changeConfig',handleChangeConfig);
    return ()=>{
      socket.off('changeConfig',handleChangeConfig)
    }
  }, [color, size]);

  return <canvas ref={canvasRef}></canvas>;
};

export default Board;


// import { useEffect, useLayoutEffect, useRef } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { MENU_ITEMS } from "../constant";
// import {  actionItemClick } from '@/slice/menuSlice';

// const Board = () => {
//   const dispatch = useDispatch();
//   const canvasRef = useRef(null);
//   const drawHistory = useRef([]);
//   const  historyPointer = useRef(0);
//   const shouldDraw = useRef(false);
//   const { activeMenuItem, actionMenuItem } = useSelector((state) => state.menu);
//   const { color, size } = useSelector((state) => state.toolbox[activeMenuItem]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const context = canvas.getContext('2d');

//     if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
//       // Create a temporary white background
//       const tempCanvas = document.createElement('canvas');
//       tempCanvas.width = canvas.width;
//       tempCanvas.height = canvas.height;
//       const tempContext = tempCanvas.getContext('2d');

//       // Draw a white rectangle covering the entire canvas
//       tempContext.fillStyle = 'white';
//       tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

//       // Copy the existing drawing onto the white background
//       tempContext.drawImage(canvas, 0, 0);

//       // Generate download link with the white background
//       const URL = tempCanvas.toDataURL('image/jpeg');
//       const anchor = document.createElement('a');
//       anchor.href = URL;
//       anchor.download = 'sketch.jpg';
//       anchor.click();

//     } 
//     else if(actionMenuItem === MENU_ITEMS.UNDO ||  actionMenuItem === MENU_ITEMS.REDO ){
//       if(historyPointer.current>0 && actionMenuItem === MENU_ITEMS.UNDO) historyPointer.current -=1;
//       if(historyPointer.current< drawHistory.current.length-1 && actionMenuItem === MENU_ITEMS.REDO) historyPointer.current +=1;

//           const imageData = drawHistory.current[historyPointer.current];
//           context.putImageData(imageData,0,0);
//     }
//     // Clean up
//     dispatch(actionItemClick(null));
//   }, [actionMenuItem, dispatch]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const context = canvas.getContext('2d');

//     const changeConfig = () => {
//       context.strokeStyle = color;
//       context.lineWidth = size;
//     };

//     changeConfig();
//   }, [color, size]);

//   useLayoutEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const context = canvas.getContext('2d');

//     // Set canvas size
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const beginPath = (x, y) => {
//       context.beginPath();
//       context.moveTo(x, y);
//     };

//     const drawLine = (x, y) => {
//       context.lineTo(x, y);
//       context.stroke();
//     };

//     const handleMouseDown = (e) => {
//       shouldDraw.current = true;
//       beginPath(e.clientX, e.clientY);
//     };

//     const handleMouseMove = (e) => {
//       if (!shouldDraw.current) return;
//       drawLine(e.clientX, e.clientY);
//     };

//     const handleMouseUp = () => {
//       shouldDraw.current = false;
//       const imageData = context.getImageData(0,0,canvas.width,canvas.height)
//       drawHistory.current.push(imageData);
//       historyPointer.current = drawHistory.current.length -1;
//     };

//     // Event listeners
//     canvas.addEventListener('mousedown', handleMouseDown);
//     canvas.addEventListener('mousemove', handleMouseMove);
//     canvas.addEventListener('mouseup', handleMouseUp);

//     // Clean up
//     return () => {
//       canvas.removeEventListener('mousedown', handleMouseDown);
//       canvas.removeEventListener('mousemove', handleMouseMove);
//       canvas.removeEventListener('mouseup', handleMouseUp);
//     };
//   }, []);

//   return <canvas ref={canvasRef}></canvas>;
// };

// export default Board;


// // import { useEffect, useLayoutEffect, useRef } from "react";
// // import { useSelector,useDispatch } from "react-redux";
// // import { MENU_ITEMS } from "../constant";
// // import { menuItemClick,actionItemClick } from '@/slice/menuSlice';

// // const Board = ()=>{
// //     const  dispatch = useDispatch();
// //     const canvasRef = useRef(null);
// //     const shouldDraw  = useRef(false);
// //     const {activeMenuItem,actionMenuItem} = useSelector((state)=>state.menu)
// //     const {color,size} = useSelector((state) => state.toolbox[activeMenuItem]);

// // //    console.log(color,size)
// //         useEffect(()=>{
// //             const canvas = canvasRef.current;
// //                 if(!canvas) return;
// //                 const context = canvas.getContext('2d');

// //                 if (actionMenuItem === MENU_ITEMS.DOWNLOAD) {
// //                     const URL = canvas.toDataURL()
// //                     const anchor = document.createElement('a')
// //                     anchor.href = URL
// //                     anchor.download = 'sketch.jpg'
// //                     anchor.click();
                    
// //                 console.log(URL);
// //                 }


// //             dispatch(actionItemClick(null));
               
// //         },[actionMenuItem, dispatch])


// //    useEffect(()=>{
// //     const canvas = canvasRef.current;
// //         if(!canvas) return;
// //         const context = canvas.getContext('2d');

// //         const changeConfig =() =>{
// //             context.strokeStyle  = color;
// //             context.lineWidth = size;
// //         }

     
// //       changeConfig();
// // },[color,size])

// //     useLayoutEffect(()=>{
// //         const canvas = canvasRef.current;
        
// //             if(!canvas) return;
// //             const context = canvas.getContext('2d');

// //             //when mounting
// //             canvas.width = window.innerWidth;
// //             canvas.height = window.innerHeight;


// //             const beginPath = (x,y)=>{
// //                 context.beginPath();
// //                 context.moveTo(x,y)
// //             }

// //             const drawLine = (x,y)=>{
// //                 context.lineTo(x,y)
// //                 context.stroke();
// //             }
// //                 const handleMouseDown =(e) =>{
// //                   shouldDraw.current = true;
// //                   beginPath(e.clientX,e.clientY);
                   
// //                 }
// //                 const handleMouseMove=(e) =>{
// //                    if(!shouldDraw.current) return;
// //                    drawLine(e.clientX,e.clientY)
                 
// //                 }
// //                 const handleMouseUp =(e)=>{
// //                     shouldDraw.current = false;
// //                 }
// //             canvas.addEventListener('mousedown', handleMouseDown )
// //             canvas.addEventListener('mousemove', handleMouseMove )
// //             canvas.addEventListener('mouseup', handleMouseUp )

// //             return ()=> {
// //                 canvas.removeEventListener('mousedown', handleMouseDown )
// //                 canvas.removeEventListener('mousemove', handleMouseMove )
// //                 canvas.removeEventListener('mouseup', handleMouseUp )
// //             }
// //     },[])

      
// //     return(
// //             <canvas ref={canvasRef}></canvas>
// //     );
// // }

// // export default Board;