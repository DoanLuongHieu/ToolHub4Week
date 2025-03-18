import { Injectable } from '@angular/core';
import { PasswordOptions } from '../interfaces/password-state.interface';

@Injectable({
  providedIn: 'root',
})
export class PasswordGeneratorService {
  private readonly LOWERCASE_CHARS = 'abcdefghijkmnopqrstuvwxyz';
  private readonly UPPERCASE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  private readonly NUMBER_CHARS = '23456789';
  private readonly SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  private readonly SIMILAR_CHARS = 'il1Lo0O';

  private readonly EMOJI_SETS = {
    smileys: [
      '😀',
      '😊',
      '😎',
      '🙂',
      '😄',
      '😅',
      '😂',
      '🤣',
      '😇',
      '🥰',
      '😍',
      '🤩',
      '😘',
      '🤗',
      '🤔',
      '🤭',
      '🤫',
      '🤥',
      '🤤',
      '🤢',
      '🤧',
      '🤒',
      '🤕',
      '🤖',
      '🤗',
      '🤘',
      '🤙',
      '🤚',
      '🤛',
      '🤜',
      '🤝',
      '🤞',
      '🤟',
      '🤠',
      '🤡',
      '🤢',
      '🤣',
      '🤤',
      '🤥',
      '🤦',
      '🤧',
      '��',
      '🤩',
      '🤪',
      '🤫',
      '🤭',
      '🤮',
      '🤯',
      '🤰',
      '🤱',
      '🤲',
      '🤳',
      '🤴',
      '🤵',
      '🤶',
      '🤷',
    ],
    animals: [
      '🐶',
      '🐱',
      '🦁',
      '🐼',
      '🐨',
      '🐯',
      '🦊',
      '🐮',
      '🐷',
      '🐸',
      '🐙',
      '🦄',
      '🦋',
      '🐵',
      '🐻',
      '🐼',
      '🐻‍❄️',
      '🐨',
      '🐯',
      '🦊',
      '🐮',
      '🐷',
      '🐸',
      '🐙',
      '🦄',
      '🦋',
    ],
    foods: [
      '🍎',
      '🍕',
      '🍣',
      '🍔',
      '🍦',
      '🍪',
      '🍩',
      '🍗',
      '🥐',
      '🥨',
      '🥯',
      '🥖',
      '🥞',
      '🧇',
      '🧀',
      '🍳',
      '🍞',
      '🥚',
      '🍳',
      '🍔',
      '🍟',
      '🍕',
      '🍣',
      '🍤',
      '🍝',
      '🍜',
      '🍲',
      '🍛',
      '🍚',
      '🍙',
      '🍘',
    ],
    symbols: [
      '❤️',
      '⭐',
      '💫',
      '🌟',
      '💡',
      '💎',
      '🎯',
      '🎨',
      '🎭',
      '🎪',
      '🎰',
      '🎲',
      '🔮',
      '🎱',
      '🎳',
      '🎰',
      '🎲',
      '🎳',
    ],
    transport: [
      '🚗',
      '🚕',
      '🚙',
      '🚌',
      '🚎',
      '🏎',
      '🚓',
      '🚑',
      '🚒',
      '🚐',
      '🚚',
      '🚛',
      '🚜',
      '🚲',
      '🛴',
      '🚲',
      '🛵',
      '🏍',
      '🛺',
    ],
  };

  generatePassword(options: PasswordOptions): string {
    let chars = '';
    let password = '';
    let requiredChars: string[] = [];

    // Add character sets based on options
    if (options.includeLowercase) {
      chars += this.LOWERCASE_CHARS;
      requiredChars.push(this.getRandomChar(this.LOWERCASE_CHARS));
    }
    if (options.includeUppercase) {
      chars += this.UPPERCASE_CHARS;
      requiredChars.push(this.getRandomChar(this.UPPERCASE_CHARS));
    }
    if (options.includeNumbers) {
      chars += this.NUMBER_CHARS;
      requiredChars.push(this.getRandomChar(this.NUMBER_CHARS));
    }
    if (options.includeSpecialChars) {
      chars += this.SPECIAL_CHARS;
      requiredChars.push(this.getRandomChar(this.SPECIAL_CHARS));
    }

    // Remove similar characters if option is selected
    if (options.excludeSimilarChars) {
      chars = this.removeSimilarChars(chars);
    }

    if (chars.length === 0 && !options.includeEmojis) {
      throw new Error('At least one character type must be selected');
    }

    // Get emojis if option is enabled
    let selectedEmojis: string[] = [];
    if (options.includeEmojis) {
      selectedEmojis = this.getRandomEmojis(options);
      if (selectedEmojis.length > 0) {
        requiredChars.push(...selectedEmojis);
      }
    }

    // Calculate remaining length after required chars
    const remainingLength = options.length - requiredChars.length;
    if (remainingLength < 0) {
      throw new Error('Password length is too short for selected options');
    }

    // Generate initial password
    for (let i = 0; i < remainingLength; i++) {
      password += this.getRandomChar(chars);
    }

    // Add required characters
    password += requiredChars.join('');

    // Shuffle the password
    password = this.shuffleString(password);

    // Apply additional constraints
    if (options.avoidRepeatingChars) {
      password = this.avoidRepeatingChars(password, options);
    }
    if (options.avoidSequentialChars) {
      password = this.avoidSequentialChars(password, options);
    }

    return password;
  }

  private getRandomEmojis(options: PasswordOptions): string[] {
    const emojis: string[] = [];
    const availableCategories = Object.entries(options.emojiCategories)
      .filter(([_, enabled]) => enabled)
      .map(([category]) => category);

    if (availableCategories.length === 0) return emojis;

    const numEmojis = Math.min(
      Math.floor(options.length * 0.25), // Max 25% of password length
      options.maxEmojis
    );

    for (let i = 0; i < numEmojis; i++) {
      const category =
        availableCategories[
          Math.floor(Math.random() * availableCategories.length)
        ];
      const categoryEmojis =
        this.EMOJI_SETS[category as keyof typeof this.EMOJI_SETS];
      emojis.push(
        categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)]
      );
    }

    return emojis;
  }

  evaluateStrength(password: string): {
    score: number;
    label: 'weak' | 'medium' | 'strong' | 'very-strong';
    suggestions: string[];
    estimatedCrackTime: string;
  } {
    let score = 0;
    const suggestions: string[] = [];

    // Base score on length
    score += password.length * 4;

    // Check for various character types
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;

    // Additional points for emojis
    const emojiCount = (password.match(/\p{Emoji}/gu) || []).length;
    score += emojiCount * 15; // Emojis add significant complexity

    // Normalize score to 0-100
    score = Math.min(100, score);

    // Generate suggestions
    if (!/[a-z]/.test(password)) suggestions.push('Add lowercase letters');
    if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters');
    if (!/[0-9]/.test(password)) suggestions.push('Add numbers');
    if (!/[^A-Za-z0-9]/.test(password))
      suggestions.push('Add special characters');
    if (emojiCount === 0)
      suggestions.push('Consider adding emojis for extra security');

    // Determine label based on score
    let label: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
    if (score >= 80) label = 'very-strong';
    else if (score >= 60) label = 'strong';
    else if (score >= 40) label = 'medium';

    return {
      score,
      label,
      suggestions,
      estimatedCrackTime: this.calculateCrackTime(password),
    };
  }

  private removeSimilarChars(chars: string): string {
    return chars
      .split('')
      .filter((char) => !this.SIMILAR_CHARS.includes(char))
      .join('');
  }

  private ensureAllCharacterTypes(
    password: string,
    options: PasswordOptions
  ): string {
    let result = password;

    if (options.includeLowercase && !/[a-z]/.test(result)) {
      result = this.replaceRandomChar(result, this.LOWERCASE_CHARS);
    }
    if (options.includeUppercase && !/[A-Z]/.test(result)) {
      result = this.replaceRandomChar(result, this.UPPERCASE_CHARS);
    }
    if (options.includeNumbers && !/[0-9]/.test(result)) {
      result = this.replaceRandomChar(result, this.NUMBER_CHARS);
    }
    if (options.includeSpecialChars && !/[^A-Za-z0-9]/.test(result)) {
      result = this.replaceRandomChar(result, this.SPECIAL_CHARS);
    }

    return result;
  }

  private replaceRandomChar(str: string, chars: string): string {
    const pos = Math.floor(Math.random() * str.length);
    return (
      str.substring(0, pos) +
      chars.charAt(Math.floor(Math.random() * chars.length)) +
      str.substring(pos + 1)
    );
  }

  private avoidRepeatingChars(
    password: string,
    options: PasswordOptions
  ): string {
    let result = password;
    const maxRepeats = options.maxIdenticalChars || 2;

    for (let i = 0; i < result.length - maxRepeats; i++) {
      const char = result[i];
      let repeats = 1;

      for (let j = i + 1; j < result.length && result[j] === char; j++) {
        repeats++;
      }

      if (repeats > maxRepeats) {
        result = this.replaceRandomChar(
          result,
          this.getAvailableChars(options)
        );
        i = -1; // Start over to check new combinations
      }
    }

    return result;
  }

  private avoidSequentialChars(
    password: string,
    options: PasswordOptions
  ): string {
    let result = password;
    const sequences = ['abcdefghijklmnopqrstuvwxyz', '0123456789'];

    for (const sequence of sequences) {
      for (let i = 0; i < result.length - 2; i++) {
        const substr = result.substring(i, i + 3).toLowerCase();
        if (sequence.includes(substr)) {
          result = this.replaceRandomChar(
            result,
            this.getAvailableChars(options)
          );
          i = -1; // Start over to check new combinations
        }
      }
    }

    return result;
  }

  private getAvailableChars(options: PasswordOptions): string {
    let chars = '';
    if (options.includeLowercase) chars += this.LOWERCASE_CHARS;
    if (options.includeUppercase) chars += this.UPPERCASE_CHARS;
    if (options.includeNumbers) chars += this.NUMBER_CHARS;
    if (options.includeSpecialChars) chars += this.SPECIAL_CHARS;
    if (options.excludeSimilarChars) {
      chars = this.removeSimilarChars(chars);
    }
    return chars;
  }

  private calculateCrackTime(password: string): string {
    // Tính toán thời gian crack dựa trên độ phức tạp của mật khẩu
    const length = password.length;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasEmoji = /\p{Emoji}/gu.test(password);

    let possibleChars = 0;
    if (hasLower) possibleChars += 26;
    if (hasUpper) possibleChars += 26;
    if (hasNumber) possibleChars += 10;
    if (hasSpecial) possibleChars += 32;
    if (hasEmoji) possibleChars += 50; // Approximate number for common emojis

    const combinations = Math.pow(possibleChars, length);
    const attemptsPerSecond = 1000000000; // Giả định 1 tỷ attempts/giây

    const seconds = combinations / attemptsPerSecond;

    if (seconds < 1) return 'Less than a second';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`; // 30 days
    if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`; // 1 year
    if (seconds < 315360000) return `${Math.round(seconds / 31536000)} years`; // 10 years
    if (seconds < 3153600000)
      return `${Math.round(seconds / 315360000)} decades`; // 100 years
    if (seconds < 31536000000)
      return `${Math.round(seconds / 3153600000)} centuries`; // 1000 years
    if (seconds < 315360000000)
      return `${Math.round(seconds / 31536000000)} millennia`; // 10000 years

    // Format large numbers with scientific notation for extremely strong passwords
    const years = seconds / 31536000;
    if (years >= 1e15) return `${years.toExponential(2)} years`;

    return `Over ${Math.round(years).toLocaleString()} years`;
  }

  private getRandomChar(chars: string): string {
    return chars.charAt(Math.floor(Math.random() * chars.length));
  }

  private shuffleString(str: string): string {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  }
}
