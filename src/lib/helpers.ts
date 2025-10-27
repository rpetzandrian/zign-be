import crypto from "crypto";
import { v4 as uuidv4 } from 'uuid';



export const generateUuid = () => uuidv4();

export const generateChecksum = (str: Buffer, encoding?: crypto.BinaryToTextEncoding): any => crypto
    .createHash('sha512')
    .update(str)
    .digest(encoding || 'base64');