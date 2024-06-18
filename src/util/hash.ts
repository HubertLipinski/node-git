import crypto from "node:crypto";
import { BinaryToTextEncoding } from "crypto";

const generateHash = (data: any, encoding: BinaryToTextEncoding = 'hex'): string => {
  return crypto.createHash('sha1')
    .update(data)
    .digest(encoding)
};

export {
  generateHash
}