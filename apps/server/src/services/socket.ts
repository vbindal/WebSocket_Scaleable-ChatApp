import { Server } from "socket.io";
import {Redis} from "ioredis"
import prismaClient from "./prisma";
import { produceMessage } from "./kafka";

const pub = new Redis({
    host:'redis-511bdec-vbindal027-8732.a.aivencloud.com',
    port:22269,
    username:'default',
    password:'AVNS_kwgkFFZIVg6UlDx4z7d',

})
const sub = new Redis({
    host:'redis-511bdec-vbindal027-8732.a.aivencloud.com',
    port:22269,
    username:'default',
    password:'AVNS_kwgkFFZIVg6UlDx4z7d',
})


class SocketService {
    private _io: Server;
  
    constructor() {
      console.log("Init Socket Service...");
      this._io = new Server({
        cors: {
          allowedHeaders: ["*"],
          origin: "*",
        },
      });
      sub.subscribe("MESSAGES");
    }
  
    public initListeners() {
      const io = this.io;
      console.log("Init Socket Listeners...");
  
      io.on("connect", (socket) => {
        console.log(`New Socket Connected`, socket.id);
        socket.on("event:message", async ({ message }: { message: string }) => {
          console.log("New Message Rec.", message);
          // publish this message to redis
          await pub.publish("MESSAGES", JSON.stringify({ message }));
        });
      });
  
      sub.on("message", async (channel, message) => {
        if (channel === "MESSAGES") {
          console.log("new message from redis", message);
          io.emit("message", message);

        //   await prismaClient.message.create({
        //     data:{
        //         text: message
        //     }
        //   })
        await produceMessage(message)
        }
        console.log("Message produce to the kafka Broker")
      });
    }
  
    get io() {
      return this._io;
    }
  }
  
  export default SocketService;