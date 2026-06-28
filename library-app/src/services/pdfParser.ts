export async function parsePdf(filePath: string): Promise<string> {
  const response = await fetch(filePath);
  const buffer = await response.arrayBuffer();
  const uint8 = new Uint8Array(buffer);

  let text = '';

  for (let i = 0; i < uint8.length - 4; i++) {
    if (uint8[i] === 0x62 && uint8[i + 1] === 0x74 && uint8[i + 2] === 0x20) {
      let j = i + 3;
      while (j < uint8.length - 2 && !(uint8[j] === 0x65 && uint8[j + 1] === 0x74)) {
        j++;
      }
      if (j < uint8.length - 2) {
        const block = extractTextFromBTBlock(uint8, i + 3, j);
        if (block.trim()) {
          text += block + '\n\n';
        }
        i = j;
      }
    }
  }

  if (!text.trim()) {
    text = extractTextViaStreams(uint8);
  }

  return text.trim() || '<p>Unable to extract text from this PDF. The document may contain only images or use an unsupported encoding.</p>';
}

function extractTextFromBTBlock(data: Uint8Array, start: number, end: number): string {
  let result = '';
  let i = start;

  while (i < end) {
    if (data[i] === 0x28) {
      i++;
      let str = '';
      let depth = 1;
      while (i < end && depth > 0) {
        if (data[i] === 0x5C && i + 1 < end) {
          const next = data[i + 1];
          if (next === 0x28 || next === 0x29 || next === 0x5C) {
            str += String.fromCharCode(next);
            i += 2;
          } else if (next === 0x6E) {
            str += '\n';
            i += 2;
          } else if (next === 0x72) {
            str += '\r';
            i += 2;
          } else if (next === 0x74) {
            str += '\t';
            i += 2;
          } else {
            str += String.fromCharCode(data[i]);
            i++;
          }
        } else if (data[i] === 0x29) {
          depth--;
          if (depth > 0) str += ')';
          i++;
        } else {
          str += String.fromCharCode(data[i]);
          i++;
        }
      }
      result += str;
    } else if (data[i] === 0x3C && data[i + 1] === 0x3C) {
      i += 2;
      let hex = '';
      while (i < end - 1 && !(data[i] === 0x3E && data[i + 1] === 0x3E)) {
        const ch = String.fromCharCode(data[i]);
        if (/[0-9a-fA-F]/.test(ch)) hex += ch;
        i++;
      }
      i += 2;
      for (let k = 0; k < hex.length - 1; k += 2) {
        const code = parseInt(hex.substring(k, k + 2), 16);
        if (code >= 0x20 && code < 0x7F) {
          result += String.fromCharCode(code);
        }
      }
    } else {
      i++;
    }
  }

  return result;
}

function extractTextViaStreams(data: Uint8Array): string {
  const decoder = new TextDecoder('latin1');
  const content = decoder.decode(data);
  const texts: string[] = [];
  const tjRegex = /\[(.*?)\]\s*TJ/gs;
  let match;

  while ((match = tjRegex.exec(content)) !== null) {
    const inner = match[1];
    const strParts: string[] = [];
    const strRegex = /\(([^)]*)\)/g;
    let strMatch;
    while ((strMatch = strRegex.exec(inner)) !== null) {
      strParts.push(strMatch[1]);
    }
    if (strParts.length > 0) {
      texts.push(strParts.join(''));
    }
  }

  const tjSingleRegex = /\(([^)]*)\)\s*Tj/g;
  while ((match = tjSingleRegex.exec(content)) !== null) {
    texts.push(match[1]);
  }

  return texts.join('\n');
}
