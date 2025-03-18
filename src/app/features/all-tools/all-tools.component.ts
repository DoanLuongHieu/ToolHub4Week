import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface Tool {
  title: string;
  description: string;
  route: string;
  icon: string;
}

interface ToolGroup {
  title: string;
  subGroups: {
    title: string;
    tools: Tool[];
  }[];
}

@Component({
  selector: 'app-all-tools',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <h1>Tất cả công cụ ToolHub4Week</h1>
      <p>
        Sử dụng bộ công cụ của chúng tôi để xử lý tài liệu số và tối ưu hóa quy
        trình làm việc của bạn một cách liền mạch.
      </p>

      @for (group of toolGroups; track group.title) {
      <div
        class="tool-group"
        [attr.id]="group.title.toLowerCase().replace(' ', '-')"
      >
        <h2 class="group-title">{{ group.title }}</h2>
        @for (subGroup of group.subGroups; track subGroup.title) {
        <div class="subgroup">
          <h3 class="subgroup-title">{{ subGroup.title }}</h3>
          <div class="tools-grid">
            @for (tool of subGroup.tools; track tool.title) {
            <div class="tool-card" [routerLink]="tool.route">
              <div
                class="tool-icon"
                [style.background-image]="'url(' + tool.icon + ')'"
              ></div>
              <div class="tool-info">
                <div class="tool-title">{{ tool.title }}</div>
                <div class="tool-description">{{ tool.description }}</div>
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
    private route: ActivatedRoute
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
      subGroups: [
        {
          title: 'Convert from PDF',
          tools: [
            {
              title: 'PDF sang Word',
              description:
                'Chuyển đổi PDF thành tài liệu Word có thể chỉnh sửa',
              route: '/features/pdf-tools/convert-from-pdf/pdf-to-word',
              icon: '/assets/icons/pdf-to-word.svg',
            },
            {
              title: 'PDF sang Excel',
              description:
                'Chuyển đổi PDF thành bảng tính Excel có thể chỉnh sửa',
              route: '/features/pdf-tools/convert-from-pdf/pdf-to-excel',
              icon: '/assets/icons/pdf-to-excel.svg',
            },
          ],
        },
        {
          title: 'Convert to PDF',
          tools: [
            {
              title: 'Word sang PDF',
              description: 'Chuyển đổi tài liệu Word thành file PDF',
              route: '/features/pdf-tools/convert-to-pdf/word-to-pdf',
              icon: '/assets/icons/word-to-pdf.svg',
            },
            {
              title: 'Excel sang PDF',
              description: 'Chuyển đổi bảng tính Excel thành tài liệu PDF',
              route: '/features/pdf-tools/convert-to-pdf/excel-to-pdf',
              icon: '/assets/icons/excel-to-pdf.svg',
            },
          ],
        },
        {
          title: 'Organize',
          tools: [
            {
              title: 'Nén PDF',
              description:
                'Giảm kích thước file PDF mà không làm mất chất lượng',
              route: '/features/pdf-tools/organize/compress-pdf',
              icon: '/assets/icons/compress-pdf.svg',
            },
            {
              title: 'Tách PDF',
              description:
                'Trích xuất trang từ PDF hoặc lưu từng trang thành PDF riêng biệt',
              route: '/features/pdf-tools/organize/split-pdf',
              icon: '/assets/icons/split-pdf.svg',
            },
            {
              title: 'Ghép PDF',
              description: 'Kết hợp nhiều PDF thành một tài liệu thống nhất',
              route: '/features/pdf-tools/organize/merge-pdf',
              icon: '/assets/icons/merge-pdf.svg',
            },
          ],
        },
      ],
    },
    {
      title: 'Image Tools',
      subGroups: [
        {
          title: 'Convert images',
          tools: [
            {
              title: 'Image Converter',
              description: 'Chuyển đổi giữa các định dạng ảnh JPG, PNG, WEBP',
              route: '/features/image-tools/convert-images',
              icon: '/assets/icons/image-converter.svg',
            },
          ],
        },
        {
          title: 'Edit Images',
          tools: [
            {
              title: 'Compress Images',
              description: 'Nén ảnh để giảm kích thước file',
              route: '/features/image-tools/edit-images/compress-images',
              icon: '/assets/icons/compress-images.svg',
            },
            {
              title: 'Read Image EXIF',
              description: 'Đọc thông tin EXIF của ảnh',
              route: '/features/image-tools/edit-images/read-image-exif',
              icon: '/assets/icons/read-image-exif.svg',
            },
            {
              title: 'Frame Image',
              description: 'Thêm khung ảnh vào ảnh',
              route: '/features/image-tools/edit-images/frame-image',
              icon: '/assets/icons/frame-image.svg',
            },
            {
              title: 'Crop Image',
              description: 'Cắt ảnh theo kích thước',
              route: '/features/image-tools/edit-images/crop-image',
              icon: '/assets/icons/crop-image.svg',
            },
          ],
        },
      ],
    },
    {
      title: 'Other Tools',
      subGroups: [
        {
          title: 'Generate Tools',
          tools: [
            {
              title: 'Password Generator',
              description: 'Tạo mật khẩu ngẫu nhiên',
              route: '/features/other-tools/generate-tools/password-generator',
              icon: '/assets/icons/password-generator.svg',
            },
            {
              title: 'Lorem Ipsum',
              description: 'Tạo văn bản lorem ipsum',
              route: '/features/other-tools/generate-tools/lorem-ipsum',
              icon: '/assets/icons/lorem-ipsum.svg',
            },
          ],
        },
        {
          title: 'Javascript Tools',
          tools: [
            {
              title: 'Json to CSV',
              description: 'Chuyển đổi JSON thành CSV',
              route: '/features/other-tools/javascript-tools/json-to-csv',
              icon: '/assets/icons/json-to-csv.svg',
            },
            {
              title: 'CSV to JSON',
              description: 'Chuyển đổi CSV thành JSON',
              route: '/features/other-tools/javascript-tools/csv-to-json',
              icon: '/assets/icons/csv-to-json.svg',
            },
          ],
        },
        {
          title: 'Mathematics Tools',
          tools: [
            {
              title: 'Numerical Analysis',
              description: 'Phân tích số học',
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
