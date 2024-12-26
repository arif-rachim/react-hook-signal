import {
    dateAdd,
    dateToString,
    format_ddMMMyyyy,
    format_ddMMMyyyy_hhmm,
    format_hhmm,
    format_hhmmss,
    toDate
} from "./dateFormat.ts";
import {format_ddMMM} from "stock-watch/src/utils/dateFormat.ts";
import {toString} from "./toString.ts";
import {toNumber} from "./toNumber.ts";
import {isEmpty} from "./isEmpty.ts";
import {guid, uniqueNumber} from "./guid.ts";

export const utils = {
    toDate: toDate,
    dateToString: dateToString,
    dateAdd: dateAdd,
    ddMmmYyyy: format_ddMMMyyyy,
    hhMm: format_hhmm,
    ddMmm: format_ddMMM,
    hhMmSs: format_hhmmss,
    ddMmmYyyyHhMm: format_ddMMMyyyy_hhmm,
    toString: toString,
    toNumber: toNumber,
    isEmpty: isEmpty,
    guid: guid,
    uniqueNumber: uniqueNumber
}