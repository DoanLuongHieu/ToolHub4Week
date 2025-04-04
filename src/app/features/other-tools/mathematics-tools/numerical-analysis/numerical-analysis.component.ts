import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-numerical-analysis',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './numerical-analysis.component.html',
  styleUrl: './numerical-analysis.component.css',
})
export class NumericalAnalysisComponent implements OnInit {
  private translate = inject(TranslateService);

  a: number = 0;
  b: number = 0;
  c: number = 0;
  result: string = '';
  originalExpression: string = ''; // Biểu thức gốc chưa thay thế giá trị
  evaluatedExpression: string = ''; // Biểu thức đã thay thế giá trị
  error: string = '';
  isLoading: boolean = false;
  selectedMethod: string = 'bfs'; // Phương pháp mặc định
  maxDepth: number = 10; // Tăng độ sâu tìm kiếm
  showSteps: boolean = false; // Hiển thị các bước trung gian
  steps: string[] = []; // Lưu các bước trung gian

  ngOnInit() {
    // Khởi tạo component
  }

  validateInput(): boolean {
    if (!this.a || !this.b || !this.c) {
      this.error = this.translate.instant(
        'OTHER_TOOLS.NUMERICAL_ANALYSIS.ERROR_EMPTY_VALUES'
      );
      return false;
    }
    if (this.a < 1 || this.a > 31) {
      this.error = this.translate.instant(
        'OTHER_TOOLS.NUMERICAL_ANALYSIS.ERROR_DAY_RANGE'
      );
      return false;
    }
    if (this.b < 1 || this.b > 12) {
      this.error = this.translate.instant(
        'OTHER_TOOLS.NUMERICAL_ANALYSIS.ERROR_MONTH_RANGE'
      );
      return false;
    }
    if (this.c < 1900 || this.c > 2099) {
      this.error = this.translate.instant(
        'OTHER_TOOLS.NUMERICAL_ANALYSIS.ERROR_YEAR_RANGE'
      );
      return false;
    }
    this.error = '';
    return true;
  }

  findExpression() {
    if (!this.validateInput()) return;

    this.isLoading = true;
    this.result = '';
    this.originalExpression = '';
    this.evaluatedExpression = '';
    this.steps = [];
    this.error = '';

    try {
      let expression: string | null = null;

      // Thử các phương pháp theo thứ tự
      switch (this.selectedMethod) {
        case 'ladder':
          expression = this.ladderMethod(this.a, this.b, this.c);
          if (expression) {
            this.result = `${this.c} = ${expression.replace(
              /a/g,
              this.a.toString()
            )}`;
          }
          break;
        default:
          switch (this.selectedMethod) {
            case 'bfs':
              expression = this.generateExpression(this.a, this.b, this.c);
              break;
            case 'prime':
              expression = this.primeFactorization(this.a, this.b, this.c);
              break;
            case 'decimal':
              expression = this.decimalDecomposition(this.a, this.b, this.c);
              break;
            case 'modulo':
              expression = this.moduloMethod(this.a, this.b, this.c);
              break;
            case 'meetMiddle':
              expression = this.meetInMiddle(this.a, this.b, this.c);
              break;
            case 'divideConquer':
              expression = this.divideAndConquer(this.a, this.b, this.c);
              break;
          }
          if (expression) {
            this.result = `${this.c} = ${expression}`;
          }
      }

      if (!expression) {
        this.result = this.translate.instant(
          'OTHER_TOOLS.NUMERICAL_ANALYSIS.NO_EXPRESSION_FOUND'
        );
      }

      if (this.showSteps && this.result) {
        this.addStep(
          `${this.translate.instant(
            'OTHER_TOOLS.NUMERICAL_ANALYSIS.RESULT'
          )}: ${this.result}`
        );
      }
    } catch (err) {
      this.error = this.translate.instant(
        'OTHER_TOOLS.NUMERICAL_ANALYSIS.ERROR_CALCULATION'
      );
    } finally {
      this.isLoading = false;
    }
  }

  // 1. Phương pháp BFS cải tiến với độ sâu tăng
  private generateExpression(
    a: number,
    b: number,
    target: number
  ): string | null {
    const operations: {
      [key: string]: (x: number, y: number) => number | null;
    } = {
      '+': (x, y) => x + y,
      '-': (x, y) => x - y,
      '*': (x, y) => x * y,
      '/': (x, y) => (y !== 0 && Number.isInteger(x / y) ? x / y : null),
    };

    interface QueueItem {
      value: number;
      expr: string;
      depth: number;
    }

    let queue: QueueItem[] = [
      { value: a, expr: 'a', depth: 0 },
      { value: b, expr: 'b', depth: 0 },
    ];
    let seen = new Set<number>([a, b]);

    while (queue.length > 0) {
      const { value, expr, depth } = queue.shift()!;

      if (depth >= this.maxDepth) continue;

      for (const [op, func] of Object.entries(operations)) {
        // Thử với a
        const newValueA = func(value, a);
        if (newValueA !== null) {
          const newExprA = `(${expr} ${op} a)`;
          if (newValueA === target) {
            return newExprA
              .replace(/a/g, a.toString())
              .replace(/b/g, b.toString());
          }
          if (!seen.has(newValueA)) {
            seen.add(newValueA);
            queue.push({ value: newValueA, expr: newExprA, depth: depth + 1 });
          }
        }

        // Thử với b
        const newValueB = func(value, b);
        if (newValueB !== null) {
          const newExprB = `(${expr} ${op} b)`;
          if (newValueB === target) {
            return newExprB
              .replace(/a/g, a.toString())
              .replace(/b/g, b.toString());
          }
          if (!seen.has(newValueB)) {
            seen.add(newValueB);
            queue.push({ value: newValueB, expr: newExprB, depth: depth + 1 });
          }
        }
      }
    }
    return null;
  }

  // 2. Phương pháp phân tích số nguyên tố
  private primeFactorization(
    a: number,
    b: number,
    target: number
  ): string | null {
    const primeFactors = this.getPrimeFactors(target);
    if (primeFactors.length === 0) return null;

    this.addStep(
      this.translate.instant(
        'OTHER_TOOLS.NUMERICAL_ANALYSIS.PRIME_FACTOR_STEP',
        {
          target: target,
          factors: primeFactors.join(' × '),
        }
      )
    );

    // Tìm biểu thức cho từng số nguyên tố
    const expressions: string[] = [];
    for (const prime of primeFactors) {
      const expr = this.generateExpression(a, b, prime);
      if (!expr) return null;
      expressions.push(expr);
    }

    // Kết hợp các biểu thức
    return expressions.join(' * ');
  }

  private getPrimeFactors(n: number): number[] {
    const factors: number[] = [];
    let num = n;

    for (let i = 2; i <= Math.sqrt(num); i++) {
      while (num % i === 0) {
        factors.push(i);
        num /= i;
      }
    }

    if (num > 1) factors.push(num);
    return factors;
  }

  // 3. Phương pháp phân tích thập phân
  private decimalDecomposition(
    a: number,
    b: number,
    target: number
  ): string | null {
    const digits = target.toString().split('').map(Number);
    const powers = Array.from({ length: digits.length }, (_, i) =>
      Math.pow(10, digits.length - i - 1)
    );

    this.addStep(
      this.translate.instant('OTHER_TOOLS.NUMERICAL_ANALYSIS.DECIMAL_STEP', {
        target: target,
      })
    );
    this.addStep(digits.map((d, i) => `${d}×${powers[i]}`).join(' + '));

    const expressions: string[] = [];
    for (let i = 0; i < digits.length; i++) {
      const value = digits[i] * powers[i];
      if (value === 0) continue;

      const expr = this.generateExpression(a, b, value);
      if (!expr) return null;
      expressions.push(expr);
    }

    return expressions.join(' + ');
  }

  // 4. Phương pháp đồng dư
  private moduloMethod(a: number, b: number, target: number): string | null {
    const modulos = [2, 3, 5, 7, 11];
    const remainders: number[] = [];

    for (const mod of modulos) {
      remainders.push(target % mod);
    }

    this.addStep('Phân tích theo đồng dư:');
    modulos.forEach((mod, i) => {
      this.addStep(`${target} ≡ ${remainders[i]} (mod ${mod})`);
    });

    // Tìm biểu thức cho số dư
    for (let i = 0; i < modulos.length; i++) {
      const expr = this.generateExpression(a, b, remainders[i]);
      if (expr) {
        // Thử tìm biểu thức cho phần nguyên
        const quotient = Math.floor(target / modulos[i]);
        const quotientExpr = this.generateExpression(a, b, quotient);
        if (quotientExpr) {
          return `(${quotientExpr}) * ${modulos[i]} + (${expr})`;
        }
      }
    }

    return null;
  }

  // 5. Phương pháp gặp giữa
  private meetInMiddle(a: number, b: number, target: number): string | null {
    const mid = Math.floor(target / 2);

    this.addStep(`Chia ${target} thành hai phần: ${mid} và ${target - mid}`);

    // Tìm biểu thức cho nửa đầu
    const leftExpr = this.generateExpression(a, b, mid);
    if (!leftExpr) return null;

    // Tìm biểu thức cho nửa sau
    const rightExpr = this.generateExpression(a, b, target - mid);
    if (!rightExpr) return null;

    return `(${leftExpr}) + (${rightExpr})`;
  }

  // 7. Phương pháp bậc thang
  private ladderMethod(a: number, b: number, target: number): string | null {
    // Định nghĩa số 10 từ a và b
    const ten = this.generateExpression(a, b, 10);
    if (!ten) return null;
    this.addStep(`Định nghĩa số 10: 10 = ${ten}`);

    // Định nghĩa số 100 từ số 10
    const hundred = `(${ten}) * (${ten})`;
    this.addStep(`Định nghĩa số 100: 100 = ${hundred}`);

    // Định nghĩa số 1000 từ số 10 và 100
    const thousand = `(${ten}) * (${hundred})`;
    this.addStep(`Định nghĩa số 1000: 1000 = ${thousand}`);

    const ladders = [
      { base: a, steps: [ten, hundred, thousand] },
      { base: b, steps: [ten, hundred, thousand] },
    ];

    for (const ladder of ladders) {
      for (const step of ladder.steps) {
        const baseVar = ladder.base === a ? 'a' : 'b';
        const expr = `(${baseVar} * (${step}))`;

        // Tính giá trị để kiểm tra
        const value =
          ladder.base * (step === ten ? 10 : step === hundred ? 100 : 1000);

        if (value <= target) {
          const remainder = target - value;
          const remainderExpr = this.generateExpression(a, b, remainder);
          if (remainderExpr) {
            const finalExpr = `${expr} + (${remainderExpr})`;

            // Thêm bước giải thích
            this.addStep(`Chia ${target} thành hai phần:`);
            this.addStep(`- Phần 1: ${baseVar} * ${step} = ${value}`);
            this.addStep(`- Phần 2: ${remainder}`);
            this.addStep(`Kết hợp hai phần: ${finalExpr}`);

            return finalExpr;
          }
        }
      }
    }
    return null;
  }

  // 8. Phương pháp chia để trị
  private divideAndConquer(
    a: number,
    b: number,
    target: number
  ): string | null {
    if (target <= Math.max(a, b)) {
      return this.generateExpression(a, b, target);
    }

    // Chia số thành các phần nhỏ hơn
    for (let i = 2; i <= Math.sqrt(target); i++) {
      if (target % i === 0) {
        const part1 = i;
        const part2 = target / i;

        this.addStep(`Chia ${target} thành ${part1} × ${part2}`);

        const expr1 = this.generateExpression(a, b, part1);
        const expr2 = this.generateExpression(a, b, part2);

        if (expr1 && expr2) {
          return `(${expr1}) * (${expr2})`;
        }
      }
    }

    return null;
  }

  private addStep(step: string) {
    if (this.showSteps) {
      this.steps.push(step);
    }
  }
}
