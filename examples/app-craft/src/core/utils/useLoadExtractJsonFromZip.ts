import {ChangeEvent, LegacyRef, useEffect, useRef} from "react";
import JSZip from "jszip";
import {useAppContext} from "../hooks/useAppContext.ts";


export function useLoadExtractJsonFromZip() {
    const ref = useRef<HTMLInputElement>();
    const {applicationSignal} = useAppContext();
    useEffect(() => {
        const inputElement = ref.current;

        async function onChangeListener(evt: Event) {
            const event = evt as unknown as ChangeEvent<HTMLInputElement>;
            const fileInput = event.target as HTMLInputElement;
            if (fileInput.files === null || fileInput.files.length === 0) {
                return;
            }

            const file = fileInput.files[0];
            const zip = new JSZip();
            const zipContent = await zip.loadAsync(file);
            const jsonFile = zipContent.file('data.json');

            if (!jsonFile) {
                throw new Error("JSON file not found in the ZIP archive");
            }

            const jsonString = await jsonFile.async('string');

            try {
                const jsonData = JSON.parse(jsonString);
                applicationSignal.set(jsonData);

            } catch (error) {
                console.error('Failed to extract JSON from ZIP:', error);
            }
        }

        if (inputElement) {
            inputElement.addEventListener('change', onChangeListener);
        }
        return () => {
            if (inputElement) {
                inputElement.removeEventListener('change', onChangeListener);
            }
        }
    }, [applicationSignal]);

    return {ref: ref as LegacyRef<HTMLInputElement> | undefined}
}
