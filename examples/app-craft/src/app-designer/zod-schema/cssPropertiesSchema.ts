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
    zIndex: z.union([z.string(), z.number()]).optional(),
});

