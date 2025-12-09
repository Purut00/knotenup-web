export const validateImageFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    // Guna arrow function supaya 'reader' boleh diakses terus (closure)
    reader.onloadend = () => {
      if (!reader.result) {
        resolve(false);
        return;
      }

      // Convert result ke ArrayBuffer
      const buffer = reader.result as ArrayBuffer;
      const arr = new Uint8Array(buffer).subarray(0, 4);
      
      let header = "";
      
      // FIX DI SINI:
      // Kita tukar loop biasa kepada 'for...of'.
      // Ini menyelesaikan masalah 'possibly undefined' kerana kita akses value terus, bukan index.
      for (const byte of arr) {
        header += byte.toString(16);
      }

      // Magic numbers check
      let isValid = false;
      if (header.startsWith('89504e47')) isValid = true; // PNG
      else if (header.startsWith('ffd8ff')) isValid = true; // JPG
      else if (header.startsWith('474946')) isValid = true; // GIF
      else if (header.startsWith('52494646') && header.endsWith('57454250')) isValid = true; // WEBP

      resolve(isValid);
    };

    reader.readAsArrayBuffer(file.slice(0, 4));
  });
};