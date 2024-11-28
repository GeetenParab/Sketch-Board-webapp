import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from "cors";
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer,{cors: "http://localhost:5000"});

app.use(cors({origin:"http://localhost:3000"}));

io.on('connection', (socket) => {
  console.log('a user connected');
});
app.get('/',(req,res)=>{
    res.send({msg:"hello"})
})

httpServer.listen(5000, () => {
  console.log('server running at http://localhost:5000');
});