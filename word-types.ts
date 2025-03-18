export type WordContext =
  | 'physical' // vật lý
  | 'color' // màu sắc
  | 'emotion' // cảm xúc
  | 'intellectual' // trí tuệ
  | 'quality' // chất lượng
  | 'time' // thời gian
  | 'space' // không gian
  | 'quantity' // số lượng
  | 'social' // xã hội
  | 'nature' // thiên nhiên
  | 'technology' // công nghệ
  | 'culture' // văn hóa
  | 'daily' // sinh hoạt
  | 'business' // kinh doanh
  | 'education' // giáo dục
  | 'health'; // sức khỏe
  | 'human'; // con người
  
export interface Word {
  value: string;
  contexts: WordContext[];
}

export interface SentencePattern {
  subject: WordContext[];
  verb: WordContext[];
  object?: WordContext[];
  adjective?: WordContext[];
}
