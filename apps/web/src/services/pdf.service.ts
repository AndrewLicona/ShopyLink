import jsPDF from 'jspdf';
import type { Store, Product, Category } from '../types/types';
import { formatCurrency } from '../lib/utils';
import { getCurrencyForCountry } from '../lib/currency';
import { getStoreAccent, hexToRgb, mixColors, shade, tint } from '../lib/theme';

/** Alto de la banda de color con el logo y el nombre de la tienda (mm). */
const BAND_H = 34;
const CARD_RADIUS = 3;

type Rgb = [number, number, number];

export const pdfService = {
    async getImageBase64(url: string): Promise<{ data: string, format: string, width: number, height: number } | null> {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(null);

                // Fill with white background to prevent black background on transparent PNGs/SVGs in JPEG format
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                const dataURL = canvas.toDataURL('image/jpeg', 0.95);
                resolve({ data: dataURL, format: 'JPEG', width: img.width, height: img.height });
            };
            img.onerror = (error) => {
                console.error('Error loading image for PDF:', url, error);
                resolve(null);
            };
            img.src = url;
        });
    },

    async generateCatalogPDF(store: Store, products: Product[], categories: Category[]) {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const contentWidth = pageWidth - margin * 2;
        // La moneda sale del país de la tienda.
        const country = store.country;
        const currency = getCurrencyForCountry(country);

        /* ---------- Colores de la tienda ---------- */
        const accent = getStoreAccent(store.theme, store.primaryColor);
        const accentSoft = tint(accent, 0.88);   // fondo suave de tarjetas
        const accentLine = tint(accent, 0.62);   // bordes
        const accentDark = shade(accent, 0.25);  // texto de precio
        const mutedColor: Rgb = [107, 114, 128];
        const saleColor: Rgb = [225, 29, 72];
        const onAccent = isLight(accent) ? shade(accent, 0.62) : '#ffffff';

        const setFill = (hex: string) => {
            const [r, g, b] = hexToRgb(hex);
            doc.setFillColor(r, g, b);
        };
        const setText = (hex: string) => {
            const [r, g, b] = hexToRgb(hex);
            doc.setTextColor(r, g, b);
        };
        const setStroke = (hex: string) => {
            const [r, g, b] = hexToRgb(hex);
            doc.setDrawColor(r, g, b);
        };

        // Helper function to draw images proportionally
        const drawImageCentered = (imgParams: { data: string, format: string, width: number, height: number } | null | undefined, x: number, y: number, w: number, h: number) => {
            if (!imgParams || !imgParams.data) return;
            const imgRatio = imgParams.width / imgParams.height;
            const boxRatio = w / h;
            let finalW = w;
            let finalH = h;

            if (imgRatio > boxRatio) {
                finalH = w / imgRatio;
            } else {
                finalW = h * imgRatio;
            }

            const finalX = x + (w - finalW) / 2;
            const finalY = y + (h - finalH) / 2;

            try {
                doc.addImage(imgParams.data, imgParams.format, finalX, finalY, finalW, finalH);
            } catch (e) {
                console.error('Draw image error', e);
            }
        };

        // 1. Initial process: Load all images needed (Logo, All Product Images, Variant Images)
        const logoData = store.logoUrl ? await this.getImageBase64(store.logoUrl) : null;

        const processedProducts = await Promise.all(products.filter(p => p.isActive).map(async (p) => {
            // Fetch all product images
            const images = await Promise.all((p.images || []).map(url => this.getImageBase64(url)));

            // Fetch variant images
            const variants = await Promise.all((p.variants || []).map(async (v) => {
                const vImg = v.images && v.images[0] ? await this.getImageBase64(v.images[0]) : null;
                return { ...v, base64Image: vImg };
            }));

            return {
                ...p,
                processedImages: images.filter(img => img !== null) as { data: string, format: string, width: number, height: number }[],
                processedVariants: variants
            };
        }));

        const categoriesWithProducts = categories.map(cat => ({
            ...cat,
            products: processedProducts.filter(p => p.categoryId === cat.id)
        })).filter(cat => cat.products.length > 0);

        // Add Uncategorized
        const uncategorizedItems = processedProducts.filter(p => !p.categoryId);
        if (uncategorizedItems.length > 0) {
            categoriesWithProducts.push({
                id: 'none',
                name: 'Otros Productos',
                slug: 'otros',
                storeId: '',
                products: uncategorizedItems
            });
        }

        /* ---------- Banda de la tienda (se repite en cada página) ---------- */
        const drawBand = () => {
            // Degradado horizontal con el color de la tienda
            const steps = 24;
            for (let i = 0; i < steps; i++) {
                const t = i / (steps - 1);
                setFill(mixColors(accent, tint(accent, 0.42), t));
                doc.rect((pageWidth / steps) * i, 0, pageWidth / steps + 0.4, BAND_H, 'F');
            }

            // Logo en un cuadro blanco (igual que la web)
            const boxSize = 19;
            const boxY = (BAND_H - boxSize) / 2;
            doc.setFillColor(255, 255, 255);
            doc.roundedRect(margin, boxY, boxSize, boxSize, 4, 4, 'F');
            if (logoData) {
                drawImageCentered(logoData, margin + 1.6, boxY + 1.6, boxSize - 3.2, boxSize - 3.2);
            }

            // Nombre de la tienda
            setText(onAccent);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(17);
            doc.text(store.name.toUpperCase(), margin + boxSize + 5, boxY + 9);

            // Categoría y ciudad
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.text(
                [store.city, store.referenceLocation].filter(Boolean).join(' · ') || 'Catálogo de productos',
                margin + boxSize + 5,
                boxY + 14.5
            );

            // Lado derecho: la moneda con la que se muestran los precios
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(`PRECIOS EN ${currency.code}`, pageWidth - margin, boxY + 9, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text('Catálogo digital', pageWidth - margin, boxY + 14.5, { align: 'right' });
        };

        let currentY = 0;
        let firstPage = true;

        for (const category of categoriesWithProducts) {
            if (!firstPage) {
                doc.addPage();
            }
            firstPage = false;

            drawBand();

            /* ---------- Título de la categoría ---------- */
            currentY = BAND_H + 8;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            setText(accentDark);
            doc.text(category.name.toUpperCase(), margin, currentY);
            const titleW = doc.getTextWidth(category.name.toUpperCase());
            setFill(accent);
            doc.rect(margin, currentY + 2, Math.min(titleW + 4, contentWidth), 1.2, 'F');
            currentY += 12;

            // 2nd Step: Draw products
            const colWidth = (contentWidth - 8) / 2;
            let col = 0;

            for (const product of category.products) {
                // Height calculation: variants in 2 columns inside card
                const varCount = product.processedVariants.length;
                const rowsOfVariants = Math.ceil(varCount / 2);
                const cardHeight = 90 + (varCount > 0 ? (rowsOfVariants * 15) + 5 : 0);

                // Page break detection
                if (currentY + cardHeight > pageHeight - 22) {
                    doc.addPage();
                    drawBand();
                    currentY = BAND_H + 10;
                    col = 0;
                }

                const x = margin + (col * (colWidth + 8));

                // Product Card Border
                setStroke(accentLine);
                setFill('#ffffff');
                doc.roundedRect(x, currentY, colWidth, cardHeight - 5, CARD_RADIUS, CARD_RADIUS, 'FD');

                // Franja superior con el color de la tienda
                setFill(accent);
                doc.roundedRect(x, currentY, colWidth, 4, CARD_RADIUS, CARD_RADIUS, 'F');
                doc.rect(x, currentY + 2, colWidth, 2, 'F');

                // Gallery / Main Image
                if (product.processedImages.length > 0 && product.processedImages[0]) {
                    drawImageCentered(product.processedImages[0], x + 5, currentY + 9, colWidth - 10, 48);
                } else {
                    setFill(accentSoft);
                    doc.rect(x + 5, currentY + 9, colWidth - 10, 48, 'F');
                }

                // SALE Circle
                if (product.discountPrice) {
                    const pct = Math.round((1 - (Number(product.discountPrice) / Number(product.price))) * 100);
                    doc.setFillColor(saleColor[0], saleColor[1], saleColor[2]);
                    doc.ellipse(x + colWidth - 12, currentY + 14, 8, 8, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`-${pct}%`, x + colWidth - 12, currentY + 14.5, { align: 'center' });
                }

                // Big Price at top
                setText(accentDark);
                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');
                const currentPrice = product.discountPrice || product.price || 0;
                doc.text(formatCurrency(Number(currentPrice), country), x + 5, currentY + 67);

                // Old Price cross-out
                if (product.discountPrice) {
                    doc.setFontSize(8);
                    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
                    const oldP = formatCurrency(Number(product.price), country);
                    const priceWidth = doc.getTextWidth(formatCurrency(Number(currentPrice), country));
                    doc.text(oldP, x + 5 + priceWidth + 5, currentY + 67);
                    const oldW = doc.getTextWidth(oldP);
                    doc.setDrawColor(mutedColor[0], mutedColor[1], mutedColor[2]);
                    doc.line(x + 5 + priceWidth + 5, currentY + 66, x + 5 + priceWidth + 5 + oldW, currentY + 66);
                }

                // Product Name
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                setText('#111827');
                const nameLines = doc.splitTextToSize(product.name, colWidth - 10);
                doc.text(nameLines[0], x + 5, currentY + 74);

                // Small Description
                if (product.description) {
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'normal');
                    setText('#9ca3af');
                    const descLines = doc.splitTextToSize(product.description.replace(/\n/g, ' '), colWidth - 10);
                    doc.text(descLines.slice(0, 2), x + 5, currentY + 79);
                }

                // Variants detailed list in 2 columns inside the card
                if (product.processedVariants.length > 0) {
                    // Thin subtle divider
                    setStroke(accentLine);
                    doc.line(x + 5, currentY + 85, x + colWidth - 5, currentY + 85);

                    let vY = currentY + 92;
                    let vCol = 0;
                    const vColW = (colWidth - 10) / 2;

                    product.processedVariants.slice(0, 6).forEach((v) => {
                        const vx = x + 5 + (vCol * vColW);

                        // Bullet point / dot instead of image for cleaner look like reference
                        setFill(accent);
                        doc.circle(vx + 1, vY - 2, 1.5, 'F');

                        doc.setFontSize(7);
                        doc.setFont('helvetica', 'normal');
                        setText('#6b7280');
                        doc.text(v.name.substring(0, 16), vx + 4, vY);

                        const vP = v.useParentPrice ? (product.discountPrice || product.price) : v.price;
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'bold');
                        setText(accentDark);
                        doc.text(formatCurrency(Number(vP), country), vx + 4, vY + 4);

                        if (vCol === 1) {
                            vCol = 0;
                            vY += 14;
                        } else {
                            vCol = 1;
                        }
                    });
                }

                // Move to next column/row
                if (col === 1) {
                    col = 0;
                    currentY += cardHeight;
                } else {
                    col = 1;
                }
            }
            if (col === 1) currentY += 100;
        }

        // Footer
        // jsPDF does not expose getNumberOfPages() in its public typings.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalPgs = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPgs; i++) {
            doc.setPage(i);
            setStroke(accentLine);
            doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            setText('#9ca3af');
            const contact = [store.whatsappNumber, store.referenceLocation].filter(Boolean).join('  ·  ');
            if (contact) doc.text(contact, margin, pageHeight - 7);

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            setText(accentDark);
            doc.text(`${store.name.toUpperCase()} · ${i} / ${totalPgs}`, pageWidth - margin, pageHeight - 7, {
                align: 'right',
            });
        }

        doc.save(`${store.slug}-catalogo.pdf`);
    }
};

/** Un color claro necesita texto oscuro encima. */
function isLight(hex: string): boolean {
    const [r, g, b] = hexToRgb(hex);
    // luminancia relativa aproximada
    return (0.299 * r + 0.587 * g + 0.114 * b) > 170;
}
