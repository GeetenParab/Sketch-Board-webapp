import styles from './index.module.css';
import { socket } from '@/socket';

import { COLORS, MENU_ITEMS } from '../constant.js';
import { useDispatch, useSelector } from 'react-redux';
import { changeBrushSize,changeColor } from '@/slice/toolboxSlice';
import cx from "classnames"
const Toolbox = () =>{
  const dispatch = useDispatch();
    const activeMenuItem = useSelector((state)=>state.menu.activeMenuItem)
    const {color,size} = useSelector((state) => state.toolbox[activeMenuItem]);
    const showstrokeOption = activeMenuItem ===MENU_ITEMS.PENCIL;
    const showBrushOption = activeMenuItem ===MENU_ITEMS.ERASER || MENU_ITEMS.PENCIL ;
    const updateBrushSize = (e) =>{
            dispatch(changeBrushSize({item:activeMenuItem,size: e.target.value}))
            socket.emit('changeConfig', {color,size:e.target.value})
    }

    const updateColor = (newcolor)=>{
            dispatch(changeColor ({item:activeMenuItem,color: newcolor}))
            socket.emit('changeConfig', {color:newcolor,size})
    }
    
    return (
        <div className={styles.toolboxContainer}>
            {showstrokeOption && <div className={styles.toolItem}>
            <h4 className={styles.toolText}>Stroke Color</h4>
            <div className={styles.itemContainer}>
                <div className={cx(styles.colorBox,{[styles.active]:color===COLORS.BLACK})}  style={{backgroundColor:COLORS.BLACK}} onClick={()=>updateColor(COLORS.BLACK)}/>
                <div className={cx(styles.colorBox,{[styles.active]:color===COLORS.RED})}  style={{backgroundColor:COLORS.RED}} onClick={()=>updateColor(COLORS.RED)}/>
                <div className={cx(styles.colorBox,{[styles.active]:color===COLORS.GREEN})}   style={{backgroundColor:COLORS.GREEN}} onClick={()=>updateColor(COLORS.GREEN)}/>
                <div className={cx(styles.colorBox,{[styles.active]:color===COLORS.BLUE})}  style={{backgroundColor:COLORS.BLUE}} onClick={()=>updateColor(COLORS.BLUE)}/>
                <div className={cx(styles.colorBox,{[styles.active]:color===COLORS.ORANGE})}  style={{backgroundColor:COLORS.ORANGE}} onClick={()=>updateColor(COLORS.ORANGE)}/>
                <div className={cx(styles.colorBox,{[styles.active]:color===COLORS.YELLOW})}  style={{backgroundColor:COLORS.YELLOW}} onClick={()=>updateColor(COLORS.YELLOW)}/>
            </div>
         </div>}
       {  showBrushOption && <div className={styles.toolItem}>
            <h4 className={styles.toolText}>Brush Size</h4>
            <div className={styles.itemContainer}>
                <input type="range" min={1} max={10} step={1} onChange={updateBrushSize} value={size}></input>
            </div>
         </div>}
        </div>
    );

}    

export default Toolbox;