import {Signal} from "signal-polyfill";
import {Component} from "../Component.ts";
import {notifiable} from "react-hook-signal";
import {BORDER} from "../Border.ts";
import {colors} from "../../utils/colors.ts";


export function MarginProperty(props: {
    focusedComponent: Signal.State<Component | undefined>,
    updateValue: (callback: (thisComponent: Component) => void) => void
}) {
    const {updateValue, focusedComponent} = props;
    return <div style={{display: 'flex', flexDirection: 'column', position: 'relative'}}>
        <div style={{fontStyle: 'italic', position: 'absolute', top: 5,left:10}}>Margin :</div>
        <div style={{display: 'flex', justifyContent: 'center', padding: 5}}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <notifiable.input style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}}
                                      value={() => {
                                          return focusedComponent.get()?.style.marginTop ?? 0
                                      }}
                                      onChange={(e) => {
                                          let newValue = parseInt(e.target.value);
                                          if (isNaN(newValue)) {
                                              newValue = 0
                                          }
                                          updateValue((thisComponent) => {
                                              thisComponent.style.marginTop = newValue;
                                          });
                                      }}
                    />
                </div>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <notifiable.input style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}}
                                      value={() => {
                                          return focusedComponent.get()?.style.marginLeft ?? 0
                                      }}
                                      onChange={(e) => {
                                          let newValue = parseInt(e.target.value);
                                          if (isNaN(newValue)) {
                                              newValue = 0
                                          }
                                          updateValue((thisComponent) => {
                                              thisComponent.style.marginLeft = newValue;
                                          });
                                      }}
                    />
                    <div style={{
                        flexGrow: 1,
                        backgroundColor: colors.grey,
                        margin: 5,
                        height: 50,
                        width: 50,
                        borderRadius: 5
                    }}></div>
                    <notifiable.input style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}}
                                      value={() => {
                                          return focusedComponent.get()?.style.marginRight ?? 0
                                      }}
                                      onChange={(e) => {
                                          let newValue = parseInt(e.target.value);
                                          if (isNaN(newValue)) {
                                              newValue = 0
                                          }
                                          updateValue((thisComponent) => {
                                              thisComponent.style.marginRight = newValue;
                                          });
                                      }}
                    />
                </div>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <notifiable.input
                        style={{width: '30%', padding: 5, borderRadius: 3, border: BORDER}} value={() => {
                        return focusedComponent.get()?.style.marginBottom ?? 0
                    }}
                        onChange={(e) => {
                            let newValue = parseInt(e.target.value);
                            if (isNaN(newValue)) {
                                newValue = 0
                            }
                            updateValue((thisComponent) => {
                                thisComponent.style.marginBottom = newValue;
                            });
                        }}/>
                </div>
            </div>
        </div>
    </div>;
}
