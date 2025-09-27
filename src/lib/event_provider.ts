import amqp from 'amqplib';
import logger from './logger';
import { EVENT_LIST } from '../entity/constant/common';
import EventSubscriber from '../base/subscriber';

export default class EventProvider {
    static instance: amqp.Channel | null = null;

    static async initialize(): Promise<void> {
        if (!EventProvider.instance) {
            const connect = await amqp.connect(process.env.RABBIT_MQ_URL as string);
            EventProvider.instance = await connect.createChannel();

            Object.values(EVENT_LIST).forEach((event) => {
                EventProvider.instance?.assertQueue(event, {
                    durable: true,
                });
            });

            logger.info('EventProvider initialized');
        }
    }

    public async publish(event: string, payload: Record<string, unknown>): Promise<void> {
        EventProvider.instance?.sendToQueue(event, Buffer.from(JSON.stringify(payload)), {
            persistent: true,
        });
    }

    public async subscribe(subscriber: EventSubscriber<any>): Promise<void> {
        EventProvider.instance?.consume(subscriber.getEvent(), async (message) => {
            if (message) {
                await subscriber.handler(JSON.parse(message.content.toString()));
                EventProvider.instance?.ack(message);
            }
        });
    }
}