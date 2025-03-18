import re

# Đọc file với encoding UTF-8
with open('src/app/features/other-tools/generate-tools/lorem-ipsum/words.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Sử dụng regex để tìm các từ trong chuỗi JSON
# Pattern: { "text": "([^"]+)" }
# Nhóm capture ([^"]+) sẽ bắt tất cả ký tự không phải dấu ngoặc kép
words = re.findall(r'{ "text": "([^"]+)" }', content)

# Ghi các từ vào file mới, mỗi từ một dòng
with open('src/app/features/other-tools/generate-tools/lorem-ipsum/word_new.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(words)) 