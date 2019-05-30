import 'reflect-metadata';
import express from 'express'
import mqtt from 'mqtt';
import { useContainer, createConnection } from 'typeorm';
import { Container } from 'typedi';
import { SignalReceiverService } from './services/signals-storage.service';


useContainer(Container)

const app: express.Application = express()
const brokerUrl = process.env.BROKER_URL || 'mqtt://localhost:1883';
const username = process.env.USERNAME || '';
const password = process.env.PASSWORD || ''
const topic = process.env.TOPIC || 'general';
const port = process.env.PORT || 3000;

createConnection()
.then(async connection => {
    console.log("Database connection started successfully");

    const client = mqtt.connect(brokerUrl, {
        username: username,
        password: password,
    })
    client.on('connect', () => {
        client.subscribe(topic);
    })

    const receiverService = Container.get(SignalReceiverService);

    client.on('message', (topic, message) => {
        console.log("reception of the MQTT signal");
        receiverService.save(message);
        console.log("rescue MQTT signal");
    })

    app.listen(port, () => {
        console.log("Signal receiver service listening on port " + port);
    })
})
.catch(error => console.log(error))