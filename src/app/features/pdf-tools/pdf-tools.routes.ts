import { Routes } from '@angular/router';

export const PDF_ROUTES: Routes = [
  {
    path: 'convert',
    children: [
      {
        path: 'to-excel',
        loadComponent: () =>
          import('./convert-from-pdf/pdf-to-excel/pdf-to-excel.component').then(
            (m) => m.PdfToExcelComponent
          ),
      },
      {
        path: 'to-jpg',
        loadComponent: () =>
          import('./convert-from-pdf/pdf-to-jpg/pdf-to-jpg.component').then(
            (m) => m.PdfToJpgComponent
          ),
      },
      // Thêm các routes khác cho PDF conversion
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./pdf-tools-home/pdf-tools-home.component').then(
        (m) => m.PdfToolsHomeComponent
      ),
  },
];
