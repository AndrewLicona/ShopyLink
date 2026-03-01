import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Store, Product, Category } from '../types/types';
import { formatCurrency } from '../lib/utils';

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
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        // Colors
        const primaryColor = [37, 99, 235] as const; // Default Blue
        const secondaryColor = [243, 244, 246] as const;
        const textColor = [17, 24, 39] as const;
        const accentColor = [220, 38, 38] as const; // For Sales

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
                products: uncategorizedItems
            } as any);
        }

        let firstPage = true;
        let currentY = 0;

        for (const category of categoriesWithProducts) {
            if (!firstPage) doc.addPage();
            firstPage = false;

            // 2. Page Header - Clean & Minimalist
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, pageWidth, 40, 'F');

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

            // Logo and Store Name
            if (logoData) {
                drawImageCentered(logoData, margin, 8, 28, 28);

                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                doc.setFontSize(22);
                doc.setFont('helvetica', 'bold');
                doc.text(store.name.toUpperCase(), margin + 30, 25);
            } else {
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                doc.setFontSize(24);
                doc.setFont('helvetica', 'bold');
                doc.text(store.name.toUpperCase(), margin, 25);
            }

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'normal');
            doc.text(`CATÁLOGO DE ${category.name.toUpperCase()}`, pageWidth - margin, 25, { align: 'right' });

            // Thin separator line
            doc.setDrawColor(230, 230, 230);
            doc.line(margin, 40, pageWidth - margin, 40);

            currentY = 50;

            // 2nd Step: Draw products
            const colWidth = (contentWidth - 10) / 2;
            let col = 0;

            for (const product of category.products) {
                // Height calculation: variants in 2 columns inside card
                const varCount = product.processedVariants.length;
                const rowsOfVariants = Math.ceil(varCount / 2);
                const cardHeight = 90 + (varCount > 0 ? (rowsOfVariants * 15) + 5 : 0);

                // Page break detection
                if (currentY + cardHeight > pageHeight - 25) {
                    doc.addPage();
                    currentY = 20;
                    col = 0;
                }

                const x = margin + (col * (colWidth + 10));

                // Product Card Border
                doc.setDrawColor(230, 230, 230);
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(x, currentY, colWidth, cardHeight - 5, 3, 3, 'FD');

                // Gallery / Main Image
                if (product.processedImages.length > 0 && product.processedImages[0]) {
                    drawImageCentered(product.processedImages[0], x + 5, currentY + 5, colWidth - 10, 50);
                } else {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(x + 5, currentY + 5, colWidth - 10, 50, 'F');
                }

                // SALE Circle
                if (product.discountPrice) {
                    const pct = Math.round((1 - (Number(product.discountPrice) / Number(product.price))) * 100);
                    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
                    doc.ellipse(x + colWidth - 12, currentY + 12, 10, 10, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`-${pct}%`, x + colWidth - 12, currentY + 13, { align: 'center' });
                }

                // Big Price at top
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');
                const currentPrice = product.discountPrice || product.price || 0;
                doc.text(formatCurrency(Number(currentPrice)), x + 5, currentY + 65);

                // Old Price cross-out
                if (product.discountPrice) {
                    doc.setFontSize(8);
                    doc.setTextColor(180, 180, 180);
                    const oldP = formatCurrency(Number(product.price));
                    const priceWidth = doc.getTextWidth(formatCurrency(Number(currentPrice)));
                    doc.text(oldP, x + 5 + priceWidth + 5, currentY + 65);
                    const oldW = doc.getTextWidth(oldP);
                    doc.line(x + 5 + priceWidth + 5, currentY + 64, x + 5 + priceWidth + 5 + oldW, currentY + 64);
                }

                // Product Name
                doc.setTextColor(80, 80, 80);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                const nameLines = doc.splitTextToSize(product.name, colWidth - 10);
                doc.text(nameLines[0], x + 5, currentY + 72);

                // Small Description
                if (product.description) {
                    doc.setTextColor(160, 160, 160);
                    doc.setFontSize(7);
                    const descLines = doc.splitTextToSize(product.description.replace(/\n/g, ' '), colWidth - 10);
                    doc.text(descLines.slice(0, 2), x + 5, currentY + 77);
                }

                // Variants detailed list in 2 columns inside the card
                if (product.processedVariants.length > 0) {
                    // Thin subtle divider
                    doc.setDrawColor(240, 240, 240);
                    doc.line(x + 5, currentY + 85, x + colWidth - 5, currentY + 85);

                    let vY = currentY + 92;
                    let vCol = 0;
                    const vColW = (colWidth - 10) / 2;

                    product.processedVariants.slice(0, 6).forEach((v) => {
                        const vx = x + 5 + (vCol * vColW);

                        // Bullet point / dot instead of image for cleaner look like reference
                        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
                        doc.circle(vx + 1, vY - 2, 1.5, 'F');

                        doc.setTextColor(100, 100, 100);
                        doc.setFontSize(7);
                        doc.setFont('helvetica', 'normal');
                        doc.text(v.name.substring(0, 16), vx + 4, vY);

                        const vP = v.useParentPrice ? (product.discountPrice || product.price) : v.price;
                        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'bold');
                        doc.text(formatCurrency(Number(vP)), vx + 4, vY + 4);

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

        // Clean Footer
        const totalPgs = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPgs; i++) {
            doc.setPage(i);
            doc.setDrawColor(240, 240, 240);
            doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(8);
            doc.text(`${store.name.toUpperCase()} - PÁGINA ${i} DE ${totalPgs}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        }

        doc.save(`${store.slug}-catalogo.pdf`);
    }
};
