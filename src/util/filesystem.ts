import fs from "node:fs"

import { absolutePath } from "../util/directory.js";

const getFileContent = (filePath: string, type: ObjectType) => {

    if (type === ObjectType.BLOB)

    if (!fs.existsSync(filePath)) {
        throw new Error('Provided file does not exist!')
    }

    // todo
    const content = fs.readFileSync(absolutePath(filePath))
}