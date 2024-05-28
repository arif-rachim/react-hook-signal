import {capFirstLetter, lowFirstLetter} from "./capFirstLetter.ts";

export function convertToVarName(name:string){
    return name.split(' ').filter(i => i.trim()).map((i,index) => index === 0 ? lowFirstLetter(i) :capFirstLetter(i)).join('');
}