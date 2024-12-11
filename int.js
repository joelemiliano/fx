document.addEventListener('DOMContentLoaded', () => {
    async function loadFXSSFiles() {
        const links = document.querySelectorAll('link[rel="fxss"][type="text/fxss"]');
        const styleElement = document.createElement('style');
        document.head.appendChild(styleElement);

        for (const link of links) {
            const response = await fetch(link.href);
            const fxssContent = await response.text();
            const cssContent = parseFXSSContent(fxssContent);
            styleElement.textContent += cssContent;
        }
    }

    function parseFXSSContent(fxssContent) {
        const lines = fxssContent.split('\n').map(line => line.trim());
        let cssContent = '';
        let currentSelector = '';
        let currentRules = '';

        lines.forEach(line => {
            if (line.startsWith('def (') && line.includes(')')) {
                if (currentSelector) {
                    cssContent += `${currentSelector} { ${currentRules} }\n`;
                }
                currentSelector = line
                    .replace('def (', '')
                    .replace(')', '')
                    .replace('>', ' ') // Reemplaza '>' con un espacio
                    .replace(/\s+/g, ' ') // Normaliza espacios múltiples
                    .trim();

                // Ordena selectores de forma canónica
                const parts = currentSelector.split(' ').sort();
                currentSelector = parts.join(' ');

                currentRules = '';
            } else if (line.startsWith('def ')) {
                if (currentSelector) {
                    cssContent += `${currentSelector} { ${currentRules} }\n`;
                }
                currentSelector = line.replace('def ', '').trim();
                currentRules = '';
            } else if (line === 'end') {
                if (currentSelector) {
                    cssContent += `${currentSelector} { ${currentRules} }\n`;
                }
                currentSelector = '';
                currentRules = '';
            } else if (currentSelector) {
                if (line.startsWith('!')) {
                    const importantRule = line.slice(1).trim() + ' !important';
                    currentRules += `${importantRule} `;
                } else {
                    currentRules += `${line} `;
                }
            }
        });

        // Handle the last block
        if (currentSelector) {
            cssContent += `${currentSelector} { ${currentRules} }\n`;
        }

        return cssContent;
    }

    loadFXSSFiles();
});
