import {guid} from "../utils/guid.ts";
import {Page} from "./AppDesigner.tsx";

export function createNewBlankPage():Page{
    return {
        id : guid(),
        variables : [],
        containers : [{
            id: guid(),
            type: 'vertical',
            children: [],
            parent: '',
            height: '',
            width: '',
            minWidth: '100px',
            minHeight: '100px',

            marginTop: '',
            marginRight: '',
            marginBottom: '',
            marginLeft: '',

            paddingTop: '',
            paddingRight: '',
            paddingBottom: '',
            paddingLeft: '',
            properties: {},

            gap: '',
            verticalAlign: '',
            horizontalAlign: '',

        }],
        name : 'home'
    }
}