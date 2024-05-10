import {Signal} from "signal-polyfill";
import {notifiable} from "react-hook-signal";
import {colors} from "../utils/colors.ts";
import {IoEllipsisHorizontal, IoSearch} from "react-icons/io5";
import {IoIosCloseCircle} from "react-icons/io";

export function StockListHeader(props: {
    isSearchFocused: Signal.State<boolean>,
    hideSearch: Signal.State<boolean>,
    search: Signal.State<string>
}) {

    const {isSearchFocused, search, hideSearch} = props;
    return <div style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        top: 0,
        width: 'calc(100% - 15px)',
        backgroundColor: 'black',
        zIndex: 10,
    }}>
        <notifiable.div style={() => {
            const searchFocused = isSearchFocused.get();
            return {
                padding: searchFocused ? 0 : 20,
                display: 'flex',
                flexDirection: 'row',
                height: searchFocused ? 0 : 90,
                opacity: searchFocused ? 0 : 1,
                transition: 'all 300ms linear',
                overflow: 'hidden',
                background: 'black',
                zIndex: 1,
            }
        }}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 15}}>
                <div style={{fontSize: 32, fontWeight: 'bold'}}>Stocks</div>
                <div style={{fontSize: 28, fontWeight: 'bold', color: colors.grey}}>6 May</div>
            </div>
            <div style={{flexGrow: 1}}></div>
            <div style={{
                cursor: 'pointer',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                padding: 5,
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}><IoEllipsisHorizontal style={{fontSize: 22, color: 'deepskyblue'}}/></div>
        </notifiable.div>
        <notifiable.div style={() => {
            const hideSearchValue = hideSearch.get();
            return {
                display: 'flex',
                flexDirection: 'row',
                padding: '10px 0px 10px 20px',
                marginTop: hideSearchValue ? -80 : 0,
                marginBottom: 0,
                alignItems: 'center',
                overflow: 'hidden',
                opacity: hideSearchValue ? 1 : 1,
                transition: 'all 300ms linear'
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
                                  onFocus={() => isSearchFocused.set(true)}
                                  onBlur={() => isSearchFocused.set(false)}
                                  defaultValue={search.get()}
                                  onChange={(e) => search.set(e.target.value)}
                />
                <IoSearch
                    style={{position: 'absolute', top: 12, left: 10, fontSize: 22, color: 'rgba(255,255,255,0.5)'}}/>
                <IoIosCloseCircle style={{position: 'absolute', top: 12, right: 10, fontSize: 20}}
                                  onClick={() => {
                                      (document.getElementById('input')! as HTMLInputElement).value = '';
                                      search.set('')
                                  }}/>
            </div>
            <notifiable.div style={() => {
                const searchFocused = isSearchFocused.get();
                return {
                    paddingLeft:10,
                    textAlign:'left',
                    width: searchFocused ? 60 : 0,
                    opacity: searchFocused ? 1 : 0,
                    transition: 'all 300ms linear',
                    color:colors.blue,
                    fontSize: 18,
                    fontWeight:600
                }
            }}>
                Done
            </notifiable.div>
        </notifiable.div>
    </div>;
}