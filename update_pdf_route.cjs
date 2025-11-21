const fs = require('fs');
const path = require('path');
const file = path.join('app', 'api', 'generate', 'pdf', 'route.ts');
const content = fs.readFileSync(file, 'utf8');
const normalized = content.replace(/\r\n/g, '\n');
const oldBlock = `
    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="exhibition_${exhibition.title || 'document'}.pdf"`,
      },
    })
`;
const newBlock = `
    // Ensure the filename we send in headers stays ASCII while still keeping the original title
    const titleForFilename = `exhibition_${exhibition.title || 'document'}`
    const asciiFallback = titleForFilename
      .normalize('NFKD')
      .replace(/[^\\u0000-\\u007f]/g, '')
      .replace(/[^A-Za-z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
    const safeFilename = (asciiFallback || 'exhibition_document') + '.pdf'
    const encodedFilename = encodeURIComponent(`${titleForFilename}.pdf`)

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    })
`;
if (!normalized.includes(oldBlock)) {
  throw new Error('Old block not found');
}
const updatedNormalized = normalized.replace(oldBlock, newBlock);
const final = updatedNormalized.replace(/\n/g, '\r\n');
fs.writeFileSync(file, final, 'utf8');
