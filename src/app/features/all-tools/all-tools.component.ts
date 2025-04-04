import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

interface Tool {
  title: string;
  description?: string;
  route: string;
  icon: string;
  translateKey?: string;
  descriptionKey?: string;
}

interface ToolGroup {
  title: string;
  translateKey?: string;
  subGroups: {
    title: string;
    translateKey?: string;
    tools: Tool[];
  }[];
}

@Component({
  selector: 'app-all-tools',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <div class="container">
      <h1>{{ 'NAV.ALL_TOOLS' | translate }}</h1>
      <p>
        {{ 'HOME.TOOLS_SECTION.SUBTITLE' | translate }}
      </p>

      @for (group of toolGroups; track group.title) {
      <div
        class="tool-group"
        [attr.id]="group.title.toLowerCase().replace(' ', '-')"
      >
        <h2 class="group-title">
          {{
            group.translateKey ? (group.translateKey | translate) : group.title
          }}
        </h2>
        @for (subGroup of group.subGroups; track subGroup.title) {
        <div class="subgroup">
          <h3 class="subgroup-title">
            {{
              subGroup.translateKey
                ? (subGroup.translateKey | translate)
                : subGroup.title
            }}
          </h3>
          <div class="tools-grid">
            @for (tool of subGroup.tools; track tool.title) {
            <div class="tool-card" [routerLink]="tool.route">
              <div
                class="tool-icon"
                [style.background-image]="'url(' + tool.icon + ')'"
              ></div>
              <div class="tool-info">
                <div class="tool-title">
                  {{
                    tool.translateKey
                      ? (tool.translateKey | translate)
                      : tool.title
                  }}
                </div>
                <div class="tool-description">
                  {{
                    tool.descriptionKey
                      ? (tool.descriptionKey | translate)
                      : tool.description
                  }}
                </div>
              </div>
              <div class="tool-arrow">
                <i class="fas fa-chevron-right"></i>
              </div>
            </div>
            }
          </div>
        </div>
        }
      </div>
      }
    </div>
  `,
  styleUrls: ['./all-tools.component.css'],
})
export class AllToolsComponent implements OnInit {
  constructor(
    private viewportScroller: ViewportScroller,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    // Đăng ký lắng nghe sự thay đổi của fragment
    this.route.fragment.subscribe((fragment) => {
      // Chỉ cuộn trang khi có fragment
      if (fragment) {
        // Đợi 100ms để đảm bảo DOM đã được render
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            // Sử dụng scrollIntoView với block: 'start' để đảm bảo phần tử nằm ở đầu vùng nhìn
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }, 100);
      } else {
        // Khi không có fragment, đảm bảo trang ở vị trí đầu
        window.scrollTo(0, 0);
      }
    });
  }

  toolGroups: ToolGroup[] = [
    {
      title: 'PDF Tools',
      translateKey: 'PDF_TOOLS.TITLE',
      subGroups: [
        {
          title: 'Convert from PDF',
          translateKey: 'PDF_TOOLS.CONVERT_FROM_PDF',
          tools: [
            {
              title: 'PDF to Word',
              translateKey: 'PDF_TOOLS.PDF_TO_WORD',
              description:
                'Chuyển đổi PDF thành tài liệu Word có thể chỉnh sửa',
              descriptionKey: 'PDF_TOOLS.TOOL_DESCRIPTIONS.PDF_TO_WORD',
              route: '/features/pdf-tools/convert-from-pdf/pdf-to-word',
              icon: '/assets/icons/pdf-to-word.svg',
            },
            {
              title: 'PDF to Excel',
              translateKey: 'PDF_TOOLS.PDF_TO_EXCEL',
              description:
                'Chuyển đổi PDF thành bảng tính Excel có thể chỉnh sửa',
              descriptionKey: 'PDF_TOOLS.TOOL_DESCRIPTIONS.PDF_TO_EXCEL',
              route: '/features/pdf-tools/convert-from-pdf/pdf-to-excel',
              icon: '/assets/icons/pdf-to-excel.svg',
            },
          ],
        },
        {
          title: 'Convert to PDF',
          translateKey: 'PDF_TOOLS.CONVERT_TO_PDF',
          tools: [
            {
              title: 'Word to PDF',
              translateKey: 'PDF_TOOLS.WORD_TO_PDF',
              description: 'Chuyển đổi tài liệu Word thành file PDF',
              descriptionKey: 'PDF_TOOLS.TOOL_DESCRIPTIONS.WORD_TO_PDF',
              route: '/features/pdf-tools/convert-to-pdf/word-to-pdf',
              icon: '/assets/icons/word-to-pdf.svg',
            },
            {
              title: 'Excel to PDF',
              translateKey: 'PDF_TOOLS.EXCEL_TO_PDF',
              description: 'Chuyển đổi bảng tính Excel thành tài liệu PDF',
              descriptionKey: 'PDF_TOOLS.TOOL_DESCRIPTIONS.EXCEL_TO_PDF',
              route: '/features/pdf-tools/convert-to-pdf/excel-to-pdf',
              icon: '/assets/icons/excel-to-pdf.svg',
            },
          ],
        },
        {
          title: 'Organize',
          translateKey: 'PDF_TOOLS.ORGANIZE_PDF',
          tools: [
            {
              title: 'Compress PDF',
              translateKey: 'PDF_TOOLS.COMPRESS_PDF',
              description:
                'Giảm kích thước file PDF mà không làm mất chất lượng',
              descriptionKey: 'PDF_TOOLS.TOOL_DESCRIPTIONS.COMPRESS_PDF',
              route: '/features/pdf-tools/organize/compress-pdf',
              icon: '/assets/icons/compress-pdf.svg',
            },
            {
              title: 'Split PDF',
              translateKey: 'PDF_TOOLS.SPLIT_PDF',
              description:
                'Trích xuất trang từ PDF hoặc lưu từng trang thành PDF riêng biệt',
              descriptionKey: 'PDF_TOOLS.TOOL_DESCRIPTIONS.SPLIT_PDF',
              route: '/features/pdf-tools/organize/split-pdf',
              icon: '/assets/icons/split-pdf.svg',
            },
            {
              title: 'Merge PDF',
              translateKey: 'PDF_TOOLS.MERGE_PDF',
              description: 'Kết hợp nhiều PDF thành một tài liệu thống nhất',
              descriptionKey: 'PDF_TOOLS.TOOL_DESCRIPTIONS.MERGE_PDF',
              route: '/features/pdf-tools/organize/merge-pdf',
              icon: '/assets/icons/merge-pdf.svg',
            },
          ],
        },
      ],
    },
    {
      title: 'Image Tools',
      translateKey: 'IMAGE_TOOLS.TITLE',
      subGroups: [
        {
          title: 'Convert images',
          translateKey: 'IMAGE_TOOLS.CONVERT',
          tools: [
            {
              title: 'Image Converter',
              translateKey: 'IMAGE_TOOLS.IMAGE_CONVERTER.TITLE',
              description: 'Chuyển đổi giữa các định dạng ảnh JPG, PNG, WEBP',
              descriptionKey: 'IMAGE_TOOLS.TOOL_DESCRIPTIONS.IMAGE_CONVERTER',
              route: '/features/image-tools/convert/image-converter',
              icon: '/assets/icons/image-converter.svg',
            },
          ],
        },
        {
          title: 'Edit Images',
          translateKey: 'IMAGE_TOOLS.EDIT',
          tools: [
            {
              title: 'Compress Images',
              translateKey: 'IMAGE_TOOLS.COMPRESS_IMAGE.TITLE',
              description: 'Nén ảnh để giảm kích thước file',
              descriptionKey: 'IMAGE_TOOLS.TOOL_DESCRIPTIONS.COMPRESS_IMAGE',
              route: '/features/image-tools/edit/compress-image',
              icon: '/assets/icons/compress-images.svg',
            },
            {
              title: 'Read Image EXIF',
              translateKey: 'IMAGE_TOOLS.READ_EXIF.TITLE',
              description: 'Đọc thông tin EXIF của ảnh',
              descriptionKey: 'IMAGE_TOOLS.TOOL_DESCRIPTIONS.READ_EXIF',
              route: '/features/image-tools/edit/read-image-exif',
              icon: '/assets/icons/read-image-exif.svg',
            },
            {
              title: 'Crop Image',
              translateKey: 'IMAGE_TOOLS.CROP_IMAGE.TITLE',
              description: 'Cắt và xoay hình ảnh',
              descriptionKey: 'IMAGE_TOOLS.TOOL_DESCRIPTIONS.CROP_IMAGE',
              route: '/features/image-tools/edit/crop-image',
              icon: '/assets/icons/crop-image.svg',
            },
          ],
        },
      ],
    },
    {
      title: 'Other Tools',
      translateKey: 'OTHER_TOOLS.TITLE',
      subGroups: [
        {
          title: 'Generate Tools',
          translateKey: 'OTHER_TOOLS.GENERATE',
          tools: [
            {
              title: 'Password Generator',
              translateKey: 'OTHER_TOOLS.PASSWORD_GENERATOR.TITLE',
              description: 'Tạo mật khẩu ngẫu nhiên',
              descriptionKey:
                'OTHER_TOOLS.TOOL_DESCRIPTIONS.PASSWORD_GENERATOR',
              route: '/features/other-tools/generate-tools/password-generator',
              icon: '/assets/icons/password-generator.svg',
            },
            {
              title: 'Lorem Ipsum',
              translateKey: 'OTHER_TOOLS.LOREM_IPSUM.TITLE',
              description: 'Tạo văn bản lorem ipsum',
              descriptionKey: 'OTHER_TOOLS.TOOL_DESCRIPTIONS.LOREM_IPSUM',
              route: '/features/other-tools/generate-tools/lorem-ipsum',
              icon: '/assets/icons/lorem-ipsum.svg',
            },
          ],
        },
        {
          title: 'Javascript Tools',
          translateKey: 'OTHER_TOOLS.JAVASCRIPT',
          tools: [
            {
              title: 'Json to CSV',
              translateKey: 'OTHER_TOOLS.JSON_TO_CSV.TITLE',
              description: 'Chuyển đổi JSON thành CSV',
              descriptionKey: 'OTHER_TOOLS.TOOL_DESCRIPTIONS.JSON_TO_CSV',
              route: '/features/other-tools/javascript-tools/json-to-csv',
              icon: '/assets/icons/json-to-csv.svg',
            },
            {
              title: 'CSV to JSON',
              translateKey: 'OTHER_TOOLS.CSV_TO_JSON.TITLE',
              description: 'Chuyển đổi CSV thành JSON',
              descriptionKey: 'OTHER_TOOLS.TOOL_DESCRIPTIONS.CSV_TO_JSON',
              route: '/features/other-tools/javascript-tools/csv-to-json',
              icon: '/assets/icons/csv-to-json.svg',
            },
          ],
        },
        {
          title: 'Mathematics Tools',
          translateKey: 'OTHER_TOOLS.MATHEMATICS',
          tools: [
            {
              title: 'Numerical Analysis',
              translateKey: 'OTHER_TOOLS.NUMERICAL_ANALYSIS.TITLE',
              description: 'Phân tích số học',
              descriptionKey:
                'OTHER_TOOLS.TOOL_DESCRIPTIONS.NUMERICAL_ANALYSIS',
              route:
                '/features/other-tools/mathematics-tools/numerical-analysis',
              icon: '/assets/icons/numerical-analysis.svg',
            },
          ],
        },
      ],
    },
  ];
}
