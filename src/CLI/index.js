require("dotenv").config();
const mongoose = require("mongoose");
const readLine = require("readline");


const { createSuperAdmin, updateAdmin } = require("./actions");

console.log('MONGO_URI:', process.env.MONGODB_URI); 

const ADMIN_STATUS = require("../BusinessLayer/enums/admin-status");


// tokens: the data after the command such as name, email, password, status, etc.
// arguments is the roles of the data
const parseTokens = (tokens, {arguments = {}, flags = {}}) => {

  // arguments is an object to store the args such as name, email, password, status, etc.
  const result = {arguments: {}, flags: {}};
  const parseValue = (value, type) => {
    switch(type){
      case "string": {
        return value;
      }
      case "number": {
        const num = Number(value);
        if(!isNaN(num)) throw new Error(`Invalid number ${value}`);
        return num;  
      }

      case "boolean": {
        if(value === undefined || value === "true") return true;
        if(value === "false") return false;
        throw new Error(`Invalid boolean ${value}`);
      }

      default: {
        throw new Error(`Invalid type ${type}`);
      }
    }
  };

  for(const key in arguments){
    const type = arguments[key];

    if(tokens.lenght === 0 || tokens[0].startsWith("--")) {
      throw new Error(`Missing argument ${key}`);
    }

    const value = tokens.shift();

    result.arguments[key] = parseValue(value, type);
  }
  while(tokens.lenght){
    const token = tokens.shift();
    if(!token.startsWith("--")){
      throw new Error(`Unexpected argument ${token}`);
    }

    const [key, value] = token.split("=");

    if(!(key in flags)){
      throw new Error(`Unknown flag ${key}`);
    }

    result.flags[key] = parseValue(value, flags[key]);
  }

  return result;
}


const cli = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "cli> ",
  historySize: 100,
});

cli.on("line", async(input) => {
  const [command, ...tokens] = input.trim().split(" ");

  try{
    switch(command){
      case "create-admin": {
        const {arguments} = parseTokens(tokens, {
          arguments: {name: "string", email: "string", password: "string"}
        })
        await createSuperAdmin(arguments.name, arguments.email, arguments.password);
        break;
      }
      case "exit":
      case "quit":
          console.log("Goodbye!");
          process.exit(0);

        default:
          console.log(`Command not found: ${command}`);

    }

  }catch(error){
    console.log(error.message);
  }

  // re-show the prompt cli> 
  cli.prompt();
}).on("close", () => {
  console.log("Goodbye!");
  process.exit(0);
})

const bootstrap = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    cli.prompt();
  }catch(error) {
    console.log(error);
    process.exit(1);
  }

}
bootstrap();