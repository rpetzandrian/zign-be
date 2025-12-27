import crypto from "crypto";
import { BadRequestError } from "../base/http_error";
import { Files } from "../entity/constant/file";
import { v4 as uuidv4 } from 'uuid';



export const generateUuid = () => uuidv4();

export const generateChecksum = (str: Buffer, encoding?: crypto.BinaryToTextEncoding): any => crypto
    .createHash('sha512')
    .update(str)
    .digest(encoding || 'base64');

export const generateRandomNIK = () => {
    // Get last 8 digits of the phone number
    const randomDigitsNumber = Math.floor(crypto.randomInt(100000000));
    const last8Digits = randomDigitsNumber.toString().padStart(8, '0');

    // Generate with regex for /^0{4}\d{10}$/
    const firstPart = '0000';

    const unixTimestamp = Math.floor(Date.now() / 1000);
    const secondPart = (unixTimestamp % 10000).toString().padStart(4, '0');

    return firstPart + secondPart + last8Digits;
}

export const isTruthy = (value: any) => value === true || value === 'true' || value === 1 || value === '1';

export const validateImageMimeType = (file: Files) => {
    // validate only image format
    if (!file.mimetype.match(/(image\/jpeg|image\/png|image\/jpg)/)) {
        throw new BadRequestError('file format must be image', 'INVALID_FILE_FORMAT')
    }
}

export const generateOTP = (): string => {
    const otp = crypto.randomInt(0, 1000000);
    return otp.toString().padStart(6, '0');
};