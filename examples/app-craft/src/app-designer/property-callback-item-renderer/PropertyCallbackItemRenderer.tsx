import {ZodType} from "zod";
import {useShowModal} from "../../modal/useShowModal.ts";
import {useUpdateSelectedDragContainer} from "../useUpdateSelectedDragContainer.ts";
import {useContext} from "react";
import {AppDesignerContext} from "../AppDesignerContext.ts";
import {LabelContainer} from "../label-container/LabelContainer.tsx";
import {Button} from "../button/Button.tsx";
import {ComponentPropertyEditor} from "../property-editor/ComponentPropertyEditor.tsx";
import {TbCodeDots} from "react-icons/tb";
import {ContainerPropertyType} from "../AppDesigner.tsx";

export function PropertyCallbackItemRenderer(props: { propertyName: string, type: ZodType }) {
    const {propertyName, type} = props;
    const showModal = useShowModal();
    const update = useUpdateSelectedDragContainer();
    const context = useContext(AppDesignerContext)
    return <LabelContainer key={propertyName} label={propertyName}
                           style={{flexDirection: 'row', alignItems: 'center'}}
                           styleLabel={{width: 65, fontSize: 13}}>
        <Button style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding:0,
        }} onClick={async () => {
            const result = await showModal<ContainerPropertyType>(closePanel => {
                return <AppDesignerContext.Provider value={context}>
                    <ComponentPropertyEditor closePanel={closePanel} name={propertyName}
                                             type={type}/>
                </AppDesignerContext.Provider>
            });
            if (result) {
                update(selectedContainer => {
                    selectedContainer.properties[propertyName] = result
                })
            }
        }}><TbCodeDots style={{fontSize:22}} /></Button>
    </LabelContainer>
}