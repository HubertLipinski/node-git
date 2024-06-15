import fs from "node:fs";
import crypto from "node:crypto";
import zlib from "node:zlib";
import { absolutePath } from "../util/directory.js";
/**
 * Git stores files in directories based on their first 2 digits of sha1 hash
 * For example file hashed as 5c557c3bd66d492f096e8e559ba93683346bb1a2
 * will be stored as .nodegit/objects/5c/557c3bd66d492f096e8e559ba93683346bb1a2
 * All blobs are compressed with zlib in the following format: blob <size>\0<content>
 */
export default (path, options) => {
    const file = fs.readFileSync(path);
    const blob = `blob ${file.length}\0${file}`;
    const blobHash = crypto.createHash("sha1").update(blob).digest("hex");
    if (!options.w) {
        return blobHash;
    }
    const filePath = `${blobHash.slice(0, 2)}/${blobHash.slice(2)}`;
    const compressedData = zlib.deflateSync(blob);
    fs.mkdirSync(absolutePath("objects", blobHash.slice(0, 2)), {
        recursive: true,
    });
    fs.writeFileSync(absolutePath("objects", filePath), compressedData);
    return blobHash;
};
