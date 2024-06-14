import path from "path";
const rootDirectory = process.cwd();
const rootFolder = process.env._NODE_GIT_DIRECTORY || ".nodegit";
const configDir = path.join(rootDirectory, rootFolder);
const absolutePath = (...args) => {
    if (args.length === 0)
        return configDir;
    return path.join(configDir, ...args);
};
export { rootFolder, rootDirectory, configDir, absolutePath };
