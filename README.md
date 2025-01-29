# Pdf Viewer with Virtual Scrolling

**Live version:** https://pdf-viewer-virtual-scrolling.vercel.app/

Created using a custom [Virtualised List](https://github.com/alfonzodev/virtualised-list) and [pdf.js](https://github.com/mozilla/pdf.js).

After the pdf file is loaded, each page is rendered onto a canva and then it's converted to PNG to optimise performance. (One canvas per page would freeze the application).

By limiting the DOM to a maximum of 5 pages at a time, the viewer avoids freezing on larger PDFs.

The reason for chosing 5 pages is to create this type of scrolling experience:
![an example of virtual scrolling a pdf with 6 pages](https://github.com/alfonzodev/pdf-viewer-virtual-scrolling/blob/main/virtual-scroll-example.png?raw=true)

### To be Done

- Fix race conditions of rendering pdf pages when user scrolls fast. ✅
- Make preview responsive. ✅
- Add Controls:
  - Zoom In / Out. ✅
  - Page Up / Down. ✅
  - Page Number Input. ✅

### Notes

This PDF viewer is part of a larger project rather than a standalone application. Making this feature required more time and effort than expected, so I'm sharing it in case others find it helpful!
