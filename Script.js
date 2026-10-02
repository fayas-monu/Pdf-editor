// Credit: (hank!nd3 p4d4y41!

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

let currentPdfBytes = null;
let pdfDocObject = null;

// Handle PDF Selection & Live Preview Rendering
document.getElementById('pdf-input').addEventListener('change', async function(e) {
  const file = e.target.files[0];
  const status = document.getElementById('status');

  if (!file) return;

  status.style.color = "#d35400";
  status.innerText = "Loading PDF preview...";

  try {
    currentPdfBytes = await file.arrayBuffer();
    renderPdfPreview(currentPdfBytes);
    status.style.color = "#27ae60";
    status.innerText = "PDF Loaded Successfully!";
  } catch (err) {
    console.error(err);
    status.style.color = "#c0392b";
    status.innerText = "Failed to load PDF file.";
  }
});

// Render Page Preview onto Canvas using PDF.js
async function renderPdfPreview(pdfData) {
  const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  pdfDocObject = await loadingTask.promise;
  
  // Render First Page
  const page = await pdfDocObject.getPage(1);
  const viewport = page.getViewport({ scale: 1.2 });

  const canvas = document.getElementById('pdf-canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };

  await page.render(renderContext).promise;
}

// Process Changes & Download Modified PDF
async function applyAndDownload() {
  const status = document.getElementById('status');
  const textInput = document.getElementById('text-input').value;
  const imgInput = document.getElementById('img-input').files[0];

  if (!currentPdfBytes) {
    alert("Please select a PDF file first!");
    return;
  }

  status.style.color = "#d35400";
  status.innerText = "Generating updated PDF...";

  try {
    const pdfDoc = await PDFLib.PDFDocument.load(currentPdfBytes);
    const firstPage = pdfDoc.getPages()[0];

    // Overlay Text
    if (textInput) {
      firstPage.drawText(textInput, {
        x: 50,
        y: 700,
        size: 20,
        color: PDFLib.rgb(0, 0, 0)
      });
    }

    // Embed Image/Photo
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

    const modifiedBytes = await pdfDoc.save();
    
    // Update live preview with new PDF
    await renderPdfPreview(modifiedBytes);

    // Trigger Download
    downloadBlob(modifiedBytes, 'edited_document.pdf');
    status.style.color = "#27ae60";
    status.innerText = "Downloaded Successfully!";

  } catch (err) {
    console.error(err);
    status.style.color = "#c0392b";
    status.innerText = "Error exporting PDF.";
  }
}

// File Download Helper
function downloadBlob(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
