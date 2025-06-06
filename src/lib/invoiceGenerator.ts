
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { InvoiceData } from './types';
import { format } from 'date-fns';

export function generateInvoicePdf(invoiceData: InvoiceData) {
  const doc = new jsPDF();

  // --- Document Settings ---
  const FONT_SIZE_NORMAL = 10;
  const FONT_SIZE_LARGE = 16;
  const FONT_SIZE_SMALL = 8;
  const MARGIN = 15;
  const LINE_HEIGHT = 7;
  const LOGO_WIDTH = 40;
  const LOGO_HEIGHT = 15; // Adjust as per your logo's aspect ratio

  // --- Header ---
  // Company Logo (if URL provided)
  // Note: For external URLs, jsPDF might struggle due to CORS.
  // It's often better to convert the image to a Base64 Data URL beforehand
  // or ensure your image hosting allows cross-origin access.
  // For simplicity, this is a placeholder.
  if (invoiceData.companyLogoUrl) {
    try {
      // Example: doc.addImage(invoiceData.companyLogoUrl, 'PNG', MARGIN, MARGIN, LOGO_WIDTH, LOGO_HEIGHT);
      // This line is commented out as direct URL adding can be unreliable.
      // You would typically load the image first and then add it, or use a data URL.
      doc.setFontSize(FONT_SIZE_SMALL);
      doc.text("[Your Logo Here]", MARGIN, MARGIN + LOGO_HEIGHT / 2, { baseline: 'middle' });
    } catch (e) {
      // console.error("Error adding logo image:", e);
      doc.setFontSize(FONT_SIZE_SMALL);
      doc.text("[Logo Placeholder]", MARGIN, MARGIN + LOGO_HEIGHT / 2, { baseline: 'middle' });
    }
  } else {
    doc.setFontSize(FONT_SIZE_SMALL);
    doc.text("[Your Logo Here]", MARGIN, MARGIN + LOGO_HEIGHT / 2, { baseline: 'middle' });
  }

  // Company Name (Your Company)
  doc.setFontSize(FONT_SIZE_LARGE);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.companyName, MARGIN, MARGIN + LOGO_HEIGHT + 5); // Positioned below logo area

  doc.setFontSize(FONT_SIZE_SMALL);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.companyAddress, MARGIN, MARGIN + LOGO_HEIGHT + 10);
  doc.text(invoiceData.companyContact, MARGIN, MARGIN + LOGO_HEIGHT + 14);

  // Invoice Title
  doc.setFontSize(FONT_SIZE_LARGE);
  doc.setFont('helvetica', 'bold');
  doc.text("INVOICE", doc.internal.pageSize.getWidth() - MARGIN, MARGIN + 5, { align: 'right' });

  // Invoice Details (Number, Date)
  doc.setFontSize(FONT_SIZE_NORMAL);
  doc.setFont('helvetica', 'normal');
  let detailsY = MARGIN + 12;
  doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, doc.internal.pageSize.getWidth() - MARGIN, detailsY, { align: 'right' });
  detailsY += LINE_HEIGHT / 2;
  doc.text(`Date: ${invoiceData.invoiceDate}`, doc.internal.pageSize.getWidth() - MARGIN, detailsY, { align: 'right' });
  detailsY += LINE_HEIGHT / 2;
  doc.text(`Payment ID: ${invoiceData.paymentId}`, doc.internal.pageSize.getWidth() - MARGIN, detailsY, { align: 'right' });


  // --- Bill To Section ---
  let billToY = MARGIN + LOGO_HEIGHT + 25; // Adjusted for logo space
  doc.setFontSize(FONT_SIZE_NORMAL);
  doc.setFont('helvetica', 'bold');
  doc.text("Bill To:", MARGIN, billToY);
  billToY += LINE_HEIGHT / 2;
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.userName, MARGIN, billToY);
  billToY += LINE_HEIGHT / 2;
  doc.text(invoiceData.userEmail, MARGIN, billToY);

  // --- Line Items Table ---
  const tableStartY = billToY + LINE_HEIGHT * 2;
  autoTable(doc, {
    startY: tableStartY,
    head: [['Description', 'Quantity', 'Unit Price', 'Amount (INR)']],
    body: [
      [
        invoiceData.planName,
        1,
        invoiceData.planPrice.toFixed(2),
        invoiceData.planPrice.toFixed(2)
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: [63, 81, 181] }, 
    styles: { fontSize: FONT_SIZE_NORMAL -1, cellPadding: 2.5 },
    columnStyles: {
        3: { halign: 'right' },
        1: { halign: 'center'},
        2: { halign: 'right'},
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // --- Totals ---
  const totalsX = doc.internal.pageSize.getWidth() - MARGIN - 60; 
  let totalsY = finalY + LINE_HEIGHT * 1.5;

  doc.setFontSize(FONT_SIZE_NORMAL);
  doc.setFont('helvetica', 'bold');
  doc.text("Subtotal:", totalsX, totalsY);
  doc.text(`${invoiceData.planPrice.toFixed(2)}`, doc.internal.pageSize.getWidth() - MARGIN, totalsY, { align: 'right'});
  totalsY += LINE_HEIGHT;

  doc.setFont('helvetica', 'bold');
  doc.text("Total Amount:", totalsX, totalsY);
  doc.text(`₹${invoiceData.planPrice.toFixed(2)}`, doc.internal.pageSize.getWidth() - MARGIN, totalsY, { align: 'right'});

  // --- Footer Notes & Signature ---
  let footerY = doc.internal.pageSize.getHeight() - MARGIN - 20;
  doc.setFontSize(FONT_SIZE_SMALL);
  doc.setFont('helvetica', 'italic');
  doc.text("Thank you for your business!", MARGIN, footerY);
  footerY += LINE_HEIGHT / 2;
  doc.text("This is a computer-generated invoice and does not require a physical signature.", MARGIN, footerY);
  
  // --- Save PDF ---
  doc.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
}
