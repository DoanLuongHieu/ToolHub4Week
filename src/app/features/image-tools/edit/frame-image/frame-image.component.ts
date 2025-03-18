import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TextStyle {
  text: string;
  font: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  x: number;
  y: number;
  color: string;
  backgroundColor: string;
  isSelected: boolean;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
  type: 'text' | 'icon' | null;
  elementIndex: number;
}

interface Icon {
  type: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
}

interface Layer {
  id: string;
  type: 'image' | 'frame' | 'text' | 'icon';
  zIndex: number;
  isVisible: boolean;
  isLocked: boolean;
  name: string;
  data: any; // Dữ liệu của layer (TextStyle, Icon, hoặc đường dẫn ảnh)
}

@Component({
  selector: 'app-frame-image',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './frame-image.component.html',
  styleUrl: './frame-image.component.css',
})
export class FrameImageComponent {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('frameInput') frameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('colorPicker') colorPicker!: ElementRef<HTMLInputElement>;
  @ViewChild('bgColorPicker') bgColorPicker!: ElementRef<HTMLInputElement>;

  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;
  selectedImage: string | null = null;
  selectedFrame: string | null = null;
  defaultFrame = 'assets/frames/default-frame.png';
  selectedTextIndex: number = -1;
  selectedIconIndex: number = -1;
  newText: string = '';
  activeTextTab: 'content' | 'style' | 'color' = 'content';

  // Trạng thái đóng/mở các phần
  collapsedSections = {
    text: false,
    emoji: false,
    layers: false,
  };

  // Biến để tránh render lại quá nhiều
  private animationFrameId: number | null = null;

  dragState: DragState = {
    isDragging: false,
    startX: 0,
    startY: 0,
    elementStartX: 0,
    elementStartY: 0,
    type: null,
    elementIndex: -1,
  };

  texts: TextStyle[] = [];
  icons: Icon[] = [];

  fonts = [
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Helvetica',
  ];

  fbIcons = [
    { type: 'like', emoji: '👍' },
    { type: 'love', emoji: '❤️' },
    { type: 'haha', emoji: '😆' },
    { type: 'wow', emoji: '😲' },
    { type: 'sad', emoji: '😢' },
    { type: 'angry', emoji: '😠' },
    { type: 'care', emoji: '🤗' },
  ];

  colors = [
    '#000000',
    '#ffffff',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#00ffff',
  ];

  // Thêm thuộc tính quản lý layer
  layers: Layer[] = [];
  selectedLayerId: string | null = null;
  nextLayerId = 1;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit() {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.width = 900;
    this.canvas.height = 900;
    this.redrawCanvas();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.dragState.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const deltaX = x - this.dragState.startX;
    const deltaY = y - this.dragState.startY;

    if (this.dragState.type === 'text') {
      const text = this.texts[this.dragState.elementIndex];
      if (!text) return;

      // Tìm layer tương ứng
      const layer = this.layers.find(
        (l) => l.type === 'text' && l.data === text
      );
      if (layer && layer.isLocked) return;

      text.x = this.dragState.elementStartX + deltaX;
      text.y = this.dragState.elementStartY + deltaY;
    } else if (this.dragState.type === 'icon') {
      const icon = this.icons[this.dragState.elementIndex];
      if (!icon) return;

      // Tìm layer tương ứng
      const layer = this.layers.find(
        (l) => l.type === 'icon' && l.data === icon
      );
      if (layer && layer.isLocked) return;

      icon.x = this.dragState.elementStartX + deltaX;
      icon.y = this.dragState.elementStartY + deltaY;
    }

    // Sử dụng requestRedraw thay vì gọi trực tiếp redrawCanvas
    this.requestRedraw();
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.dragState.isDragging) {
      this.dragState.isDragging = false;

      // Vẽ lại toàn bộ canvas sau khi kết thúc di chuyển
      this.redrawCanvas();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
        // Thêm ảnh vào layer mới
        this.addLayer('image', this.selectedImage, 'Ảnh nền');
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onFrameSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedFrame = e.target?.result as string;
        // Thêm khung vào layer mới
        this.addLayer('frame', this.selectedFrame, 'Khung ảnh');
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onCanvasClick(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Duyệt qua các layer theo thứ tự ngược lại (từ trên xuống dưới)
    const reversedLayers = [...this.layers]
      .sort((a, b) => b.zIndex - a.zIndex)
      .filter((layer) => layer.isVisible && !layer.isLocked);

    for (const layer of reversedLayers) {
      if (layer.type === 'text') {
        const text = layer.data as TextStyle;
        const metrics = this.ctx.measureText(text.text);
        const textHeight = text.size;

        // Kiểm tra xem click có nằm trong vùng text không
        if (
          x >= text.x - metrics.width / 2 - 5 &&
          x <= text.x + metrics.width / 2 + 5 &&
          y >= text.y - textHeight &&
          y <= text.y + 10
        ) {
          // Tìm index của text trong mảng texts
          const textIndex = this.texts.findIndex((t) => t === text);
          if (textIndex !== -1) {
            this.selectText(textIndex);
            this.selectLayer(layer.id);
            this.startDragging(event, 'text', textIndex);
            return;
          }
        }
      } else if (layer.type === 'icon') {
        const icon = layer.data as Icon;
        const iconSize = icon.size;

        // Kiểm tra xem click có nằm trong vùng icon không
        if (
          x >= icon.x - iconSize / 2 &&
          x <= icon.x + iconSize / 2 &&
          y >= icon.y - iconSize / 2 &&
          y <= icon.y + iconSize / 2
        ) {
          // Tìm index của icon trong mảng icons
          const iconIndex = this.icons.findIndex((i) => i === icon);
          if (iconIndex !== -1) {
            this.selectIcon(iconIndex);
            this.selectLayer(layer.id);
            this.startDragging(event, 'icon', iconIndex);
            return;
          }
        }
      }
    }

    // Bỏ chọn tất cả text và icon nếu click vào khoảng trống
    this.texts.forEach((t) => (t.isSelected = false));
    this.selectedTextIndex = -1;
    this.selectedIconIndex = -1;
    this.selectedLayerId = null;
    this.redrawCanvas();
  }

  redrawCanvas() {
    if (!this.ctx) return;

    // Xóa canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Vẽ nền trắng mặc định
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Vẽ các layer theo thứ tự zIndex (từ thấp đến cao)
    const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

    // Tách các layer thành hai nhóm: ảnh/khung và text/icon
    const imageLayers = sortedLayers.filter(
      (layer) =>
        (layer.type === 'image' || layer.type === 'frame') && layer.isVisible
    );

    const nonImageLayers = sortedLayers.filter(
      (layer) =>
        (layer.type === 'text' || layer.type === 'icon') && layer.isVisible
    );

    // Đếm số layer ảnh và khung cần tải
    const imageLayersCount = imageLayers.length;

    // Biến đếm số layer ảnh đã tải xong
    let loadedImageLayers = 0;

    // Vẽ các layer ảnh và khung
    for (const layer of imageLayers) {
      switch (layer.type) {
        case 'image':
          const img = new Image();
          img.onload = () => {
            // Tính toán tỷ lệ để ảnh vừa với canvas
            const ratio = Math.min(
              this.canvas.width / img.width,
              this.canvas.height / img.height
            );
            const centerX = (this.canvas.width - img.width * ratio) / 2;
            const centerY = (this.canvas.height - img.height * ratio) / 2;

            // Vẽ ảnh vào giữa canvas
            this.ctx.drawImage(
              img,
              centerX,
              centerY,
              img.width * ratio,
              img.height * ratio
            );

            loadedImageLayers++;

            // Nếu tất cả layer ảnh đã tải xong, vẽ các layer text và icon
            if (loadedImageLayers === imageLayersCount) {
              this.drawNonImageLayers(nonImageLayers);
            }
          };
          img.src = layer.data;
          break;
        case 'frame':
          const frameImg = new Image();
          frameImg.onload = () => {
            this.ctx.drawImage(
              frameImg,
              0,
              0,
              this.canvas.width,
              this.canvas.height
            );

            loadedImageLayers++;

            // Nếu tất cả layer ảnh đã tải xong, vẽ các layer text và icon
            if (loadedImageLayers === imageLayersCount) {
              this.drawNonImageLayers(nonImageLayers);
            }
          };
          frameImg.src = layer.data;
          break;
      }
    }

    // Nếu không có layer ảnh nào, vẽ ngay các layer text và icon
    if (imageLayersCount === 0) {
      this.drawNonImageLayers(nonImageLayers);
    }
  }

  drawNonImageLayers(layers: Layer[]) {
    for (const layer of layers) {
      if (!layer.isVisible) continue;

      if (layer.type === 'text') {
        this.drawTextLayer(layer);
      } else if (layer.type === 'icon') {
        this.drawIconLayer(layer);
      }
    }
  }

  drawImageLayer(layer: Layer) {
    if (!layer.data) return;

    const img = new Image();
    img.onload = () => {
      // Tính toán tỷ lệ để ảnh vừa với canvas
      const ratio = Math.min(
        this.canvas.width / img.width,
        this.canvas.height / img.height
      );
      const centerX = (this.canvas.width - img.width * ratio) / 2;
      const centerY = (this.canvas.height - img.height * ratio) / 2;

      // Vẽ ảnh vào giữa canvas
      this.ctx.drawImage(
        img,
        centerX,
        centerY,
        img.width * ratio,
        img.height * ratio
      );
    };
    img.src = layer.data;
  }

  drawFrameLayer(layer: Layer) {
    if (!layer.data) return;

    const frameImg = new Image();
    frameImg.onload = () => {
      this.ctx.drawImage(frameImg, 0, 0, this.canvas.width, this.canvas.height);
    };
    frameImg.src = layer.data;
  }

  drawTextLayer(layer: Layer) {
    const text = layer.data as TextStyle;
    if (!text) return;

    // Thiết lập font chữ
    let fontStyle = '';
    if (text.bold) fontStyle += 'bold ';
    if (text.italic) fontStyle += 'italic ';
    fontStyle += `${text.size}px ${text.font}`;

    this.ctx.font = fontStyle;

    // Vẽ background nếu có
    if (text.backgroundColor && text.backgroundColor !== '') {
      const metrics = this.ctx.measureText(text.text);
      const textHeight = text.size;

      this.ctx.fillStyle = text.backgroundColor;
      this.ctx.fillRect(
        text.x - metrics.width / 2 - 5,
        text.y - textHeight,
        metrics.width + 10,
        textHeight + 10
      );
    }

    // Vẽ text
    this.ctx.fillStyle = text.color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'alphabetic';
    this.ctx.fillText(text.text, text.x, text.y);

    // Vẽ gạch chân nếu có
    if (text.underline) {
      const metrics = this.ctx.measureText(text.text);
      this.ctx.strokeStyle = text.color;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(text.x - metrics.width / 2, text.y + 3);
      this.ctx.lineTo(text.x + metrics.width / 2, text.y + 3);
      this.ctx.stroke();
    }

    // Vẽ viền chọn nếu text được chọn
    if (
      this.selectedTextIndex >= 0 &&
      this.texts[this.selectedTextIndex] === text
    ) {
      const metrics = this.ctx.measureText(text.text);
      const textHeight = text.size;

      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        text.x - metrics.width / 2 - 5,
        text.y - textHeight,
        metrics.width + 10,
        textHeight + 10
      );

      // Vẽ điểm điều khiển
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.fillRect(
        text.x - metrics.width / 2 - 5 - 4,
        text.y - textHeight - 4,
        8,
        8
      );
      this.ctx.fillRect(
        text.x + metrics.width / 2 + 5 - 4,
        text.y - textHeight - 4,
        8,
        8
      );
      this.ctx.fillRect(
        text.x - metrics.width / 2 - 5 - 4,
        text.y + 10 - 4,
        8,
        8
      );
      this.ctx.fillRect(
        text.x + metrics.width / 2 + 5 - 4,
        text.y + 10 - 4,
        8,
        8
      );
    }
  }

  drawIconLayer(layer: Layer) {
    const icon = layer.data as Icon;
    if (!icon) return;

    // Vẽ emoji
    this.ctx.font = `${icon.size}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(icon.emoji, icon.x, icon.y);

    // Vẽ viền chọn nếu icon được chọn
    if (
      this.selectedIconIndex >= 0 &&
      this.icons[this.selectedIconIndex] === icon
    ) {
      const iconSize = icon.size;

      this.ctx.strokeStyle = '#3b82f6';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        icon.x - iconSize / 2,
        icon.y - iconSize / 2,
        iconSize,
        iconSize
      );

      // Vẽ điểm điều khiển
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.fillRect(
        icon.x - iconSize / 2 - 4,
        icon.y - iconSize / 2 - 4,
        8,
        8
      );
      this.ctx.fillRect(
        icon.x + iconSize / 2 - 4,
        icon.y - iconSize / 2 - 4,
        8,
        8
      );
      this.ctx.fillRect(
        icon.x - iconSize / 2 - 4,
        icon.y + iconSize / 2 - 4,
        8,
        8
      );
      this.ctx.fillRect(
        icon.x + iconSize / 2 - 4,
        icon.y + iconSize / 2 - 4,
        8,
        8
      );
    }
  }

  selectText(index: number) {
    this.texts.forEach((t, i) => {
      t.isSelected = i === index;
    });
    this.selectedTextIndex = index;
    this.selectedIconIndex = -1;
    this.redrawCanvas();
  }

  selectIcon(index: number) {
    this.selectedIconIndex = index;
    this.selectedTextIndex = -1;
    this.texts.forEach((t) => (t.isSelected = false));
    this.redrawCanvas();
  }

  updateTextProperty() {
    this.redrawCanvas();
  }

  updateIconProperty() {
    this.redrawCanvas();
  }

  addIcon(icon: { type: string; emoji: string }) {
    const newIcon: Icon = {
      type: icon.type,
      emoji: icon.emoji,
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      size: 40,
    };

    // Thêm icon vào mảng icons
    this.icons.push(newIcon);
    this.selectedIconIndex = this.icons.length - 1;

    // Thêm icon vào layer mới
    this.addLayer('icon', newIcon, `Icon: ${icon.type}`);
  }

  deleteIcon(index: number) {
    const icon = this.icons[index];

    // Tìm layer chứa icon này
    const layerId = this.layers.find(
      (layer) => layer.type === 'icon' && layer.data === icon
    )?.id;

    // Xóa icon khỏi mảng icons
    this.icons.splice(index, 1);
    this.selectedIconIndex = -1;

    // Xóa layer nếu tìm thấy
    if (layerId) {
      this.deleteLayer(layerId);
    } else {
      this.redrawCanvas();
    }
  }

  // Phương thức vẽ lại canvas đồng bộ
  async redrawCanvasSync(): Promise<void> {
    if (!this.ctx) return;

    // Xóa canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Vẽ các layer theo thứ tự zIndex (từ thấp đến cao)
    const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

    // Vẽ từng layer một cách đồng bộ
    for (const layer of sortedLayers) {
      // Bỏ qua layer không hiển thị
      if (!layer.isVisible) continue;

      switch (layer.type) {
        case 'image':
          await this.drawImageLayerSync(layer);
          break;
        case 'frame':
          await this.drawFrameLayerSync(layer);
          break;
        case 'text':
          this.drawTextLayer(layer);
          break;
        case 'icon':
          this.drawIconLayer(layer);
          break;
      }
    }
  }

  // Phương thức vẽ layer ảnh đồng bộ
  async drawImageLayerSync(layer: Layer): Promise<void> {
    if (!layer.data) return;

    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Tính toán tỷ lệ để ảnh vừa với canvas
        const ratio = Math.min(
          this.canvas.width / img.width,
          this.canvas.height / img.height
        );
        const centerX = (this.canvas.width - img.width * ratio) / 2;
        const centerY = (this.canvas.height - img.height * ratio) / 2;

        // Vẽ ảnh vào giữa canvas
        this.ctx.drawImage(
          img,
          centerX,
          centerY,
          img.width * ratio,
          img.height * ratio
        );
        resolve();
      };
      img.src = layer.data;
    });
  }

  // Phương thức vẽ layer khung đồng bộ
  async drawFrameLayerSync(layer: Layer): Promise<void> {
    if (!layer.data) return;

    return new Promise<void>((resolve) => {
      const frameImg = new Image();
      frameImg.onload = () => {
        this.ctx.drawImage(
          frameImg,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
        resolve();
      };
      frameImg.src = layer.data;
    });
  }

  // Cập nhật phương thức downloadImage để sử dụng redrawCanvasSync
  async downloadImage() {
    // Tạm thời ẩn viền chọn
    const tempSelectedTextIndex = this.selectedTextIndex;
    const tempSelectedIconIndex = this.selectedIconIndex;
    const tempSelectedLayerId = this.selectedLayerId;

    this.selectedTextIndex = -1;
    this.selectedIconIndex = -1;
    this.selectedLayerId = null;

    // Vẽ lại canvas không có viền chọn một cách đồng bộ
    await this.redrawCanvasSync();

    // Tạo URL để tải xuống
    const dataUrl = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'frame-image.png';
    link.click();

    // Khôi phục lại trạng thái chọn
    this.selectedTextIndex = tempSelectedTextIndex;
    this.selectedIconIndex = tempSelectedIconIndex;
    this.selectedLayerId = tempSelectedLayerId;
    this.redrawCanvas();
  }

  onTextSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectText(+value);
  }

  addText() {
    if (!this.newText || this.newText.trim() === '') return;

    // Tạo text style mới
    const newTextStyle: TextStyle = {
      text: this.newText,
      font: 'Arial',
      size: 24,
      bold: false,
      italic: false,
      underline: false,
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      color: '#000000',
      backgroundColor: '',
      isSelected: true,
    };

    // Thêm text vào mảng texts
    this.texts.push(newTextStyle);
    this.selectedTextIndex = this.texts.length - 1;

    // Thêm text vào layer mới
    this.addLayer(
      'text',
      newTextStyle,
      `Text: ${this.newText.substring(0, 10)}${
        this.newText.length > 10 ? '...' : ''
      }`
    );

    this.newText = ''; // Xóa text trong ô nhập

    // Vẽ lại canvas để hiển thị text mới
    this.redrawCanvas();
  }

  deleteText(index: number) {
    const text = this.texts[index];

    // Tìm layer chứa text này
    const layerId = this.layers.find(
      (layer) => layer.type === 'text' && layer.data === text
    )?.id;

    // Xóa text khỏi mảng texts
    this.texts.splice(index, 1);

    if (this.selectedTextIndex === index) {
      this.selectedTextIndex = this.texts.length > 0 ? 0 : -1;
    } else if (this.selectedTextIndex > index) {
      this.selectedTextIndex--;
    }

    // Xóa layer nếu tìm thấy
    if (layerId) {
      this.deleteLayer(layerId);
    } else {
      this.redrawCanvas();
    }
  }

  startDragging(event: MouseEvent, type: 'text' | 'icon', index: number) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (type === 'text') {
      this.dragState = {
        isDragging: true,
        startX: x,
        startY: y,
        elementStartX: this.texts[index].x,
        elementStartY: this.texts[index].y,
        type,
        elementIndex: index,
      };
    } else if (type === 'icon') {
      this.dragState = {
        isDragging: true,
        startX: x,
        startY: y,
        elementStartX: this.icons[index].x,
        elementStartY: this.icons[index].y,
        type,
        elementIndex: index,
      };
    }
  }

  toggleSection(section: 'text' | 'emoji' | 'layers') {
    this.collapsedSections[section] = !this.collapsedSections[section];
  }

  // Cập nhật phương thức requestRedraw để tối ưu hóa việc vẽ lại
  requestRedraw() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Sử dụng ngZone.runOutsideAngular để tránh kích hoạt change detection
    this.ngZone.runOutsideAngular(() => {
      this.animationFrameId = requestAnimationFrame(() => {
        // Lưu trữ trạng thái hiện tại của canvas
        const imageData = this.ctx.getImageData(
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );

        // Xóa canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Khôi phục trạng thái trước đó
        this.ctx.putImageData(imageData, 0, 0);

        // Chỉ vẽ lại các phần tử đang được di chuyển
        if (this.dragState.isDragging) {
          if (this.dragState.type === 'text' && this.selectedTextIndex >= 0) {
            const text = this.texts[this.selectedTextIndex];
            const layer = this.layers.find(
              (l) => l.type === 'text' && l.data === text
            );
            if (layer) {
              this.drawTextLayer(layer);
            }
          } else if (
            this.dragState.type === 'icon' &&
            this.selectedIconIndex >= 0
          ) {
            const icon = this.icons[this.selectedIconIndex];
            const layer = this.layers.find(
              (l) => l.type === 'icon' && l.data === icon
            );
            if (layer) {
              this.drawIconLayer(layer);
            }
          }
        } else {
          // Nếu không phải đang di chuyển, vẽ lại toàn bộ canvas
          this.redrawCanvas();
        }

        this.animationFrameId = null;
      });
    });
  }

  // Khởi tạo layers khi component được tạo
  ngOnInit() {
    // Tạo layer mặc định cho khung ảnh
    this.addLayer('frame', this.defaultFrame, 'Khung mặc định ');
  }

  // Phương thức tạo layer mới
  addLayer(
    type: 'image' | 'frame' | 'text' | 'icon',
    data: any,
    name?: string
  ): string {
    const layerId = `layer_${this.nextLayerId++}`;
    const layerName =
      name ||
      `${type.charAt(0).toUpperCase() + type.slice(1)} ${
        this.layers.length + 1
      }`;

    const newLayer: Layer = {
      id: layerId,
      type,
      zIndex: this.layers.length + 1, // Layer mới sẽ nằm trên cùng
      isVisible: true,
      isLocked: false,
      name: layerName,
      data,
    };

    this.layers.push(newLayer);
    this.selectedLayerId = layerId;
    this.redrawCanvas();

    return layerId;
  }

  // Phương thức xóa layer
  deleteLayer(layerId: string) {
    const index = this.layers.findIndex((layer) => layer.id === layerId);
    if (index === -1) return;

    this.layers.splice(index, 1);

    // Nếu xóa layer đang chọn, chọn layer khác
    if (this.selectedLayerId === layerId) {
      this.selectedLayerId =
        this.layers.length > 0 ? this.layers[this.layers.length - 1].id : null;
    }

    this.redrawCanvas();
  }

  // Phương thức chọn layer
  selectLayer(layerId: string) {
    this.selectedLayerId = layerId;

    // Cập nhật selectedTextIndex hoặc selectedIconIndex tùy thuộc vào loại layer
    const layer = this.getLayerById(layerId);
    if (!layer) return;

    // Reset các chỉ số đã chọn
    this.selectedTextIndex = -1;
    this.selectedIconIndex = -1;

    if (layer.type === 'text') {
      // Tìm index của text trong mảng texts
      const textIndex = this.texts.findIndex((t) => t === layer.data);
      if (textIndex !== -1) {
        this.selectText(textIndex);
      }
    } else if (layer.type === 'icon') {
      // Tìm index của icon trong mảng icons
      const iconIndex = this.icons.findIndex((i) => i === layer.data);
      if (iconIndex !== -1) {
        this.selectIcon(iconIndex);
      }
    }

    this.redrawCanvas();
  }

  // Phương thức lấy layer theo id
  getLayerById(layerId: string): Layer | undefined {
    return this.layers.find((layer) => layer.id === layerId);
  }

  // Phương thức thay đổi thứ tự layer
  changeLayerOrder(
    layerId: string,
    direction: 'up' | 'down' | 'top' | 'bottom'
  ) {
    const index = this.layers.findIndex((layer) => layer.id === layerId);
    if (index === -1) return;

    const layer = this.layers[index];

    // Xóa layer khỏi mảng
    this.layers.splice(index, 1);

    let newIndex: number;
    switch (direction) {
      case 'up':
        newIndex = Math.min(index + 1, this.layers.length);
        break;
      case 'down':
        newIndex = Math.max(index - 1, 0);
        break;
      case 'top':
        newIndex = this.layers.length;
        break;
      case 'bottom':
        newIndex = 0;
        break;
    }

    // Chèn layer vào vị trí mới
    this.layers.splice(newIndex, 0, layer);

    // Cập nhật lại zIndex cho tất cả các layer
    this.updateLayerZIndex();

    this.redrawCanvas();
  }

  // Cập nhật zIndex cho tất cả layer
  updateLayerZIndex() {
    this.layers.forEach((layer, index) => {
      layer.zIndex = index + 1;
    });
  }

  // Phương thức toggle hiển thị layer
  toggleLayerVisibility(layerId: string) {
    const layer = this.getLayerById(layerId);
    if (layer) {
      layer.isVisible = !layer.isVisible;
      this.redrawCanvas();
    }
  }

  // Phương thức toggle khóa layer
  toggleLayerLock(layerId: string) {
    const layer = this.getLayerById(layerId);
    if (layer) {
      layer.isLocked = !layer.isLocked;
    }
  }

  // Phương thức đổi tên layer
  renameLayer(layerId: string, newName: string) {
    const layer = this.getLayerById(layerId);
    if (layer) {
      layer.name = newName;
    }
  }

  // Phương thức nhóm các layer
  groupLayers(layerIds: string[], groupName: string) {
    // Tạo một layer mới kiểu group
    const groupId = `layer_${this.nextLayerId++}`;

    // Lọc ra các layer cần nhóm
    const layersToGroup = this.layers.filter((layer) =>
      layerIds.includes(layer.id)
    );

    // Xóa các layer đã chọn khỏi danh sách chính
    this.layers = this.layers.filter((layer) => !layerIds.includes(layer.id));

    // Tạo layer nhóm mới
    const groupLayer: Layer = {
      id: groupId,
      type: 'image', // Tạm thời dùng type image
      zIndex: this.layers.length + 1,
      isVisible: true,
      isLocked: false,
      name: groupName,
      data: {
        type: 'group',
        children: layersToGroup,
      },
    };

    this.layers.push(groupLayer);
    this.selectedLayerId = groupId;

    this.updateLayerZIndex();
    this.redrawCanvas();
  }
}
