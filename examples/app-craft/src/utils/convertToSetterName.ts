import {capFirstLetter} from "./capFirstLetter.ts";

export function convertToSetterName(name: string) {
    return 'set' + name.split(' ').filter(i => i.trim()).map((i) => capFirstLetter(i)).join('');
}