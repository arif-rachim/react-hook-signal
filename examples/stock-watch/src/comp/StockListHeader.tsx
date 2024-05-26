import {Signal} from "signal-polyfill";
import {notifiable, useSignalEffect} from "react-hook-signal";
import {colors} from "../utils/colors.ts";
import {IoSearch} from "react-icons/io5";
import {IoIosCloseCircle} from "react-icons/io";
import {format_ddMMM} from "../utils/dateFormat.ts";
import {StockListFooter} from "./StockListFooter.tsx";

/**
 * Renders the header component for the stock list.
 */
export function StockListHeader(props: {
    isSearchFieldFocused: Signal.State<boolean>,
    isSearchHidden: Signal.State<boolean>,
    searchTerm: Signal.State<string>,
    selectedExchangeIndex: Signal.State<number>,
}) {

    const {isSearchFieldFocused, searchTerm, isSearchHidden, selectedExchangeIndex} = props;
    useSignalEffect(() => {
        const isFocused = isSearchFieldFocused.get();

        function onClick() {
            isSearchFieldFocused.set(false)
        }

        if (isFocused) {
            window.addEventListener('click', onClick)
        }
        return () => {
            window.removeEventListener('click', onClick)
        }
    })
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        top: 0,
        width: 'calc(100% - 15px)',
        backgroundColor: 'black',
        zIndex: 10,
    }} onClick={e => {
        e.preventDefault();
        e.stopPropagation();
    }}>
        <notifiable.div style={() => {
            const searchFocused = isSearchFieldFocused.get();
            return {
                padding: searchFocused ? 0 : 20,
                display: 'flex',
                flexDirection: 'row',
                height: searchFocused ? 0 : 120,
                opacity: searchFocused ? 0 : 1,
                transition: 'all 300ms linear',
                overflow: 'hidden',
                background: 'black',
                zIndex: 30,
            }
        }}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div style={{fontSize: 32, fontWeight: 'bold'}}>Stocks</div>
                <div style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: colors.grey,
                    marginTop: 15
                }}>{format_ddMMM(new Date())}</div>
                <div style={{color: colors.grey, fontSize: 12, marginTop: 10, fontStyle: 'italic'}}>The data is not
                    real. This app showcases how TC39 Signal Proposal and React can deliver high performance.
                </div>
            </div>
            <div style={{flexGrow: 1}}></div>
            {/*<div style={{*/}
            {/*    cursor: 'pointer',*/}
            {/*    backgroundColor: 'rgba(255,255,255,0.1)',*/}
            {/*    borderRadius: 20,*/}
            {/*    padding: 5,*/}
            {/*    width: 30,*/}
            {/*    height: 30,*/}
            {/*    display: 'flex',*/}
            {/*    alignItems: 'center',*/}
            {/*    justifyContent: 'center'*/}
            {/*}}><IoEllipsisHorizontal style={{fontSize: 22, color: 'deepskyblue'}}/></div>*/}
        </notifiable.div>
        <notifiable.div style={() => {
            const hideSearchValue = isSearchHidden.get();
            return {
                display: 'flex',
                flexDirection: 'row',
                padding: '10px 0px 10px 20px',
                marginTop: hideSearchValue ? -80 : 0,
                marginBottom: 0,
                alignItems: 'center',
                overflow: 'hidden',
                opacity: hideSearchValue ? 1 : 1,
                transition: 'all 300ms linear',
                zIndex: 20,
                backgroundColor: 'black'
            }
        }}>
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative'}}>
                <notifiable.input id={'input'} placeholder={'Search'} style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(0,0,0,1)',
                    padding: '10px 10px 12px 35px',
                    fontSize: 18,
                    borderRadius: 14
                }}
                                  onClick={() => isSearchFieldFocused.set(true)}
                                  defaultValue={searchTerm.get()}
                                  onChange={(e) => searchTerm.set(e.target.value)}
                />
                <IoSearch
                    style={{position: 'absolute', top: 12, left: 10, fontSize: 22, color: 'rgba(255,255,255,0.5)'}}/>
                <IoIosCloseCircle style={{position: 'absolute', top: 12, right: 10, fontSize: 20}}
                                  onClick={() => {
                                      (document.getElementById('input')! as HTMLInputElement).value = '';
                                      searchTerm.set('')
                                  }}/>
            </div>
            <notifiable.div style={() => {
                const searchFocused = isSearchFieldFocused.get();
                return {
                    paddingLeft: 10,
                    textAlign: 'left',
                    width: searchFocused ? 60 : 0,
                    opacity: searchFocused ? 1 : 0,
                    transition: 'all 300ms linear',
                    color: colors.blue,
                    fontSize: 18,
                    fontWeight: 600
                }
            }} onClick={() => isSearchFieldFocused.set(false)}>
                Done
            </notifiable.div>
        </notifiable.div>

        <notifiable.div style={() => {
            const searchFocused = isSearchFieldFocused.get();
            return {
                position: 'absolute',
                zIndex: 10,
                bottom: searchFocused ? -50 : 0,
                width: '100%',
                backgroundColor: 'black',
                transition: `all 300ms linear`
            }
        }}>
            <StockListFooter selectedExchangeIndex={selectedExchangeIndex} highlightBottom={true}/>
        </notifiable.div>
    </div>
}