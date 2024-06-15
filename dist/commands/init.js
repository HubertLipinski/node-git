import fs from "node:fs";
import { configDir, absolutePath } from "../util/directory.js";
export default () => {
    process.stdout.write(fs.existsSync(configDir)
        ? `Reinitialized existing node-git repository in ${configDir}`
        : `Initialized empty node-git repository in ${configDir}`);
    bootstrapCoreFiles();
};
const bootstrapCoreFiles = () => {
    fs.mkdirSync(configDir, { recursive: true });
    fs.mkdirSync(absolutePath("objects"), { recursive: true });
    fs.mkdirSync(absolutePath("refs"), { recursive: true });
    fs.writeFileSync(absolutePath("HEAD"), "ref: refs/heads/main\n");
};
