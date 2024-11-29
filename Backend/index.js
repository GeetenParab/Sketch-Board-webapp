import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from "cors";
const app = express();
const httpServer = createServer(app);
const isDev  = app.settings.env ==='development'

const URL  = isDev ? "http://localhost:3000" : "https://sketch-board-webapp.vercel.app";

const io = new Server(httpServer,{cors:URL});


app.use(cors({origin:URL}));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('beginPath',(args)=>{
    socket.broadcast.emit('beginPath',args);
  });

  socket.on('drawLine',(args)=>{
    socket.broadcast.emit('drawLine',args);
  })

  socket.on('changeConfig',(args)=>{
    socket.broadcast.emit('changeConfig',args);
  })
});


httpServer.listen(5000, () => {
  console.log('server running at http://localhost:5000');
});