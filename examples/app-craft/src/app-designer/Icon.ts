import {PiPackage, PiTrafficSignal, PiWebhooksLogo} from "react-icons/pi";
import {LuFormInput, LuSigmaSquare} from "react-icons/lu";
import {
    IoCodeSlashOutline,
    IoInformationCircleOutline,
    IoLogoWebComponent,
    IoOpenOutline,
    IoSquareOutline,
    IoTrashOutline
} from "react-icons/io5";
import {TiSortNumerically} from "react-icons/ti";
import {AiOutlineFieldString, AiOutlineFunction, AiOutlineGroup} from "react-icons/ai";
import {TbBinaryTree, TbJumpRope, TbSql, TbToggleLeftFilled} from "react-icons/tb";
import {
    MdAdd,
    MdCheck,
    MdCheckBox,
    MdClose,
    MdDataArray,
    MdDataObject,
    MdError,
    MdMinimize,
    MdOutlineHttp,
    MdOutlineQuestionMark,
    MdOutlineStyle,
    MdSmartButton,
    MdTitle
} from "react-icons/md";
import {IoIosArrowDown, IoIosArrowForward, IoIosExit, IoIosSave} from "react-icons/io";
import {RiPagesLine} from "react-icons/ri";
import {BiChevronDown, BiChevronRight, BiReset} from "react-icons/bi";
import {HiCollection, HiViewBoards} from "react-icons/hi";
import {GoDatabase} from "react-icons/go";
import {FaFile, FaFolder} from "react-icons/fa6";
import {RedX} from "../components/fault-status-icon/FaultStatusIcon.tsx";
import {HiOutlineVariable} from "react-icons/hi2";
import {BsTable} from "react-icons/bs";

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
    Variable: HiOutlineVariable,
    ApplicationVariable: HiOutlineVariable ,
    Style: MdOutlineStyle,
    Property: TbJumpRope,
    Close: MdClose,
    Question: MdOutlineQuestionMark,
    Reset: BiReset,
    Package: PiPackage,
    CheckboxBlank: IoSquareOutline,
    CheckboxChecked: MdCheckBox,
    Confirmation: IoInformationCircleOutline,
    Fetcher: MdOutlineHttp,
    Add: MdAdd,
    Button: MdSmartButton,
    Input: LuFormInput,
    Table: HiCollection,
    Row: HiViewBoards,
    Title: MdTitle,
    Database: GoDatabase,
    Query: TbSql,
    Function: AiOutlineFunction,
    Container: AiOutlineGroup,
    Grid: BsTable,
    FaultIcon: RedX,
    Folder: FaFolder,
    File: FaFile,
    ChevronRight: BiChevronRight,
    ChevronDown: BiChevronDown,
    Tree : TbBinaryTree
}