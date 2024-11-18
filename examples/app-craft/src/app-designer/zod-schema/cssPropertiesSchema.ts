import {z} from 'zod';

// Utility for CSS length units (string or number)
const cssLength = z.union([z.string(), z.number()]).optional();

// Enum-like validation for specific property values
const cssPosition = z.enum(["static", "relative", "absolute", "fixed", "sticky"]).optional();
const cssDisplay = z.enum([
    "none", "inline", "block", "inline-block", "flex", "inline-flex", "grid", "inline-grid", "flow-root",
    "contents", "table", "table-row", "table-cell", "list-item", "inherit", "initial", "unset"
]).optional();

export const cssPropertiesSchema = z.object({
    alignContent: z.string().optional(),
    alignItems: z.string().optional(),
    alignSelf: z.string().optional(),
    all: z.string().optional(),
    animation: z.string().optional(),
    animationDelay: z.string().optional(),
    animationDirection: z.string().optional(),
    animationDuration: z.string().optional(),
    animationFillMode: z.string().optional(),
    animationIterationCount: z.union([z.string(), z.number()]).optional(),
    animationName: z.string().optional(),
    animationPlayState: z.string().optional(),
    animationTimingFunction: z.string().optional(),
    appearance: z.string().optional(),
    aspectRatio: cssLength,
    backdropFilter: z.string().optional(),
    backfaceVisibility: z.string().optional(),
    background: z.string().optional(),
    backgroundAttachment: z.string().optional(),
    backgroundBlendMode: z.string().optional(),
    backgroundClip: z.string().optional(),
    backgroundColor: z.string().optional(),
    backgroundImage: z.string().optional(),
    backgroundOrigin: z.string().optional(),
    backgroundPosition: z.string().optional(),
    backgroundPositionX: cssLength.optional(),
    backgroundPositionY: cssLength.optional(),
    backgroundRepeat: z.string().optional(),
    backgroundSize: z.string().optional(),
    baselineShift: cssLength.optional(),
    blockSize: cssLength.optional(),
    border: z.string().optional(),
    borderBlock: z.string().optional(),
    borderBlockColor: z.string().optional(),
    borderBlockEnd: z.string().optional(),
    borderBlockEndColor: z.string().optional(),
    borderBlockEndStyle: z.string().optional(),
    borderBlockEndWidth: cssLength.optional(),
    borderBlockStart: z.string().optional(),
    borderBlockStartColor: z.string().optional(),
    borderBlockStartStyle: z.string().optional(),
    borderBlockStartWidth: cssLength.optional(),
    borderBlockStyle: z.string().optional(),
    borderBlockWidth: cssLength.optional(),
    borderBottom: z.string().optional(),
    borderBottomColor: z.string().optional(),
    borderBottomLeftRadius: cssLength.optional(),
    borderBottomRightRadius: cssLength.optional(),
    borderBottomStyle: z.string().optional(),
    borderBottomWidth: cssLength.optional(),
    borderCollapse: z.string().optional(),
    borderColor: z.string().optional(),
    borderEndEndRadius: cssLength.optional(),
    borderEndStartRadius: cssLength.optional(),
    borderImage: z.string().optional(),
    borderImageOutset: cssLength.optional(),
    borderImageRepeat: z.string().optional(),
    borderImageSlice: cssLength.optional(),
    borderImageSource: z.string().optional(),
    borderImageWidth: cssLength.optional(),
    borderInline: z.string().optional(),
    borderInlineColor: z.string().optional(),
    borderInlineEnd: z.string().optional(),
    borderInlineEndColor: z.string().optional(),
    borderInlineEndStyle: z.string().optional(),
    borderInlineEndWidth: cssLength.optional(),
    borderInlineStart: z.string().optional(),
    borderInlineStartColor: z.string().optional(),
    borderInlineStartStyle: z.string().optional(),
    borderInlineStartWidth: cssLength.optional(),
    borderInlineStyle: z.string().optional(),
    borderInlineWidth: cssLength.optional(),
    borderLeft: z.string().optional(),
    borderLeftColor: z.string().optional(),
    borderLeftStyle: z.string().optional(),
    borderLeftWidth: cssLength.optional(),
    borderRadius: cssLength.optional(),
    borderRight: z.string().optional(),
    borderRightColor: z.string().optional(),
    borderRightStyle: z.string().optional(),
    borderRightWidth: cssLength.optional(),
    borderSpacing: cssLength.optional(),
    borderStartEndRadius: cssLength.optional(),
    borderStartStartRadius: cssLength.optional(),
    borderStyle: z.string().optional(),
    borderTop: z.string().optional(),
    borderTopColor: z.string().optional(),
    borderTopLeftRadius: cssLength.optional(),
    borderTopRightRadius: cssLength.optional(),
    borderTopStyle: z.string().optional(),
    borderTopWidth: cssLength.optional(),
    borderWidth: cssLength.optional(),
    bottom: cssLength.optional(),
    boxShadow: z.string().optional(),
    boxSizing: z.string().optional(),
    breakAfter: z.string().optional(),
    breakBefore: z.string().optional(),
    breakInside: z.string().optional(),
    captionSide: z.string().optional(),
    caretColor: z.string().optional(),
    clear: z.string().optional(),
    clip: z.string().optional(),
    clipPath: z.string().optional(),
    color: z.string().optional(),
    columnCount: z.union([z.number(), z.string()]).optional(),
    columnFill: z.string().optional(),
    columnGap: cssLength.optional(),
    columnRule: z.string().optional(),
    columnRuleColor: z.string().optional(),
    columnRuleStyle: z.string().optional(),
    columnRuleWidth: cssLength.optional(),
    columnSpan: z.string().optional(),
    columnWidth: cssLength.optional(),
    columns: z.string().optional(),
    contain: z.string().optional(),
    content: z.string().optional(),
    counterIncrement: z.string().optional(),
    counterReset: z.string().optional(),
    cursor: z.string().optional(),
    direction: z.string().optional(),
    display: cssDisplay,
    emptyCells: z.string().optional(),
    filter: z.string().optional(),
    flex: z.string().optional(),
    flexBasis: cssLength.optional(),
    flexDirection: z.string().optional(),
    flexFlow: z.string().optional(),
    flexGrow: z.union([z.string(), z.number()]).optional(),
    flexShrink: z.union([z.string(), z.number()]).optional(),
    flexWrap: z.string().optional(),
    float: z.string().optional(),
    font: z.string().optional(),
    fontFamily: z.string().optional(),
    fontFeatureSettings: z.string().optional(),
    fontKerning: z.string().optional(),
    fontOpticalSizing: z.string().optional(),
    fontSize: cssLength.optional(),
    fontStretch: z.string().optional(),
    fontStyle: z.string().optional(),
    fontVariant: z.string().optional(),
    fontWeight: z.union([z.string(), z.number()]).optional(),
    gap: cssLength.optional(),
    grid: z.string().optional(),
    gridArea: z.string().optional(),
    gridAutoColumns: z.string().optional(),
    gridAutoFlow: z.string().optional(),
    gridAutoRows: z.string().optional(),
    gridColumn: z.string().optional(),
    gridColumnEnd: z.string().optional(),
    gridColumnGap: cssLength.optional(),
    gridColumnStart: z.string().optional(),
    gridGap: cssLength.optional(),
    gridRow: z.string().optional(),
    gridRowEnd: z.string().optional(),
    gridRowGap: cssLength.optional(),
    gridRowStart: z.string().optional(),
    gridTemplate: z.string().optional(),
    gridTemplateAreas: z.string().optional(),
    gridTemplateColumns: z.string().optional(),
    gridTemplateRows: z.string().optional(),
    height: cssLength.optional(),
    justifyContent: z.string().optional(),
    justifyItems: z.string().optional(),
    justifySelf: z.string().optional(),
    left: cssLength.optional(),
    letterSpacing: cssLength.optional(),
    lineHeight: cssLength.optional(),
    listStyle: z.string().optional(),
    listStyleImage: z.string().optional(),
    listStylePosition: z.string().optional(),
    listStyleType: z.string().optional(),
    margin: cssLength.optional(),
    marginBottom: cssLength.optional(),
    marginLeft: cssLength.optional(),
    marginRight: cssLength.optional(),
    marginTop: cssLength.optional(),
    mask: z.string().optional(),
    maxHeight: cssLength.optional(),
    maxWidth: cssLength.optional(),
    minHeight: cssLength.optional(),
    minWidth: cssLength.optional(),
    opacity: z.union([z.string(), z.number()]).optional(),
    order: z.union([z.string(), z.number()]).optional(),
    outline: z.string().optional(),
    overflow: z.string().optional(),
    padding: cssLength.optional(),
    paddingBottom: cssLength.optional(),
    paddingLeft: cssLength.optional(),
    paddingRight: cssLength.optional(),
    paddingTop: cssLength.optional(),
    position: cssPosition,
    right: cssLength.optional(),
    top: cssLength.optional(),
    textAlign: z.string().optional(),
    visibility: z.string().optional(),
    width: cssLength.optional(),
    zIndex: z.union([z.string(), z.number()]).optional(),
});
export const icons = ["IoIosAddCircleOutline", "IoIosAddCircle", "IoIosAdd", "IoIosAirplane", "IoIosAlarm", "IoIosAlbums", "IoIosAlert", "IoIosAmericanFootball", "IoIosAnalytics", "IoIosAperture", "IoIosApps", "IoIosAppstore", "IoIosArchive", "IoIosArrowBack", "IoIosArrowDown", "IoIosArrowDropdownCircle", "IoIosArrowDropdown", "IoIosArrowDropleftCircle", "IoIosArrowDropleft", "IoIosArrowDroprightCircle", "IoIosArrowDropright", "IoIosArrowDropupCircle", "IoIosArrowDropup", "IoIosArrowForward", "IoIosArrowRoundBack", "IoIosArrowRoundDown", "IoIosArrowRoundForward", "IoIosArrowRoundUp", "IoIosArrowUp", "IoIosAt", "IoIosAttach", "IoIosBackspace", "IoIosBarcode", "IoIosBaseball", "IoIosBasket", "IoIosBasketball", "IoIosBatteryCharging", "IoIosBatteryDead", "IoIosBatteryFull", "IoIosBeaker", "IoIosBed", "IoIosBeer", "IoIosBicycle", "IoIosBluetooth", "IoIosBoat", "IoIosBody", "IoIosBonfire", "IoIosBook", "IoIosBookmark", "IoIosBookmarks", "IoIosBowtie", "IoIosBriefcase", "IoIosBrowsers", "IoIosBrush", "IoIosBug", "IoIosBuild", "IoIosBulb", "IoIosBus", "IoIosBusiness", "IoIosCafe", "IoIosCalculator", "IoIosCalendar", "IoIosCall", "IoIosCamera", "IoIosCar", "IoIosCard", "IoIosCart", "IoIosCash", "IoIosCellular", "IoIosChatboxes", "IoIosChatbubbles", "IoIosCheckboxOutline", "IoIosCheckbox", "IoIosCheckmarkCircleOutline", "IoIosCheckmarkCircle", "IoIosCheckmark", "IoIosClipboard", "IoIosClock", "IoIosCloseCircleOutline", "IoIosCloseCircle", "IoIosClose", "IoIosCloudCircle", "IoIosCloudDone", "IoIosCloudDownload", "IoIosCloudOutline", "IoIosCloudUpload", "IoIosCloud", "IoIosCloudyNight", "IoIosCloudy", "IoIosCodeDownload", "IoIosCodeWorking", "IoIosCode", "IoIosCog", "IoIosColorFill", "IoIosColorFilter", "IoIosColorPalette", "IoIosColorWand", "IoIosCompass", "IoIosConstruct", "IoIosContact", "IoIosContacts", "IoIosContract", "IoIosContrast", "IoIosCopy", "IoIosCreate", "IoIosCrop", "IoIosCube", "IoIosCut", "IoIosDesktop", "IoIosDisc", "IoIosDocument", "IoIosDoneAll", "IoIosDownload", "IoIosEasel", "IoIosEgg", "IoIosExit", "IoIosExpand", "IoIosEyeOff", "IoIosEye", "IoIosFastforward", "IoIosFemale", "IoIosFiling", "IoIosFilm", "IoIosFingerPrint", "IoIosFitness", "IoIosFlag", "IoIosFlame", "IoIosFlashOff", "IoIosFlash", "IoIosFlashlight", "IoIosFlask", "IoIosFlower", "IoIosFolderOpen", "IoIosFolder", "IoIosFootball", "IoIosFunnel", "IoIosGift", "IoIosGitBranch", "IoIosGitCommit", "IoIosGitCompare", "IoIosGitMerge", "IoIosGitNetwork", "IoIosGitPullRequest", "IoIosGlasses", "IoIosGlobe", "IoIosGrid", "IoIosHammer", "IoIosHand", "IoIosHappy", "IoIosHeadset", "IoIosHeartDislike", "IoIosHeartEmpty", "IoIosHeartHalf", "IoIosHeart", "IoIosHelpBuoy", "IoIosHelpCircleOutline", "IoIosHelpCircle", "IoIosHelp", "IoIosHome", "IoIosHourglass", "IoIosIceCream", "IoIosImage", "IoIosImages", "IoIosInfinite", "IoIosInformationCircleOutline", "IoIosInformationCircle", "IoIosInformation", "IoIosJet", "IoIosJournal", "IoIosKey", "IoIosKeypad", "IoIosLaptop", "IoIosLeaf", "IoIosLink", "IoIosListBox", "IoIosList", "IoIosLocate", "IoIosLock", "IoIosLogIn", "IoIosLogOut", "IoIosMagnet", "IoIosMailOpen", "IoIosMailUnread", "IoIosMail", "IoIosMale", "IoIosMan", "IoIosMap", "IoIosMedal", "IoIosMedical", "IoIosMedkit", "IoIosMegaphone", "IoIosMenu", "IoIosMicOff", "IoIosMic", "IoIosMicrophone", "IoIosMoon", "IoIosMore", "IoIosMove", "IoIosMusicalNote", "IoIosMusicalNotes", "IoIosNavigate", "IoIosNotificationsOff", "IoIosNotificationsOutline", "IoIosNotifications", "IoIosNuclear", "IoIosNutrition", "IoIosOpen", "IoIosOptions", "IoIosOutlet", "IoIosPaperPlane", "IoIosPaper", "IoIosPartlySunny", "IoIosPause", "IoIosPaw", "IoIosPeople", "IoIosPersonAdd", "IoIosPerson", "IoIosPhoneLandscape", "IoIosPhonePortrait", "IoIosPhotos", "IoIosPie", "IoIosPin", "IoIosPint", "IoIosPizza", "IoIosPlanet", "IoIosPlayCircle", "IoIosPlay", "IoIosPodium", "IoIosPower", "IoIosPricetag", "IoIosPricetags", "IoIosPrint", "IoIosPulse", "IoIosQrScanner", "IoIosQuote", "IoIosRadioButtonOff", "IoIosRadioButtonOn", "IoIosRadio", "IoIosRainy", "IoIosRecording", "IoIosRedo", "IoIosRefreshCircle", "IoIosRefresh", "IoIosRemoveCircleOutline", "IoIosRemoveCircle", "IoIosRemove", "IoIosReorder", "IoIosRepeat", "IoIosResize", "IoIosRestaurant", "IoIosReturnLeft", "IoIosReturnRight", "IoIosReverseCamera", "IoIosRewind", "IoIosRibbon", "IoIosRocket", "IoIosRose", "IoIosSad", "IoIosSave", "IoIosSchool", "IoIosSearch", "IoIosSend", "IoIosSettings", "IoIosShareAlt", "IoIosShare", "IoIosShirt", "IoIosShuffle", "IoIosSkipBackward", "IoIosSkipForward", "IoIosSnow", "IoIosSpeedometer", "IoIosSquareOutline", "IoIosSquare", "IoIosStarHalf", "IoIosStarOutline", "IoIosStar", "IoIosStats", "IoIosStopwatch", "IoIosSubway", "IoIosSunny", "IoIosSwap", "IoIosSwitch", "IoIosSync", "IoIosTabletLandscape", "IoIosTabletPortrait", "IoIosTennisball", "IoIosText", "IoIosThermometer", "IoIosThumbsDown", "IoIosThumbsUp", "IoIosThunderstorm", "IoIosTime", "IoIosTimer", "IoIosToday", "IoIosTrain", "IoIosTransgender", "IoIosTrash", "IoIosTrendingDown", "IoIosTrendingUp", "IoIosTrophy", "IoIosTv", "IoIosUmbrella", "IoIosUndo", "IoIosUnlock", "IoIosVideocam", "IoIosVolumeHigh", "IoIosVolumeLow", "IoIosVolumeMute", "IoIosVolumeOff", "IoIosWalk", "IoIosWallet", "IoIosWarning", "IoIosWatch", "IoIosWater", "IoIosWifi", "IoIosWine", "IoIosWoman", "IoLogoAndroid", "IoLogoAngular", "IoLogoApple", "IoLogoBitbucket", "IoLogoBitcoin", "IoLogoBuffer", "IoLogoChrome", "IoLogoClosedCaptioning", "IoLogoCodepen", "IoLogoCss3", "IoLogoDesignernews", "IoLogoDribbble", "IoLogoDropbox", "IoLogoEuro", "IoLogoFacebook", "IoLogoFlickr", "IoLogoFoursquare", "IoLogoFreebsdDevil", "IoLogoGameControllerA", "IoLogoGameControllerB", "IoLogoGithub", "IoLogoGoogle", "IoLogoGoogleplus", "IoLogoHackernews", "IoLogoHtml5", "IoLogoInstagram", "IoLogoIonic", "IoLogoIonitron", "IoLogoJavascript", "IoLogoLinkedin", "IoLogoMarkdown", "IoLogoModelS", "IoLogoNoSmoking", "IoLogoNodejs", "IoLogoNpm", "IoLogoOctocat", "IoLogoPinterest", "IoLogoPlaystation", "IoLogoPolymer", "IoLogoPython", "IoLogoReddit", "IoLogoRss", "IoLogoSass", "IoLogoSkype", "IoLogoSlack", "IoLogoSnapchat", "IoLogoSteam", "IoLogoTumblr", "IoLogoTux", "IoLogoTwitch", "IoLogoTwitter", "IoLogoUsd", "IoLogoVimeo", "IoLogoVk", "IoLogoWhatsapp", "IoLogoWindows", "IoLogoWordpress", "IoLogoXbox", "IoLogoXing", "IoLogoYahoo", "IoLogoYen", "IoLogoYoutube", "IoMdAddCircleOutline", "IoMdAddCircle", "IoMdAdd", "IoMdAirplane", "IoMdAlarm", "IoMdAlbums", "IoMdAlert", "IoMdAmericanFootball", "IoMdAnalytics", "IoMdAperture", "IoMdApps", "IoMdAppstore", "IoMdArchive", "IoMdArrowBack", "IoMdArrowDown", "IoMdArrowDropdownCircle", "IoMdArrowDropdown", "IoMdArrowDropleftCircle", "IoMdArrowDropleft", "IoMdArrowDroprightCircle", "IoMdArrowDropright", "IoMdArrowDropupCircle", "IoMdArrowDropup", "IoMdArrowForward", "IoMdArrowRoundBack", "IoMdArrowRoundDown", "IoMdArrowRoundForward", "IoMdArrowRoundUp", "IoMdArrowUp", "IoMdAt", "IoMdAttach", "IoMdBackspace", "IoMdBarcode", "IoMdBaseball", "IoMdBasket", "IoMdBasketball", "IoMdBatteryCharging", "IoMdBatteryDead", "IoMdBatteryFull", "IoMdBeaker", "IoMdBed", "IoMdBeer", "IoMdBicycle", "IoMdBluetooth", "IoMdBoat", "IoMdBody", "IoMdBonfire", "IoMdBook", "IoMdBookmark", "IoMdBookmarks", "IoMdBowtie", "IoMdBriefcase", "IoMdBrowsers", "IoMdBrush", "IoMdBug", "IoMdBuild", "IoMdBulb", "IoMdBus", "IoMdBusiness", "IoMdCafe", "IoMdCalculator", "IoMdCalendar", "IoMdCall", "IoMdCamera", "IoMdCar", "IoMdCard", "IoMdCart", "IoMdCash", "IoMdCellular", "IoMdChatboxes", "IoMdChatbubbles", "IoMdCheckboxOutline", "IoMdCheckbox", "IoMdCheckmarkCircleOutline", "IoMdCheckmarkCircle", "IoMdCheckmark", "IoMdClipboard", "IoMdClock", "IoMdCloseCircleOutline", "IoMdCloseCircle", "IoMdClose", "IoMdCloudCircle", "IoMdCloudDone", "IoMdCloudDownload", "IoMdCloudOutline", "IoMdCloudUpload", "IoMdCloud", "IoMdCloudyNight", "IoMdCloudy", "IoMdCodeDownload", "IoMdCodeWorking", "IoMdCode", "IoMdCog", "IoMdColorFill", "IoMdColorFilter", "IoMdColorPalette", "IoMdColorWand", "IoMdCompass", "IoMdConstruct", "IoMdContact", "IoMdContacts", "IoMdContract", "IoMdContrast", "IoMdCopy", "IoMdCreate", "IoMdCrop", "IoMdCube", "IoMdCut", "IoMdDesktop", "IoMdDisc", "IoMdDocument", "IoMdDoneAll", "IoMdDownload", "IoMdEasel", "IoMdEgg", "IoMdExit", "IoMdExpand", "IoMdEyeOff", "IoMdEye", "IoMdFastforward", "IoMdFemale", "IoMdFiling", "IoMdFilm", "IoMdFingerPrint", "IoMdFitness", "IoMdFlag", "IoMdFlame", "IoMdFlashOff", "IoMdFlash", "IoMdFlashlight", "IoMdFlask", "IoMdFlower", "IoMdFolderOpen", "IoMdFolder", "IoMdFootball", "IoMdFunnel", "IoMdGift", "IoMdGitBranch", "IoMdGitCommit", "IoMdGitCompare", "IoMdGitMerge", "IoMdGitNetwork", "IoMdGitPullRequest", "IoMdGlasses", "IoMdGlobe", "IoMdGrid", "IoMdHammer", "IoMdHand", "IoMdHappy", "IoMdHeadset", "IoMdHeartDislike", "IoMdHeartEmpty", "IoMdHeartHalf", "IoMdHeart", "IoMdHelpBuoy", "IoMdHelpCircleOutline", "IoMdHelpCircle", "IoMdHelp", "IoMdHome", "IoMdHourglass", "IoMdIceCream", "IoMdImage", "IoMdImages", "IoMdInfinite", "IoMdInformationCircleOutline", "IoMdInformationCircle", "IoMdInformation", "IoMdJet", "IoMdJournal", "IoMdKey", "IoMdKeypad", "IoMdLaptop", "IoMdLeaf", "IoMdLink", "IoMdListBox", "IoMdList", "IoMdLocate", "IoMdLock", "IoMdLogIn", "IoMdLogOut", "IoMdMagnet", "IoMdMailOpen", "IoMdMailUnread", "IoMdMail", "IoMdMale", "IoMdMan", "IoMdMap", "IoMdMedal", "IoMdMedical", "IoMdMedkit", "IoMdMegaphone", "IoMdMenu", "IoMdMicOff", "IoMdMic", "IoMdMicrophone", "IoMdMoon", "IoMdMore", "IoMdMove", "IoMdMusicalNote", "IoMdMusicalNotes", "IoMdNavigate", "IoMdNotificationsOff", "IoMdNotificationsOutline", "IoMdNotifications", "IoMdNuclear", "IoMdNutrition", "IoMdOpen", "IoMdOptions", "IoMdOutlet", "IoMdPaperPlane", "IoMdPaper", "IoMdPartlySunny", "IoMdPause", "IoMdPaw", "IoMdPeople", "IoMdPersonAdd", "IoMdPerson", "IoMdPhoneLandscape", "IoMdPhonePortrait", "IoMdPhotos", "IoMdPie", "IoMdPin", "IoMdPint", "IoMdPizza", "IoMdPlanet", "IoMdPlayCircle", "IoMdPlay", "IoMdPodium", "IoMdPower", "IoMdPricetag", "IoMdPricetags", "IoMdPrint", "IoMdPulse", "IoMdQrScanner", "IoMdQuote", "IoMdRadioButtonOff", "IoMdRadioButtonOn", "IoMdRadio", "IoMdRainy", "IoMdRecording", "IoMdRedo", "IoMdRefreshCircle", "IoMdRefresh", "IoMdRemoveCircleOutline", "IoMdRemoveCircle", "IoMdRemove", "IoMdReorder", "IoMdRepeat", "IoMdResize", "IoMdRestaurant", "IoMdReturnLeft", "IoMdReturnRight", "IoMdReverseCamera", "IoMdRewind", "IoMdRibbon", "IoMdRocket", "IoMdRose", "IoMdSad", "IoMdSave", "IoMdSchool", "IoMdSearch", "IoMdSend", "IoMdSettings", "IoMdShareAlt", "IoMdShare", "IoMdShirt", "IoMdShuffle", "IoMdSkipBackward", "IoMdSkipForward", "IoMdSnow", "IoMdSpeedometer", "IoMdSquareOutline", "IoMdSquare", "IoMdStarHalf", "IoMdStarOutline", "IoMdStar", "IoMdStats", "IoMdStopwatch", "IoMdSubway", "IoMdSunny", "IoMdSwap", "IoMdSwitch", "IoMdSync", "IoMdTabletLandscape", "IoMdTabletPortrait", "IoMdTennisball", "IoMdText", "IoMdThermometer", "IoMdThumbsDown", "IoMdThumbsUp", "IoMdThunderstorm", "IoMdTime", "IoMdTimer", "IoMdToday", "IoMdTrain", "IoMdTransgender", "IoMdTrash", "IoMdTrendingDown", "IoMdTrendingUp", "IoMdTrophy", "IoMdTv", "IoMdUmbrella", "IoMdUndo", "IoMdUnlock", "IoMdVideocam", "IoMdVolumeHigh", "IoMdVolumeLow", "IoMdVolumeMute", "IoMdVolumeOff", "IoMdWalk", "IoMdWallet", "IoMdWarning", "IoMdWatch", "IoMdWater", "IoMdWifi", "IoMdWine", "IoMdWoman"] as const;
export const iconSchema = z.enum(icons).optional()
