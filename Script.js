// Credit: (hank!nd3 p4d4y41!

// 1. Function to Process PDF Editing (Add Text / Image)
async function processPdfEdit() {
  const pdfInput = document.getElementById('pdf-input').files[0];
  const imgInput = document.getElementById('img-input').files[0];
  const textInput = document.getElementById('text-input').value;
  const status = document.getElementById('status');

  if (!pdfInput) {
    alert("Please select a PDF file first!");
    return;
  }

  status.style.color = "#d35400";
  status.innerText = "Processing PDF... Please wait...";

  try {
    const pdfBytes = await pdfInput.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const firstPage = pdfDoc.getPages()[0];

    // Add Text to Page
    if (textInput) {
      firstPage.drawText(textInput, {
        x: 50,
        y: 700,
        size: 18
      });
    }

    // Add Image to Page
    if (imgInput) {
      const imgBytes = await imgInput.arrayBuffer();
      let img;
      if (imgInput.type === 'image/jpeg') {
        img = await pdfDoc.embedJpg(imgBytes);
      } else if (imgInput.type === 'image/png') {
        img = await pdfDoc.embedPng(imgBytes);
      }

      if (img) {
        firstPage.drawImage(img, {
          x: 400,
          y: 650,
          width: 100,
          height: 100
        });
      }
    }

    // Save and Download
    const modifiedBytes = await pdfDoc.save();
    downloadBlob(modifiedBytes, 'edited_document.pdf');
    status.style.color = "#27ae60";
    status.innerText = "PDF Processed and Downloaded Successfully!";
  } catch (err) {
    console.error(err);
    status.style.color = "#c0392b";
    status.innerText = "An error occurred while processing the PDF.";
  }
}

// 2. Function to Merge Multiple PDFs
async function mergePdfs() {
  const files = document.getElementById('merge-input').files;
  const status = document.getElementById('status');

  if (files.length < 2) {
    alert("Please select at least 2 PDF files to merge!");
    return;
  }

  status.style.color = "#d35400";
  status.innerText = "Merging PDFs... Please wait...";

  try {
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
      const bytes = await files[i].arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    downloadBlob(mergedBytes, 'merged_document.pdf');
    status.style.color = "#27ae60";
    status.innerText = "PDFs Merged Successfully!";
  } catch (err) {
    console.error(err);
    status.style.color = "#c0392b";
    status.innerText = "Failed to merge PDF files.";
  }
}

// Helper Function for File Download
function downloadBlob(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
