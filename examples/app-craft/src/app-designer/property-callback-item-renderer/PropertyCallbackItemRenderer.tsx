import {ZodType} from "zod";
import {useShowModal} from "../../modal/useShowModal.ts";
import {useUpdateSelectedDragContainer} from "../hooks/useUpdateSelectedDragContainer.ts";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {LabelContainer} from "../label-container/LabelContainer.tsx";
import {Button} from "../button/Button.tsx";
import {ComponentPropertyEditor} from "../property-editor/ComponentPropertyEditor.tsx";
import {TbCodeDots} from "react-icons/tb";
import {ContainerPropertyType} from "../AppDesigner.tsx";
import {notifiable} from "react-hook-signal"
import {useSelectedDragContainer} from "../hooks/useSelectedDragContainer.ts";
import {colors} from "stock-watch/src/utils/colors.ts";
import {isEmpty} from "../../utils/isEmpty.ts";
export function PropertyCallbackItemRenderer(props: { propertyName: string, type: ZodType }) {
    const {propertyName, type} = props;
    const showModal = useShowModal();
    const update = useUpdateSelectedDragContainer();
    const context = useContext(AppDesignerContext);
    const containerSignal = useSelectedDragContainer();
    return <LabelContainer key={propertyName} label={propertyName}
                           style={{flexDirection: 'row', alignItems: 'center'}}
                           styleLabel={{width: 65, fontSize: 13}}
    >
        <notifiable.div style={{display:'flex',flexDirection:'column',flexGrow:1}}>
            {() => {
                const container = containerSignal.get();
                let isFormulaEmpty = true;
                if(container && container.properties[propertyName]){
                    const formula = container.properties[propertyName].formula;
                    isFormulaEmpty = isEmpty(formula);
                }
                return <Button style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor : isFormulaEmpty ? colors.grey : colors.green,
                    padding:0,
                }} onClick={async () => {
                    const result = await showModal<ContainerPropertyType>(closePanel => {
                        return <AppDesignerContext.Provider value={context}>
                            <ComponentPropertyEditor closePanel={closePanel} name={propertyName} type={type}/>
                        </AppDesignerContext.Provider>
                    });
                    if (result) {
                        update(selectedContainer => {
                            selectedContainer.properties = {...selectedContainer.properties,[propertyName]:result}
                        })
                    }
                }}><TbCodeDots style={{fontSize:22}} /></Button>
            }}
        </notifiable.div>

    </LabelContainer>
}