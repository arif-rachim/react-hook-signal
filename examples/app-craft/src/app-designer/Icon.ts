import {PiPackage, PiTrafficSignal, PiWebhooksLogo} from "react-icons/pi";
import {LuFormInput, LuSigmaSquare} from "react-icons/lu";
import {
    IoCodeSlashOutline,
    IoGrid,
    IoInformationCircleOutline,
    IoOpenOutline,
    IoSquareOutline,
    IoTrashOutline
} from "react-icons/io5";
import {TiSortNumerically} from "react-icons/ti";
import {AiOutlineApi, AiOutlineFieldString, AiOutlineGroup} from "react-icons/ai";
import {TbDatabaseSearch, TbJumpRope, TbToggleLeftFilled} from "react-icons/tb";
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
import {SiAzurefunctions} from "react-icons/si";
import {FaCubes, FaHollyBerry} from "react-icons/fa6";
import {RedX} from "../components/fault-status-icon/FaultStatusIcon.tsx";

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
    Component: FaCubes,
    Variable: FaHollyBerry,
    ApplicationVariable : FaHollyBerry,
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
    Database: GoDatabase,
    Query : TbDatabaseSearch,
    Function : SiAzurefunctions,
    Container : AiOutlineGroup,
    Grid : IoGrid,
    FaultIcon : RedX
}