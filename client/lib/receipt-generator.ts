import jsPDF from "jspdf";
import "jspdf-autotable";
import { Fee } from "@shared/api";

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateReceipt = (fee: Fee) => {
  const doc = new jsPDF();
  
  // School header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("DARUL UMMAH SCHOOL", 105, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("School Management System", 105, 30, { align: "center" });
  
  // Receipt title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", 105, 45, { align: "center" });
  
  // Receipt details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const receiptData = [
    ["Receipt No:", `REC-${fee.id.slice(-8).toUpperCase()}`],
    ["Date:", new Date().toLocaleDateString()],
    ["Student ID:", fee.student.studentId],
    ["Student Name:", fee.student.name],
    ["Class:", fee.student.className],
    ["Academic Year:", fee.academicYear.name],
    ["Fee Type:", fee.feeType.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())],
    ["Amount:", `$${fee.amount.toLocaleString()}`],
    ["Due Date:", new Date(fee.dueDate).toLocaleDateString()],
    ["Payment Date:", fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : "N/A"],
    ["Status:", fee.status],
  ];
  
  // Add receipt details table
  doc.autoTable({
    startY: 55,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: "bold",
    },
    body: receiptData.map(([label, value]) => [label, value]),
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      1: { cellWidth: 60 },
    },
    margin: { left: 20, right: 20 },
  });
  
  // Payment confirmation
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT CONFIRMED", 105, doc.lastAutoTable.finalY + 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("This receipt confirms that the above payment has been received and processed.", 105, doc.lastAutoTable.finalY + 30, { align: "center" });
  
  // Notes section
  if (fee.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Notes:", 20, doc.lastAutoTable.finalY + 50);
    doc.text(fee.notes, 20, doc.lastAutoTable.finalY + 60);
  }
  
  // Footer
  const footerY = 280;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("This is a computer-generated receipt.", 105, footerY, { align: "center" });
  doc.text("For any queries, please contact the school administration.", 105, footerY + 5, { align: "center" });
  
  // Signature area
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Authorized by:", 20, footerY - 20);
  doc.text("_________________________", 20, footerY - 10);
  doc.text("School Administrator", 20, footerY - 5);
  
  // Save the PDF
  doc.save(`receipt-${fee.student.studentId}-${fee.id.slice(-8)}.pdf`);
};

export const printReceipt = (fee: Fee) => {
  const doc = new jsPDF();
  
  // School header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("DARUL UMMAH SCHOOL", 105, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("School Management System", 105, 30, { align: "center" });
  
  // Receipt title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", 105, 45, { align: "center" });
  
  // Receipt details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const receiptData = [
    ["Receipt No:", `REC-${fee.id.slice(-8).toUpperCase()}`],
    ["Date:", new Date().toLocaleDateString()],
    ["Student ID:", fee.student.studentId],
    ["Student Name:", fee.student.name],
    ["Class:", fee.student.className],
    ["Academic Year:", fee.academicYear.name],
    ["Fee Type:", fee.feeType.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())],
    ["Amount:", `$${fee.amount.toLocaleString()}`],
    ["Due Date:", new Date(fee.dueDate).toLocaleDateString()],
    ["Payment Date:", fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : "N/A"],
    ["Status:", fee.status],
  ];
  
  // Add receipt details table
  doc.autoTable({
    startY: 55,
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: "bold",
    },
    body: receiptData.map(([label, value]) => [label, value]),
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      1: { cellWidth: 60 },
    },
    margin: { left: 20, right: 20 },
  });
  
  // Payment confirmation
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT CONFIRMED", 105, doc.lastAutoTable.finalY + 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("This receipt confirms that the above payment has been received and processed.", 105, doc.lastAutoTable.finalY + 30, { align: "center" });
  
  // Notes section
  if (fee.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Notes:", 20, doc.lastAutoTable.finalY + 50);
    doc.text(fee.notes, 20, doc.lastAutoTable.finalY + 60);
  }
  
  // Footer
  const footerY = 280;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("This is a computer-generated receipt.", 105, footerY, { align: "center" });
  doc.text("For any queries, please contact the school administration.", 105, footerY + 5, { align: "center" });
  
  // Signature area
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Authorized by:", 20, footerY - 20);
  doc.text("_________________________", 20, footerY - 10);
  doc.text("School Administrator", 20, footerY - 5);
  
  // Open in new window for printing
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(pdfUrl, "_blank");
  
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
