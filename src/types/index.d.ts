interface CommandOptions {
    [key: string]: boolean | string
}

enum ObjectType {
    BLOB,
    TREE,
    COMMIT,
    TAG
}