export default (args: string[]) => {

    // TODO: more flags
    const hasFlag = args.indexOf('-p')
    let [flag, data] = ['', args[0]];
    
    if (hasFlag > -1) {
        flag = args[hasFlag]
        data = args[hasFlag + 1]
    }

    console.log(flag, data)

  switch (flag) {
    case "-p":
      console.log("-p flag provided", data);
      break;
    default:
      console.log("no flag provided", data);
  }
};
