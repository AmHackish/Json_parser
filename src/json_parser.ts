import {FALIURE_CODE, SUCESS_CODE, NumberToken, EscapeToken, Token} from '../token';
import {  JSONObject, JSONArray, JSONValue } from '../types';
const CONTROL_CHARACTERS_REGEX =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u001F\u007F-\u009F\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

export default class JsonParser {
    private pos = 0; // current index in the string
    private input:string; // string that needs to be parsed

    constructor(input) {
        this.input = input;
    }

    public parse() : JSONValue {
        this.consumeWhiteSpace();
        const value = this.parseValue();    
        this.consumeWhiteSpace();
        if(this.hasNext()) {
            console.log(`Unexpected value ${this.currentValue()} at position ${this.pos}`);
            process.exit(FALIURE_CODE);
        }
        console.log("Parsed Successfully", value);
        process.exit(SUCESS_CODE);
    }

    private parseValue():JSONValue {
        switch(this.currentValue()) {
            case Token.BEGIN_ARRAY:
                return this.parseArray();
            case Token.BEGIN_OBJECT:
                return this.parseObject();
            case Token.QUOTE:
                return this.parseString();
            case Token.BEGIN_FALSE:
                return this.parseFalse();
            case Token.BEGIN_NULL:
                return this.parseNull();
            case Token.BEGIN_TRUE:
                return this.parseTrue();
            case NumberToken.ZERO:
            case NumberToken.ONE:
            case NumberToken.TWO:
            case NumberToken.THREE:
            case NumberToken.FOUR:
            case NumberToken.FIVE:
            case NumberToken.SIX:
            case NumberToken.SEVEN:
            case NumberToken.EIGHT:
            case NumberToken.NINE:
            case NumberToken.MINUS:
                return this.parseNumber();
            default: 
                console.log(`Unexpected value ${this.currentValue()} at ${this.pos}`);
                process.exit(FALIURE_CODE);
        }   
        process.exit(SUCESS_CODE);
    }
    parseNumber():number {
        let str = '';
        // If the number if negative
        if(this.currentValue() == NumberToken.MINUS) {
            str += this.currentValue();
            this.consume();
        }
         // Parse the Integer part
        str += this.parseDigits();
        // If the number if a decimal
        if(this.currentValue() == NumberToken.DOT) {
            str += NumberToken.DOT;
            this.consume();

            str += this.parseDigits(true);
        }
        // If the number as an exponent part
        if(this.currentValue() == NumberToken.SMALL_EXPONENT || this.currentValue() == NumberToken.CAPITAL_EXPONENT) {
            str += this.currentValue();
            this.consume();
            if(this.currentValue() == NumberToken.PLUS || this.currentValue() == NumberToken.MINUS) {
                str += this.currentValue();
                this.consume();
            }
            str += this.parseDigits();
        }
        return parseFloat(str);
    }
    parseDigits(allowMulitpleZeroAtPrefix = false):string {
        let str = '';
        if(this.currentValue() === NumberToken.ZERO) {
            str += this.currentValue();
            this.consume();

            if(allowMulitpleZeroAtPrefix) {
                while(this.currentValue() === NumberToken.ZERO) {
                    str += this.currentValue();
                    this.consume();
                }
            }
        }
        else if(this.currentValue() >= NumberToken.ONE && this.currentValue() <= NumberToken.NINE) {
            str += this.currentValue();
            this.consume();
            while(this.currentValue() >= NumberToken.ZERO && this.currentValue() <= NumberToken.NINE) {
                str += this.currentValue();
                this.consume();
            }
        }
        else {
            console.log(`Invalid value ${this.currentValue()} at ${this.pos}`);
        }
        return str;
    }
    parseTrue(): boolean {
        this.consume('t');
        this.consume('r');
        this.consume('u');
        this.consume('e');
        return true;
    }
    parseArray():JSONArray {
        let arr:JSONArray = [];
        let moreValue = null;
        this.consume(Token.BEGIN_ARRAY);
        while(this.currentValue() != Token.END_ARRAY || moreValue) {
            let value = this.parseValue();
            arr.push(value);
            console.log(value);
            if(this.currentValue() === Token.COMMA) {
                this.consume(Token.COMMA);
                moreValue = true;
            }
            else if(Token.END_ARRAY != this.currentValue()) {
                moreValue = false;
                console.log(`Unexpected value at ${this.currentValue()} at ${this.pos}`);
            }
            else {
                moreValue = false;
            }
        }
        this.consume(Token.END_ARRAY);
        return arr;
    }
    parseObject():JSONObject {
        let obj: JSONObject = {};
        let morePairs = null;
        this.consume(Token.BEGIN_OBJECT);
        while(this.currentValue() != Token.END_OBJECT || morePairs) {
            const pair = this.parsePair();
            obj[pair.key] = pair.value;
            if(this.currentValue() == Token.COMMA) {
                this.consume();
                morePairs = true;
            }
            else if(this.currentValue() != Token.END_OBJECT) {
                morePairs = false;
                console.log(`Unexpected value at ${this.currentValue()} at ${this.pos}`);
            } 
            else {
                morePairs = false;
            }
        }
        this.consume(Token.END_OBJECT);
        return obj;
    }
    parsePair()  {
        const key = this.parseString();
        this.consume(Token.SEMI_COLON);
        const value = this.parseValue();
        return {key, value};
    }
    
    parseNull():null{
        this.consume('n');
        this.consume('u');
        this.consume('l');
        this.consume('l');
        return null;
    }
    parseFalse():boolean {
        this.consume('f');
        this.consume('a');
        this.consume('l');
        this.consume('s');
        this.consume('e');
        return false;
    }

    private parseString():string {
        let str='';
        this.consume(Token.QUOTE);
        while(this.currentValue() != Token.QUOTE) {
            if(this.currentValue() == Token.ESCAPE) {
                str += this.parseEscape();
            }
            else {
                if(this.isControlCode()){
                    console.log(`Invalid Character ${this.currentValue()} at ${this.pos}. Control Characters must be escaped`);
                }
                else {
                    str += this.currentValue();
                    //console.log("string...", this.currentValue());
                    this.consume(this.currentValue(), false);
                }
            }
        }
        this.consume(Token.QUOTE);
        return str;
    }

    private isControlCode(): boolean {
        return CONTROL_CHARACTERS_REGEX.test(this.currentValue());
    }

    parseEscape() {
        throw new Error('Method not implemented.');
    }

    private consumeWhiteSpace() {
        while(this.hasNext() && this.currentValue() === ' ' || this.currentValue() === '\t' || this.currentValue() === '\n' ||this.currentValue() === '\r')
        {
            this.pos++;
        }
    }

    private consume(value?:string, skip = true) {
        if(value && value !== this.currentValue()) {
            console.log(`expected Value ${value} but found this ${this.currentValue()}`);
            process.exit(FALIURE_CODE);
        }
        this.pos++;
        if(skip)
            this.consumeWhiteSpace();
    }

    private currentValue() {
        return this.input[this.pos];
    }

    private hasNext() :boolean {
        return this.pos < this.input.length;
    }
}