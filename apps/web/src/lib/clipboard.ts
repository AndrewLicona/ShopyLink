
/**
 * Copia texto al portapapeles de forma robusta, compatible con contextos no seguros (HTTP)
 * y navegadores que no soportan navigator.clipboard.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (!text) return false;

    // Intento 1: API moderna (solo en contextos seguros)
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('navigator.clipboard failed, trying fallback...', err);
        }
    }

    // Intento 2: Fallback clásico (execCommand)
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Asegurar que no sea visible pero esté en el DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) return true;
    } catch (err) {
        console.error('execCommand fallback failed:', err);
    }

    return false;
}

