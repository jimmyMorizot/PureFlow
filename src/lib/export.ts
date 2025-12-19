export const exportToPDF = async (elementId: string, fileName: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        // Dynamically import PDF libraries (code-split)
        const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
            import("jspdf"),
            import("html2canvas"),
        ]);

        // Prepare PDF
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pdfWidth = 210;
        const pdfHeight = 297;
        const margin = 10;
        const contentWidth = pdfWidth - (margin * 2);

        // Capture with html2canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            windowWidth: 1200, // Fixed width for consistent layout
            // This is key: capture everything even if scrolled
            scrollY: -window.scrollY,
            windowHeight: element.scrollHeight,
            onclone: (clonedDoc: Document) => {
                const clonedElement = clonedDoc.getElementById(elementId);
                if (clonedElement) {
                    clonedElement.style.opacity = "1";
                    clonedElement.style.animation = "none";
                    clonedElement.style.transition = "none";
                    clonedElement.style.padding = "20px";
                    clonedElement.style.width = "1200px";
                    // Remove scroll limits in cloning
                    clonedElement.style.overflow = "visible";
                    clonedElement.style.height = "auto";
                }
            }
        });

        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        const pageHeight = pdfHeight - (margin * 2);
        let heightLeft = imgHeight;
        let position = margin;
        let page = 1;

        // Page 1
        pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
        heightLeft -= pageHeight;

        // Subsequent pages
        while (heightLeft > 0) {
            position = (heightLeft - imgHeight) + margin;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
            heightLeft -= pageHeight;
            page++;
        }

        pdf.save(`${fileName}.pdf`);
    } catch (error) {
        console.error("Error exporting to PDF:", error);
    }
};
