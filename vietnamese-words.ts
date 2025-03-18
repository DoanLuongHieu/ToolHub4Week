import { Word, WordContext } from './word-types';

export const vnNounWords: Record<WordContext, Word[]> = {
  physical: [
    { value: 'cái bàn', contexts: ['physical'] },
    { value: 'cái ghế', contexts: ['physical'] },
    // ...
  ],
  nature: [
    { value: 'cây cối', contexts: ['nature'] },
    { value: 'hoa lá', contexts: ['nature'] },
    // ...
  ],
  // ... các ngữ cảnh khác
};

export const vnVerbs: Record<WordContext, Word[]> = {
  physical: [
    { value: 'di chuyển', contexts: ['physical'] },
    { value: 'nâng', contexts: ['physical'] },
    // ...
  ],
  emotion: [
    { value: 'yêu', contexts: ['emotion'] },
    { value: 'ghét', contexts: ['emotion'] },
    // ...
  ],
  // ... các ngữ cảnh khác
};

export const vnAdjectives: Record<WordContext, Word[]> = {
  physical: [
    { value: 'to', contexts: ['physical'] },
    { value: 'nhỏ', contexts: ['physical'] },
    // ...
  ],
  color: [
    { value: 'đỏ', contexts: ['color'] },
    { value: 'xanh', contexts: ['color'] },
    // ...
  ],
  // ... các ngữ cảnh khác
};
