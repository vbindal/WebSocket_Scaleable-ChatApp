import { Server } from "socket.io";
import {Redis} from "ioredis"

const pub = new Redis({
    host:'',
    port:0,
    username:'',
    password:'',

})
const sub = new Redis({
    host:'',
    port:0,
    username:'',
    password:'',
})


class SocketService{
    private _io : Server
    static io: any;
    constructor(){
        console.log('Init Socket Service')
        this._io = new Server({
            cors: {
                allowedHeaders:["*"],
                origin :"*",
            }
        })
        sub.subscribe("Messages")
    }

    public initListeners(){
        const io = this.io
        console.log("Initialise socket listeners...")
        io.on("connect",(socket)=>{
            console.log(`new socket connected`,socket.id)

            socket.on("event:message",async({message}:{message:String})=>{
                console.log("new message received",message)
                //publish this message to redis 
                await pub.publish('Messages',JSON.stringify({message}))

                sub.on('Message',(channel,message)=>{
                    if(channel==='Messages'){
                        io.emit("message",message)
                    }
                })
            })

        })

    }
    get io(){
        return this._io
    }
}
export default SocketService
