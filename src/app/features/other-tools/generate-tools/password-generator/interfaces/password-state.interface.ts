export interface EmojiCategories {
  smileys: boolean;
  animals: boolean;
  foods: boolean;
  symbols: boolean;
  transport: boolean;
}

export interface PasswordOptions {
  length: number;
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSpecialChars: boolean;
  excludeSimilarChars: boolean;
  avoidRepeatingChars: boolean;
  avoidSequentialChars: boolean;
  ensureAllTypes: boolean;
  maxIdenticalChars: number;
  includeEmojis: boolean;
  emojiCategories: EmojiCategories;
  maxEmojis: number; // Giới hạn số lượng emoji
}

export interface PasswordHistory {
  password: string;
  timestamp: Date;
  strength: number;
}

export interface PasswordState {
  currentPassword: string;
  options: PasswordOptions;
  strength: {
    score: number;
    label: 'weak' | 'medium' | 'strong' | 'very-strong';
    suggestions: string[];
    estimatedCrackTime: string;
  };
  isPasswordVisible: boolean;
  history: PasswordHistory[];
  isCopied: boolean;
  error: string | null;
  customPassword: {
    value: string;
    strength: {
      score: number;
      label: 'weak' | 'medium' | 'strong' | 'very-strong';
      suggestions: string[];
      estimatedCrackTime: string;
    } | null;
  };
}
