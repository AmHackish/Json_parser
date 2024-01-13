## Description

The JSON parser is written in `json-parser.ts`. The tool is used to parse a given string and returns the equivalent object representation of the string in TypeScript.

Check out [this](https://www.notion.so/mohitjain/2-Write-Your-Own-JSON-Parser-09795d8ec27c4ee8a55a457f3da99fd2) Notion page to understand how I approached this challenge.

## Usage

You can directly import the tool into any TypeScript file as follows:

```ts
import { JsonParser } from 'path/to/json-parser.ts';

const output = new JsonParser(input).parse();
```

## Run tests

To run the tests for the JSON parser tool, go to the root directory of this repository and in the json_parser_test.ts add the file name which you wnat to test and run the following command:

```bash
ts-node src/tests/json_parser_test.ts
```