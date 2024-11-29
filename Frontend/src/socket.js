import { io } from "socket.io-client";

const URL = process.env.NODE_ENV ==='production' ? 'https://sketch-board-webapp.onrender.com' : 'http://localhost:5000'
export const socket = io(URL);