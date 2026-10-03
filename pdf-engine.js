// Credit: (hank!nd3 p4d4y41!

async function renderPdfWithEngine(arrayBuffer, container, pageNum = 1) {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const page = await pdfDoc.getPage(pageNum);

  const viewport = page.getViewport({ scale: 1.2 });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  container.innerHTML = '';
  container.appendChild(canvas);

  await page.render({ canvasContext: ctx, viewport }).promise;
  return { page, viewport, pdfDoc };
}
