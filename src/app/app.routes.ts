import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home-page/home-page.component').then(
        (m) => m.HomePageComponent
      ),
  },
  {
    path: 'features',
    children: [
      {
        path: 'sitemap',
        loadComponent: () =>
          import('./features/sitemap/sitemap.component').then(
            (m) => m.SitemapComponent
          ),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/about.component').then(
            (m) => m.AboutComponent
          ),
      },
      {
        path: 'about-us',
        loadComponent: () =>
          import('./features/about-us/about-us.component').then(
            (m) => m.AboutUsComponent
          ),
      },
      {
        path: 'privacy-policy',
        loadComponent: () =>
          import('./features/privacy-policy/privacy-policy.component').then(
            (m) => m.PrivacyPolicyComponent
          ),
      },
      {
        path: 'terms-of-service',
        loadComponent: () =>
          import('./features/terms-of-service/terms-of-service.component').then(
            (m) => m.TermsOfServiceComponent
          ),
      },
      {
        path: 'pdf-tools',
        children: [
          {
            path: 'convert-from-pdf',
            children: [
              {
                path: 'pdf-to-word',
                loadComponent: () =>
                  import(
                    './features/pdf-tools/convert-from-pdf/pdf-to-word/pdf-to-word.component'
                  ).then((m) => m.PdfToWordComponent),
              },
              {
                path: 'pdf-to-excel',
                loadComponent: () =>
                  import(
                    './features/pdf-tools/convert-from-pdf/pdf-to-excel/pdf-to-excel.component'
                  ).then((m) => m.PdfToExcelComponent),
              },
            ],
          },
          {
            path: 'convert-to-pdf',
            children: [
              {
                path: 'word-to-pdf',
                loadComponent: () =>
                  import(
                    './features/pdf-tools/convert-to-pdf/word-to-pdf/word-to-pdf.component'
                  ).then((m) => m.WordToPdfComponent),
              },
              {
                path: 'excel-to-pdf',
                loadComponent: () =>
                  import(
                    './features/pdf-tools/convert-to-pdf/excel-to-pdf/excel-to-pdf.component'
                  ).then((m) => m.ExcelToPdfComponent),
              },
            ],
          },
          {
            path: 'organize',
            children: [
              {
                path: 'compress-pdf',
                loadComponent: () =>
                  import(
                    './features/pdf-tools/organize/compress-pdf/compress-pdf.component'
                  ).then((m) => m.CompressPdfComponent),
              },
              {
                path: 'split-pdf',
                loadComponent: () =>
                  import(
                    './features/pdf-tools/organize/split-pdf/split-pdf.component'
                  ).then((m) => m.SplitPdfComponent),
              },
              {
                path: 'merge-pdf',
                loadComponent: () =>
                  import(
                    './features/pdf-tools/organize/merge-pdf/merge-pdf.component'
                  ).then((m) => m.MergePdfComponent),
              },
            ],
          },
        ],
      },
      {
        path: 'all-tools',
        loadComponent: () =>
          import('./features/all-tools/all-tools.component').then(
            (m) => m.AllToolsComponent
          ),
      },
      {
        path: 'account',
        children: [
          {
            path: 'profile',
            loadComponent: () =>
              import('./features/account/profile/profile.component').then(
                (m) => m.ProfileComponent
              ),
          },
        ],
      },
      {
        path: 'authentication',
        children: [
          {
            path: 'login',
            loadComponent: () =>
              import('./features/authentication/login/login.component').then(
                (m) => m.LoginComponent
              ),
          },
          {
            path: 'register',
            loadComponent: () =>
              import(
                './features/authentication/register/register.component'
              ).then((m) => m.RegisterComponent),
          },
          {
            path: 'complete-gmail-registration',
            loadComponent: () =>
              import(
                './features/authentication/complete-gmail-registration/complete-gmail-registration.component'
              ).then((m) => m.CompleteGmailRegistrationComponent),
          },
          {
            path: 'forgot-password',
            loadComponent: () =>
              import(
                './features/authentication/forgot-password/forgot-password.component'
              ).then((m) => m.ForgotPasswordComponent),
          },
        ],
      },
      {
        path: 'image-tools',
        children: [
          {
            path: 'convert',
            children: [
              {
                path: 'image-converter',
                loadComponent: () =>
                  import(
                    './features/image-tools/convert/image-converter/image-converter.component'
                  ).then((m) => m.ImageConverterComponent),
              },
            ],
          },
          {
            path: 'edit',
            children: [
              {
                path: 'compress-image',
                loadComponent: () =>
                  import(
                    './features/image-tools/edit/compress-image/compress-image.component'
                  ).then((m) => m.CompressImageComponent),
              },
              {
                path: 'read-image-exif',
                loadComponent: () =>
                  import(
                    './features/image-tools/edit/read-image-exif/read-image-exif.component'
                  ).then((m) => m.ReadImageExifComponent),
              },
              {
                path: 'crop-image',
                loadComponent: () =>
                  import(
                    './features/image-tools/edit/crop-image/crop-image.component'
                  ).then((m) => m.CropImageComponent),
              },
              // {
              //   path: 'frame-image',
              //   loadComponent: () =>
              //     import(
              //       './features/image-tools/edit/frame-image/frame-image.component'
              //     ).then((m) => m.FrameImageComponent),
              // },
            ],
          },
        ],
      },
      {
        path: 'other-tools',
        children: [
          {
            path: 'generate-tools',
            children: [
              {
                path: 'password-generator',
                loadComponent: () =>
                  import(
                    './features/other-tools/generate-tools/password-generator/password-generator.component'
                  ).then((m) => m.PasswordGeneratorComponent),
              },
              {
                path: 'lorem-ipsum',
                loadComponent: () =>
                  import(
                    './features/other-tools/generate-tools/lorem-ipsum/lorem-ipsum.component'
                  ).then((m) => m.LoremIpsumComponent),
              },
            ],
          },
          {
            path: 'javascript-tools',
            children: [
              {
                path: 'json-to-csv',
                loadComponent: () =>
                  import(
                    './features/other-tools/javascript-tools/json-to-csv/json-to-csv.component'
                  ).then((m) => m.JsonToCsvComponent),
              },
              {
                path: 'csv-to-json',
                loadComponent: () =>
                  import(
                    './features/other-tools/javascript-tools/csv-to-json/csv-to-json.component'
                  ).then((m) => m.CsvToJsonComponent),
              },
            ],
          },
          {
            path: 'mathematics-tools',
            children: [
              {
                path: 'numerical-analysis',
                loadComponent: () =>
                  import(
                    './features/other-tools/mathematics-tools/numerical-analysis/numerical-analysis.component'
                  ).then((m) => m.NumericalAnalysisComponent),
              },
            ],
          },
        ],
      },
    ],
  },
];
