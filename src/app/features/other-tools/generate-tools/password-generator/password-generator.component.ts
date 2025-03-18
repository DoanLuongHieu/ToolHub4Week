import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordGeneratorService } from './services/password-generator.service';
import {
  PasswordState,
  PasswordOptions,
  EmojiCategories,
} from './interfaces/password-state.interface';
import { ThemeService } from '../../../../core/services/theme.service';
import { LanguageService } from '../../../../core/services/language.service';

@Component({
  selector: 'app-password-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './password-generator.component.html',
  styleUrl: './password-generator.component.css',
})
export class PasswordGeneratorComponent implements OnInit {
  private passwordService = inject(PasswordGeneratorService);
  private themeService = inject(ThemeService);
  private languageService = inject(LanguageService);

  isDarkTheme = this.themeService.getCurrentTheme();
  currentLang = this.languageService.getCurrentLang();

  state = signal<PasswordState>({
    currentPassword: '',
    options: {
      length: 16,
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSpecialChars: true,
      excludeSimilarChars: false,
      avoidRepeatingChars: false,
      avoidSequentialChars: false,
      ensureAllTypes: true,
      maxIdenticalChars: 2,
      includeEmojis: false,
      emojiCategories: {
        smileys: true,
        animals: true,
        foods: true,
        symbols: true,
        transport: true,
      },
      maxEmojis: 3,
    },
    strength: {
      score: 0,
      label: 'weak',
      suggestions: [],
      estimatedCrackTime: '',
    },
    isPasswordVisible: false,
    history: [],
    isCopied: false,
    error: null,
    customPassword: {
      value: '',
      strength: null,
    },
  });

  ngOnInit(): void {
    this.generatePassword();
  }

  generatePassword(): void {
    try {
      const password = this.passwordService.generatePassword(
        this.state().options
      );
      const strength = this.passwordService.evaluateStrength(password);

      this.state.update((state) => ({
        ...state,
        currentPassword: password,
        strength,
        error: null,
        isCopied: false,
        history: [
          {
            password,
            timestamp: new Date(),
            strength: strength.score,
          },
          ...state.history.slice(0, 99), // Keep only last 100 passwords
        ],
      }));
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }

  async copyToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.state().currentPassword);
      this.state.update((state) => ({ ...state, isCopied: true }));

      // Clear clipboard after 1 minute
      setTimeout(() => {
        navigator.clipboard.writeText('');
      }, 60000);

      // Reset copied status after 2 seconds
      setTimeout(() => {
        this.state.update((state) => ({ ...state, isCopied: false }));
      }, 2000);
    } catch (error) {
      this.state.update((state) => ({
        ...state,
        error: 'Failed to copy to clipboard',
      }));
    }
  }

  togglePasswordVisibility(): void {
    this.state.update((state) => ({
      ...state,
      isPasswordVisible: !state.isPasswordVisible,
    }));
  }

  updateOptions(updates: Partial<PasswordOptions>): void {
    this.state.update((state) => ({
      ...state,
      options: { ...state.options, ...updates },
    }));
    this.generatePassword();
  }

  generateMultiplePasswords(count: number): string[] {
    const passwords: string[] = [];
    for (let i = 0; i < count; i++) {
      try {
        passwords.push(
          this.passwordService.generatePassword(this.state().options)
        );
      } catch (error) {
        console.error('Error generating password:', error);
      }
    }
    return passwords;
  }

  exportPasswords(): void {
    const passwords = this.generateMultiplePasswords(10); // Generate 10 passwords
    const content = passwords.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated-passwords.txt';
    link.click();

    URL.revokeObjectURL(url);
  }

  clearHistory(): void {
    this.state.update((state) => ({ ...state, history: [] }));
  }

  handleLengthChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.updateOptions({ length: +input.value });
  }

  handleCheckboxChange(event: Event, optionKey: keyof PasswordOptions): void {
    const checkbox = event.target as HTMLInputElement;
    this.updateOptions({ [optionKey]: checkbox.checked });
  }

  checkCustomPassword(event: Event): void {
    const input = event.target as HTMLInputElement;
    const password = input.value;

    if (!password) {
      this.state.update((state) => ({
        ...state,
        customPassword: {
          value: '',
          strength: null,
        },
      }));
      return;
    }

    const strength = this.passwordService.evaluateStrength(password);

    this.state.update((state) => ({
      ...state,
      customPassword: {
        value: password,
        strength,
      },
    }));
  }

  handleEmojiCategoryChange(
    event: Event,
    category: keyof EmojiCategories
  ): void {
    const checkbox = event.target as HTMLInputElement;
    this.state.update((state) => ({
      ...state,
      options: {
        ...state.options,
        emojiCategories: {
          ...state.options.emojiCategories,
          [category]: checkbox.checked,
        },
      },
    }));
    this.generatePassword();
  }

  handleMaxEmojisChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Math.min(Math.max(+input.value, 1), 5); // Giới hạn từ 1-5
    this.state.update((state) => ({
      ...state,
      options: {
        ...state.options,
        maxEmojis: value,
      },
    }));
    this.generatePassword();
  }
}
