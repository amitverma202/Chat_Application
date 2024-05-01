const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "chatApp",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

async function connectKafka() {
  await producer.connect();
  console.log("Connected to Kafka Server");
}

async function publishToKafka(message) {
  try {
    await producer.send({
      topic: "chat-messages",
      messages: [{ value: message }],
    });
    console.log("Msg publish to Kafka:", message);
  } catch (error) {
    console.error("Error publish msg to Kafka:", error);
  }
}

module.exports = { connectKafka, publishToKafka };
