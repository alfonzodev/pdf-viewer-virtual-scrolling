# Pdf Viewer with Virtual Scrolling

Created using a custom [Virtualised List](https://github.com/alfonzodev/virtualised-list) and [pdf.js](https://github.com/mozilla/pdf.js).

After the pdf file is loaded, each page is rendered onto a canva and then it's converted to PNG to optimise performance. (One canvas per page would freeze the application).

By limiting the DOM to a maximum of 5 pages at a time, the viewer avoids freezing on larger PDFs.

The reason for chosing 5 pages is to create this type of scrolling experience:
![an example of virtual scrolling a pdf with 6 pages](https://github.com/alfonzodev/pdf-viewer-virtual-scrolling/blob/main/virtual-scroll-example.png?raw=true)

### To be added

- Add initial loading screen.
- Improve responsiveness for really fast scrolling. Show a loading message and render 5 pages surrounding the user's current position in the document when he stops scrolling.
- Make preview responsive.
- Controls:
  - Zoom In / Out.
  - Page Number Input.
  - Page Up / Down.

### Notes

This PDF viewer is part of a larger project rather than a standalone application. Making this feature required more time and effort than expected, so I'm sharing it in case others find it helpful!
