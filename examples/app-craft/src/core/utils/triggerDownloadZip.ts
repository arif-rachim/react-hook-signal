import JSZip from "jszip";

export const triggerDownloadZip = async (fileName: string, data: unknown) => {
    const zip = new JSZip();
    const jsonContent = JSON.stringify(data, null, 2);

    // Add the JSON file to the ZIP
    zip.file('data.json', jsonContent);

    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({type: 'blob'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `${fileName}.zip`;

    // Trigger the download
    link.click();

    // Clean up the URL object
    URL.revokeObjectURL(link.href);
};