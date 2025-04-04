import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface SimpleLink {
  title: string;
  url: string;
}

interface NestedLink {
  title: string;
  links: SimpleLink[];
}

type SectionLink = SimpleLink | NestedLink;

interface SiteMapSection {
  title: string;
  links: SectionLink[];
}

@Component({
  selector: 'app-sitemap',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.css'],
})
export class SitemapComponent {
  // Define site structure for the sitemap
  siteMap: SiteMapSection[] = [
    {
      title: 'Main Pages',
      links: [
        { title: 'Home', url: '/' },
        { title: 'All Tools', url: '/features/all-tools' },
        { title: 'About Us', url: '/features/about-us' },
        { title: 'Privacy Policy', url: '/features/privacy-policy' },
        { title: 'Terms of Service', url: '/features/terms-of-service' },
      ],
    },
    {
      title: 'PDF Tools',
      links: [
        {
          title: 'Convert from PDF',
          links: [
            {
              title: 'PDF to Word',
              url: '/features/pdf-tools/convert-from-pdf/pdf-to-word',
            },
            {
              title: 'PDF to Excel',
              url: '/features/pdf-tools/convert-from-pdf/pdf-to-excel',
            },
          ],
        },
        {
          title: 'Convert to PDF',
          links: [
            {
              title: 'Word to PDF',
              url: '/features/pdf-tools/convert-to-pdf/word-to-pdf',
            },
            {
              title: 'Excel to PDF',
              url: '/features/pdf-tools/convert-to-pdf/excel-to-pdf',
            },
          ],
        },
        {
          title: 'Organize PDF',
          links: [
            {
              title: 'Compress PDF',
              url: '/features/pdf-tools/organize/compress-pdf',
            },
            {
              title: 'Split PDF',
              url: '/features/pdf-tools/organize/split-pdf',
            },
            {
              title: 'Merge PDF',
              url: '/features/pdf-tools/organize/merge-pdf',
            },
          ],
        },
      ],
    },
    {
      title: 'Image Tools',
      links: [
        {
          title: 'Convert',
          links: [
            {
              title: 'Image Converter',
              url: '/features/image-tools/convert/image-converter',
            },
          ],
        },
        {
          title: 'Edit',
          links: [
            {
              title: 'Compress Image',
              url: '/features/image-tools/edit/compress-image',
            },
            {
              title: 'Read Image EXIF',
              url: '/features/image-tools/edit/read-image-exif',
            },
            {
              title: 'Crop Image',
              url: '/features/image-tools/edit/crop-image',
            },
          ],
        },
      ],
    },
    {
      title: 'Other Tools',
      links: [
        {
          title: 'Generate Tools',
          links: [
            {
              title: 'Password Generator',
              url: '/features/other-tools/generate-tools/password-generator',
            },
            {
              title: 'Lorem Ipsum',
              url: '/features/other-tools/generate-tools/lorem-ipsum',
            },
          ],
        },
        {
          title: 'JavaScript Tools',
          links: [
            {
              title: 'JSON to CSV',
              url: '/features/other-tools/javascript-tools/json-to-csv',
            },
            {
              title: 'CSV to JSON',
              url: '/features/other-tools/javascript-tools/csv-to-json',
            },
          ],
        },
        {
          title: 'Mathematics Tools',
          links: [
            {
              title: 'Numerical Analysis',
              url: '/features/other-tools/mathematics-tools/numerical-analysis',
            },
          ],
        },
      ],
    },
    {
      title: 'User Account',
      links: [
        { title: 'Login', url: '/features/authentication/login' },
        { title: 'Register', url: '/features/authentication/register' },
        {
          title: 'Forgot Password',
          url: '/features/authentication/forgot-password',
        },
        { title: 'Profile', url: '/features/account/profile' },
      ],
    },
  ];

  // Kiểm tra xem một liên kết có phải là NestedLink hay không
  isNestedLink(link: SectionLink): link is NestedLink {
    return (link as NestedLink).links !== undefined;
  }
}
