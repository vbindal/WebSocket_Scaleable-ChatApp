import http from 'http'
import SocketService from './services/socket';
import { consumeMessages } from './services/kafka';

async function init(){

    consumeMessages()
    const socketService = new SocketService()

    const httpServer  = http.createServer();
    const PORT = process.env.PORT ? process.env.PORT : 8000

    socketService.io.attach(httpServer)

    httpServer.listen(PORT,()=>{
        console.log(`http server is running at port ${PORT}`)
    })
    socketService.initListeners()
}

init()