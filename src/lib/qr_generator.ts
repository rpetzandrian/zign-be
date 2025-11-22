import qrcodeStyling from 'qr-code-styling';
import nodeCanvas from 'canvas';
import { JSDOM } from 'jsdom';

export class QrGenerator {
    public static async generate(url: string): Promise<{ error?: Error, body?: Buffer }> {
        try {
            const qrCode = new qrcodeStyling({
                nodeCanvas,
                jsdom: JSDOM,
                data: url,
                image: 'https://s3.nevaobjects.id/zign-assets/zign-logo.png',
                type: 'canvas',
                shape: "square",
                width: 200,
                height: 200,
                margin: 0.5,
                qrOptions: {
                    typeNumber: 6,
                    mode: 'Byte',
                    errorCorrectionLevel: 'Q',
                },
                imageOptions: {
                    saveAsBlob: true,
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 0,
                    crossOrigin: 'anonymous',
                },
                backgroundOptions: {
                    round: 0,
                    color: '#ffffff',
                },
                dotsOptions: {
                    type: 'extra-rounded',
                    color: '#E85B81',
                    roundSize: true,
                },
                cornersSquareOptions: {
                    type: 'extra-rounded',
                    color: '#000000',
                },
                cornersDotOptions: {
                    type: 'extra-rounded',
                    color: '#000000',
                }
            })
            const buffer = await qrCode.getRawData('png');
            return { body: buffer as Buffer }
        } catch (error: any) {
            return { error: error as Error }
        }
    }
}