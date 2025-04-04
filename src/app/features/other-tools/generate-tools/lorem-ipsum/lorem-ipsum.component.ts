import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  vnNounWords,
  vnVerbs,
  vnAdjectives,
  vnConjunctions,
  vnCommonWords,
} from './vietnamese-words';

type GenerationMethod = 'pattern' | 'syllable' | 'classic' | 'vietnamese';

interface Notification {
  message: string;
  type: 'success' | 'error';
  id: number;
}

@Component({
  selector: 'app-lorem-ipsum',
  standalone: true,
  imports: [FormsModule, CommonModule, TranslateModule],
  templateUrl: './lorem-ipsum.component.html',
  styleUrl: './lorem-ipsum.component.css',
})
export class LoremIpsumComponent {
  private translate = inject(TranslateService);
  
  wordCount: number = 50;
  paragraphCount: number = 1;
  generatedText: string = '';
  selectedMethod: GenerationMethod = 'pattern';
  notifications: Notification[] = [];
  private notificationId = 0;

  // Pattern-based generation
  private readonly consonants = 'bcdfghjklmnpqrstvwxyz'.split('');
  private readonly vowels = 'aeiou'.split('');
  private readonly patterns = ['CVCV', 'CVCCV', 'CVCVC', 'CVCC', 'CVC'];
  private readonly punctuation = ['.', ',', '?', '!'];
  private readonly conjunctions = [
    'and',
    'or',
    'but',
    'yet',
    'for',
    'nor',
    'so',
  ];

  // Vietnamese text generation
  private readonly vnInitials = [
    'b',
    't',
    'th',
    'đ',
    'ch',
    'kh',
    'g',
    'h',
    'l',
    'm',
    'n',
    'nh',
    'ph',
    'r',
    's',
    'x',
    'tr',
    'v',
    '',
  ];

  private readonly vnMedials = [
    'a',
    'ă',
    'â',
    'e',
    'ê',
    'i',
    'o',
    'ô',
    'ơ',
    'u',
    'ư',
    'y',
    'ai',
    'ao',
    'eo',
    'ia',
    'iê',
    'oa',
    'ôi',
    'ơi',
    'ua',
    'ưa',
    'uy',
  ];

  private readonly vnFinals = ['c', 'ch', 'm', 'n', 'ng', 'nh', 'p', 't', ''];

  private readonly vnnounWords = vnNounWords;
  private readonly vnVerbs = vnVerbs;
  private readonly vnAdjectives = vnAdjectives;
  private readonly vnConjunctions = vnConjunctions;
  private readonly vnCommonWords = vnCommonWords;

  // Classic Lorem Ipsum
  private readonly classicText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

  // Vietnamese classic text
  private readonly vnClassicText = `Tôi thấy hoa vàng trên cỏ xanh, những cánh hoa rung rinh trong gió sớm mai. Mặt trời đã lên cao, ánh nắng dịu dàng len lỏi qua từng kẽ lá. Tiếng chim hót véo von trên cành, hòa cùng tiếng gió thì thầm kể chuyện đất trời. Mùa xuân đến mang theo sức sống mới, cỏ cây đâm chồi nảy lộc, đất trời như thay áo mới. Tôi ngồi đây, lặng ngắm và cảm nhận từng khoảnh khắc quý giá của thiên nhiên ban tặng.`;

  // Syllable generation
  private readonly prefixes = [
    'con',
    'pre',
    'in',
    'un',
    'dis',
    'ex',
    're',
    'de',
  ];
  private readonly roots = [
    'duct',
    'form',
    'port',
    'spect',
    'tract',
    'vert',
    'mit',
    'cess',
  ];
  private readonly suffixes = [
    'ion',
    'ment',
    'ance',
    'ence',
    'able',
    'ible',
    'ive',
    'ous',
  ];

  private generateVietnameseSyllable(): string {
    const initial =
      this.vnInitials[Math.floor(Math.random() * this.vnInitials.length)];
    const medial =
      this.vnMedials[Math.floor(Math.random() * this.vnMedials.length)];
    const final =
      this.vnFinals[Math.floor(Math.random() * this.vnFinals.length)];
    return initial + medial + final;
  }

  private generateVietnameseWord(): string {
    // 60% chance to use common word, 40% chance to generate new syllable
    if (Math.random() < 0.6) {
      const wordLists = [this.vnCommonWords, this.vnVerbs, this.vnAdjectives];
      const selectedList =
        wordLists[Math.floor(Math.random() * wordLists.length)];
      return selectedList[Math.floor(Math.random() * selectedList.length)];
    }

    // 30% chance for compound word (two syllables)
    if (Math.random() < 0.3) {
      return (
        this.generateVietnameseSyllable() +
        ' ' +
        this.generateVietnameseSyllable()
      );
    }

    return this.generateVietnameseSyllable();
  }

  private generateVietnameseSentence(): string {
    // Chọn ngẫu nhiên một trong các mẫu câu
    const sentencePatterns = [
      this.generateSimpleSentence,
      this.generateCompoundSentence,
      this.generateComplexSentence,
      this.generateDescriptiveSentence,
    ];

    const selectedPattern =
      sentencePatterns[Math.floor(Math.random() * sentencePatterns.length)];
    return selectedPattern.call(this);
  }

  private generateSimpleSentence(): string {
    // Mẫu: Chủ ngữ + Vị ngữ + Tân ngữ/Bổ ngữ
    const subject = this.getRandomWord(this.vnnounWords);
    const verb = this.getRandomWord(this.vnVerbs);
    const object = this.getRandomWord(this.vnnounWords);
    const adjective =
      Math.random() > 0.5 ? ` ${this.getRandomWord(this.vnAdjectives)}` : '';

    return `${subject} ${verb}${adjective} ${object}`;
  }

  private generateCompoundSentence(): string {
    // Mẫu: Câu đơn + Liên từ + Câu đơn
    const firstClause = this.generateSimpleSentence();
    const conjunction = this.getRandomWord(this.vnConjunctions);
    const secondClause = this.generateSimpleSentence();

    return `${firstClause} ${conjunction} ${secondClause}`;
  }

  private generateComplexSentence(): string {
    // Mẫu: Khi/Nếu/Vì + Câu đơn + Liên từ + Câu đơn
    const timeWords = ['khi', 'lúc', 'trong lúc', 'sau khi'];
    const timeWord = timeWords[Math.floor(Math.random() * timeWords.length)];
    const subordinateClause = this.generateSimpleSentence().toLowerCase();
    const mainClause = this.generateSimpleSentence().toLowerCase();

    return `${timeWord} ${subordinateClause}, ${mainClause}`;
  }

  private generateDescriptiveSentence(): string {
    // Mẫu: Chủ ngữ + là/trở nên + Tính từ/Trạng thái
    const subject = this.getRandomWord(this.vnnounWords);
    const linkingVerb = Math.random() > 0.5 ? 'là' : 'trở nên';
    const adjective = this.getRandomWord(this.vnAdjectives);
    const adverbial =
      Math.random() > 0.7 ? ` ${this.getRandomWord(this.vnCommonWords)}` : '';

    return `${subject} ${linkingVerb} ${adjective}${adverbial}`;
  }

  private generateVietnameseText(): string {
    const paragraphs: string[] = [];
    const wordsPerParagraph = Math.floor(this.wordCount / this.paragraphCount);
    const remainingWords = this.wordCount % this.paragraphCount;

    for (let p = 0; p < this.paragraphCount; p++) {
      const sentences: string[] = [];
      const paragraphWordCount =
        p === 0 ? wordsPerParagraph + remainingWords : wordsPerParagraph;
      let currentWordCount = 0;

      while (currentWordCount < paragraphWordCount) {
        const sentence = this.generateVietnameseSentence();
        const sentenceWords = sentence.split(' ').length;

        if (currentWordCount + sentenceWords <= paragraphWordCount) {
          sentences.push(sentence);
          currentWordCount += sentenceWords;
        } else {
          break;
        }
      }

      // Thêm dấu câu và viết hoa chữ đầu
      const formattedSentences = sentences.map((sentence, index) => {
        const punctuation = this.getRandomPunctuation();
        return index === 0
          ? this.capitalize(sentence) + punctuation
          : sentence.toLowerCase() + punctuation;
      });

      paragraphs.push(formattedSentences.join(' '));
    }

    return paragraphs.join('\n\n');
  }

  private getRandomWord(wordArray: string[]): string {
    return wordArray[Math.floor(Math.random() * wordArray.length)];
  }

  private getRandomPunctuation(): string {
    const weights = [0.7, 0.2, 0.1]; // Tỷ lệ cho dấu . ? !
    const random = Math.random();
    if (random < weights[0]) return '.';
    if (random < weights[0] + weights[1]) return '?';
    return '!';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private generateVietnameseClassicText(): string {
    const sentences = this.vnClassicText
      .split(/[.!?]+/)
      .filter((s) => s.trim());
    const result: string[] = [];
    let currentLength = 0;
    const targetLength = this.wordCount;

    while (currentLength < targetLength && sentences.length > 0) {
      const sentence =
        sentences[Math.floor(Math.random() * sentences.length)].trim();
      const words = sentence.split(/\s+/);

      if (currentLength + words.length <= targetLength) {
        result.push(sentence + '.');
        currentLength += words.length;
      } else {
        break;
      }
    }

    // Distribute into paragraphs
    const paragraphs: string[] = [];
    const sentencesPerParagraph = Math.ceil(
      result.length / this.paragraphCount
    );

    for (let i = 0; i < this.paragraphCount; i++) {
      const start = i * sentencesPerParagraph;
      const end = Math.min(start + sentencesPerParagraph, result.length);
      const paragraph = result.slice(start, end).join(' ');
      if (paragraph) {
        paragraphs.push(paragraph);
      }
    }

    return paragraphs.join('\n\n');
  }

  // Pattern-based methods
  private generatePatternWord(pattern: string): string {
    return pattern
      .split('')
      .map((char) => {
        if (char === 'C') {
          return this.consonants[
            Math.floor(Math.random() * this.consonants.length)
          ];
        } else if (char === 'V') {
          return this.vowels[Math.floor(Math.random() * this.vowels.length)];
        }
        return char;
      })
      .join('');
  }

  private generatePatternText(): string {
    const paragraphs: string[] = [];
    const wordsPerParagraph = Math.floor(this.wordCount / this.paragraphCount);
    const remainingWords = this.wordCount % this.paragraphCount;

    for (let p = 0; p < this.paragraphCount; p++) {
      const paragraphWordCount =
        p === 0 ? wordsPerParagraph + remainingWords : wordsPerParagraph;
      const words: string[] = [];
      let sentenceLength = 0;
      let isNewSentence = true;

      for (let i = 0; i < paragraphWordCount; i++) {
        if (Math.random() < 0.1 && !isNewSentence && sentenceLength > 3) {
          words.push(
            this.conjunctions[
              Math.floor(Math.random() * this.conjunctions.length)
            ]
          );
          continue;
        }

        const pattern =
          this.patterns[Math.floor(Math.random() * this.patterns.length)];
        let word = this.generatePatternWord(pattern);

        if (isNewSentence) {
          word = this.capitalize(word);
          isNewSentence = false;
        }

        words.push(word);
        sentenceLength++;

        if (sentenceLength >= 4 && Math.random() < 0.2) {
          const punct =
            this.punctuation[
              Math.floor(Math.random() * this.punctuation.length)
            ];
          words[words.length - 1] += punct;

          if (punct === '.' || punct === '?' || punct === '!') {
            isNewSentence = true;
            sentenceLength = 0;
          }
        }
      }

      if (!this.punctuation.some((p) => words[words.length - 1].endsWith(p))) {
        words[words.length - 1] += '.';
      }

      paragraphs.push(words.join(' ').trim());
    }

    return paragraphs.join('\n\n');
  }

  private generateSyllableText(): string {
    const paragraphs: string[] = [];
    const wordsPerParagraph = Math.floor(this.wordCount / this.paragraphCount);
    const remainingWords = this.wordCount % this.paragraphCount;

    for (let p = 0; p < this.paragraphCount; p++) {
      const paragraphWordCount =
        p === 0 ? wordsPerParagraph + remainingWords : wordsPerParagraph;
      const words: string[] = [];
      let sentenceLength = 0;
      let isNewSentence = true;

      for (let i = 0; i < paragraphWordCount; i++) {
        let word = this.generateSyllableWord();

        if (isNewSentence) {
          word = this.capitalize(word);
          isNewSentence = false;
        }

        words.push(word);
        sentenceLength++;

        if (sentenceLength >= 4 && Math.random() < 0.2) {
          const punct =
            this.punctuation[
              Math.floor(Math.random() * this.punctuation.length)
            ];
          words[words.length - 1] += punct;

          if (punct === '.' || punct === '?' || punct === '!') {
            isNewSentence = true;
            sentenceLength = 0;
          }
        }
      }

      if (!this.punctuation.some((p) => words[words.length - 1].endsWith(p))) {
        words[words.length - 1] += '.';
      }

      paragraphs.push(words.join(' ').trim());
    }

    return paragraphs.join('\n\n');
  }

  private generateClassicText(): string {
    const words = this.classicText.split(/\s+/);
    const wordsPerParagraph = Math.floor(this.wordCount / this.paragraphCount);
    const remainingWords = this.wordCount % this.paragraphCount;
    const paragraphs: string[] = [];

    let startIndex = 0;
    for (let p = 0; p < this.paragraphCount; p++) {
      const paragraphWordCount =
        p === 0 ? wordsPerParagraph + remainingWords : wordsPerParagraph;
      const endIndex = Math.min(startIndex + paragraphWordCount, words.length);
      const paragraphWords = words.slice(startIndex, endIndex);

      if (paragraphWords.length > 0) {
        paragraphs.push(paragraphWords.join(' '));
      }

      startIndex = endIndex;
      if (startIndex >= words.length) break;
    }

    return paragraphs.join('\n\n') + (startIndex < words.length ? '...' : '');
  }

  private generateSyllableWord(): string {
    const usePrefix = Math.random() > 0.5;
    const useSuffix = Math.random() > 0.5;

    const prefix = usePrefix
      ? this.prefixes[Math.floor(Math.random() * this.prefixes.length)]
      : '';
    const root = this.roots[Math.floor(Math.random() * this.roots.length)];
    const suffix = useSuffix
      ? this.suffixes[Math.floor(Math.random() * this.suffixes.length)]
      : '';

    return prefix + root + suffix;
  }

  private showNotification(message: string, type: 'success' | 'error'): void {
    const notification: Notification = {
      message,
      type,
      id: this.notificationId++,
    };
    this.notifications.push(notification);

    setTimeout(() => {
      this.notifications = this.notifications.filter(
        (n) => n.id !== notification.id
      );
    }, 3000);
  }

  generateText(): void {
    try {
      switch (this.selectedMethod) {
        case 'pattern':
          this.generatedText = this.generatePatternText();
          break;
        case 'syllable':
          this.generatedText = this.generateSyllableText();
          break;
        case 'classic':
          this.generatedText = this.generateClassicText();
          break;
        case 'vietnamese':
          if (Math.random() > 0.5) {
            this.generatedText = this.generateVietnameseText();
          } else {
            this.generatedText = this.generateVietnameseClassicText();
          }
          break;
      }
      this.showNotification('Text generated successfully!', 'success');
    } catch (error) {
      this.showNotification(
        'Failed to generate text. Please try again.',
        'error'
      );
    }
  }

  copyToClipboard(): void {
    if (!this.generatedText) return;

    navigator.clipboard
      .writeText(this.generatedText)
      .then(() => {
        this.showNotification(
          this.translate.instant('SUCCESS.COPIED'),
          'success'
        );
      })
      .catch(() => {
        this.showNotification(
          this.translate.instant('ERROR.COPY_FAILED'),
          'error'
        );
      });
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }
}
