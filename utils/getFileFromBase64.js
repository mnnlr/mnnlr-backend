/**
 * Converts a base64 string to a File object.
 * @param {String} base64String - The base64 string.
 * @param {String} fileName - The name for the file.
 * @returns {File} - The resulting File object.
 */

function base64StringToFile(base64String, fileName) {

    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    return new File([u8arr], fileName, { type: mime });
}

export default base64StringToFile;