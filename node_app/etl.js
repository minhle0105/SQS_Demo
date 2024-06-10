import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import pkg from 'pg';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pkg;

const QUEUE_URL = process.env.QUEUE_URL || "http://localhost:4566/000000000000/login-queue";
const DB_NAME = process.env.DB_NAME || "postgres";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;

const sqsClient = new SQSClient({
    region: 'us-east-1',
    endpoint: 'http://localhost:4566'
});

const postgresClient = new Client({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
});

await postgresClient.connect();

const maskPII = (value) => {
    return crypto.createHash('sha256').update(value).digest('hex');
};

const processMessage = (message) => {
    const data = JSON.parse(message.Body);
    return [data.user_id,
            data.device_type,
            maskPII(data.ip),
            maskPII(data.device_id),
            data.locale,
            parseInt(data.app_version.replace('.', ''), 10),
            new Date(data.create_date)];
};

const writeToDB = async (record) => {
    const query = `
        INSERT INTO user_logins (user_id, device_type, masked_ip, masked_device_id, locale, app_version, create_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
    `;
    await postgresClient.query(query, record);
};

const main = async () => {
    try {
        const params = {
            QueueUrl: QUEUE_URL,
            AttributeNames: ['SentTimestamp'],
            MaxNumberOfMessages: 10,
            MessageAttributeNames: ['All'],
            VisibilityTimeout: 20,
            WaitTimeSeconds: 0,
        };

        const data = await sqsClient.send(new ReceiveMessageCommand(params));

        if (data.Messages) {
            for (const message of data.Messages) {
            const record = processMessage(message);
            await writeToDB(record);

            const deleteParams = {
                QueueUrl: QUEUE_URL,
                ReceiptHandle: message.ReceiptHandle,
            };

            await sqsClient.send(new DeleteMessageCommand(deleteParams));
            console.log("Message Deleted", message.MessageId);
            }
        }
    }
    catch (err) {
        console.error("Error", err);
    }
    finally {
        await postgresClient.end();
    }
};

main();
