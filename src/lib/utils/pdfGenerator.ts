import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generatePDF() {
	const content = document.querySelector('.min-h-screen');
	if (!content) return;
	try {
		const canvas = await html2canvas(content as HTMLElement, {
			scale: 2,
			useCORS: true,
			logging: false
		});

		const imgData = canvas.toDataURL('image/png');
		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4'
		});

		const imgProps = pdf.getImageProperties(imgData);
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

		pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
		pdf.save('venture-meter-results.pdf');
	} catch (error) {
		console.error('Error generating PDF:', error);
	}
} 