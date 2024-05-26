import {Signal} from "signal-polyfill";
import {Component} from "../Component.ts";
import {notifiable} from "react-hook-signal";
import {BORDER} from "../Border.ts";
import {colors} from "../../utils/colors.ts";

export function PaddingProperty(props: {
    focusedComponent: Signal.State<Component | undefined>,
    updateValue: (callback: (thisComponent: Component) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <div style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>
        <div style={{fontStyle: 'italic', position: 'absolute', top: 0, left: 5,color:'white'}}>Padding :</div>
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: 5,
            backgroundColor: colors.grey,
            borderRadius: 5
        }}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <notifiable.input
                        style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
                        return focusedComponent.get()?.style.paddingTop ?? 0
                    }}
                        onChange={(e) => {
                            let newValue = parseInt(e.target.value);
                            if (isNaN(newValue)) {
                                newValue = 0
                            }
                            updateValue((thisComponent) => {
                                thisComponent.style.paddingTop = newValue;
                            });
                        }}/>
                </div>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <notifiable.input style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}}
                                      value={() => {
                                          return focusedComponent.get()?.style.paddingLeft ?? 0
                                      }}
                                      onChange={(e) => {
                                          let newValue = parseInt(e.target.value);
                                          if (isNaN(newValue)) {
                                              newValue = 0
                                          }
                                          updateValue((thisComponent) => {
                                              thisComponent.style.paddingLeft = newValue;
                                          });
                                      }}/>
                    <div style={{flexGrow: 1, margin: 5, height: 50, width: 50, borderRadius: 5}}></div>
                    <notifiable.input style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}}
                                      value={() => {
                                          return focusedComponent.get()?.style.paddingRight ?? 0
                                      }}
                                      onChange={(e) => {
                                          let newValue = parseInt(e.target.value);
                                          if (isNaN(newValue)) {
                                              newValue = 0
                                          }
                                          updateValue((thisComponent) => {
                                              thisComponent.style.paddingRight = newValue;
                                          });
                                      }}/>
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <notifiable.input
                        style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
                        return focusedComponent.get()?.style.paddingBottom ?? 0
                    }}
                        onChange={(e) => {
                            let newValue = parseInt(e.target.value);
                            if (isNaN(newValue)) {
                                newValue = 0
                            }
                            updateValue((thisComponent) => {
                                thisComponent.style.paddingBottom = newValue;
                            });
                        }}/>
                </div>
            </div>
        </div>
    </div>;
}