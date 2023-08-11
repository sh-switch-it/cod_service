const { Kafka } = require('kafkajs');
const { updateMeetingStatus } = require('../service/meetingService');
const config = require('../configReader')().config;
const { SchemaRegistry, SchemaType } = require('@kafkajs/confluent-schema-registry')

const kafka = new Kafka({
    clientId: 'booking-service',
    brokers: [config.kafka.brokers]
    })

//const registry = new SchemaRegistry ({ host: config.kafka.registry })
//let registry_id = null
const producer = kafka.producer()
/*
const schema = `
{
    "type": "record",
    "name": "BookingService",
    "namespace": "booking",
    "fields": [{ "type": "string", "name": "meeting_id" }]
}
`
*/


async function kafkaInit()
{
    /*
    try {
    console.log('kafka config:', config.kafka)
        registry_id = await registry.register({
            type: SchemaType.AVRO,
            schema
        })
    } catch (error) {
        console.error(error )
    }
    */
    
}

async function runKafkaConsumer() {
    const consumer = kafka.consumer({
        groupId: `booking-group-${config.kafka.env}`
    });

    const run = async () => {
        // Consuming
        await consumer.connect();
        const topics = ['core-server'];
        const env = config.kafka.env;
        for (let item of topics) {
            const topic = `${item}-${env}`;
            console.log('config topic:'+topic)
            await consumer.subscribe({
                topic: topic,
                fromBeginning: false
            });
        }
        
        console.log('consuming...........')
        await consumer.run({
            eachMessage: async ({
                topic,
                partition,
                message
            }) => {
                const msgData = JSON.parse(message.value);
                console.log('======================== revice data from kafka ==================');
                console.log('current topic:', topic);
                console.log('current value:', msgData);
                console.log('======================== end data from kafka ==================');
            },
        })
    }
    run().catch(console.error);
}

async function kafkaProduceMessage(topic_name, message_content)
{
    try {
        
        await producer.connect()

        await producer.send({
            topic: topic_name,
            messages: [
                { 
                    value: JSON.stringify(message_content) },
            ],
        })   

    } catch (error) {
        //console.log('registry-id;', id)
        console.error(error);
    }
    
}

module.exports = {runKafkaConsumer, kafkaProduceMessage, kafkaInit}