import {PiPackage, PiTrafficSignal, PiWebhooksLogo} from "react-icons/pi";
import {LuDatabase, LuFormInput, LuSigmaSquare} from "react-icons/lu";
import {
    IoCodeSlashOutline,
    IoInformationCircleOutline,
    IoLogoWebComponent,
    IoOpenOutline,
    IoSquareOutline,
    IoTrashOutline
} from "react-icons/io5";
import {TiSortNumerically} from "react-icons/ti";
import {AiOutlineApi, AiOutlineFieldString} from "react-icons/ai";
import {TbJumpRope, TbToggleLeftFilled} from "react-icons/tb";
import {
    MdAdd,
    MdCheck,
    MdCheckBox,
    MdClose,
    MdDataArray,
    MdDataObject,
    MdError,
    MdMinimize,
    MdOutlineQuestionMark,
    MdOutlineStyle,
    MdTitle,
    MdTouchApp
} from "react-icons/md";
import {IoIosArrowDown, IoIosArrowForward, IoIosExit, IoIosSave} from "react-icons/io";
import {RiPagesLine} from "react-icons/ri";
import {BiReset} from "react-icons/bi";
import {HiCollection, HiViewBoards} from "react-icons/hi";
import {GoDatabase} from "react-icons/go";

export const Icon = {
    State: PiTrafficSignal,
    Computed: LuSigmaSquare,
    Effect: PiWebhooksLogo,
    Delete: IoTrashOutline,
    Detail: IoOpenOutline,
    Number: TiSortNumerically,
    String: AiOutlineFieldString,
    Boolean: TbToggleLeftFilled,
    Record: MdDataObject,
    Array: MdDataArray,
    Checked: MdCheck,
    ArrowDown: IoIosArrowDown,
    ArrowRight: IoIosArrowForward,
    Save: IoIosSave,
    Exit: IoIosExit,
    Error: MdError,
    Formula: IoCodeSlashOutline,
    Minimize: MdMinimize,
    Page: RiPagesLine,
    Component: IoLogoWebComponent,
    Variable: PiTrafficSignal,
    Style: MdOutlineStyle,
    Property: TbJumpRope,
    Close: MdClose,
    Question: MdOutlineQuestionMark,
    Reset: BiReset,
    Package: PiPackage,
    CheckboxBlank: IoSquareOutline,
    CheckboxChecked: MdCheckBox,
    Confirmation: IoInformationCircleOutline,
    Fetcher: AiOutlineApi,
    Add: MdAdd,
    Button: MdTouchApp,
    Input: LuFormInput,
    Table: HiCollection,
    Row: HiViewBoards,
    Title: MdTitle,
    Database: GoDatabase
}