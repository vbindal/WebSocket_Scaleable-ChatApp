import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "./prisma";

const kafka = new Kafka({
    brokers:["enter your kafka broker link"],
    ssl:{
        ca:[fs.readFileSync(path.resolve("./ca.pem"),'utf-8')]
    },
    sasl:{
        username:"enter required username",
        password:"enter required password",
        mechanism:"plain"
    }
})

let producer : null | Producer =null

export async function createProducer() {
    if(producer)return producer

    const _producer = kafka.producer()
    await _producer.connect()
    producer = _producer
    return producer
}

export async function produceMessage(message:string){
    const producer  = await createProducer()
    producer.send({
        messages: [{ key: `message-${Date.now()}`, value: message }],
        topic: "MESSAGES"
    })
    return true
}


export async function consumeMessages(){
    const consumer = kafka.consumer({groupId:"default"})
    await consumer.connect()

    await consumer.subscribe({
        topic:"MESSAGES",
        fromBeginning:true
    })

    console.log("consumer is in running state...")

    await consumer.run({
        autoCommit:true,
        eachMessage:async ({message,pause})=>{
            console.log("new message received")
            if(!message.value)return
            try{await prismaClient.message.create({
                data:{
                    text:message.value?.toString()
                }
            })}
            catch(err){
                console.log(`there is a error : ${err}`)
                pause()
                setTimeout(()=>{
                    consumer.resume([{topic:"MESSAGES"}])
                },60*1000)
            }
        }

    })

}

export default kafka
