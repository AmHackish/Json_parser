import JsonParser from "../json_parser.js";
import fs from "fs";
import path from 'path';


const dir = "src/tests/step4/";
const files = fs.readdirSync(dir);
console.log(files);
files.forEach((file) => {
    console.log(file);
    if(file.endsWith('json')) {
        const input = fs.readFileSync(`${dir}${'valid2.json'}`, 'utf8').toString();
        console.log("input.......", input);
        let parser = new JsonParser(input).parse();
        console.log("output......",parser);
    }
})

console.log("Hey");
