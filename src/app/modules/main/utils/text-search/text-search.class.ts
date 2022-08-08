type SearchMode = 'normal' | 'quick';

class TextParseInfo {
  prop: any = {};

  line: number = 0;

  start: number = 0;

  end: number = 0;

  finished: boolean = true;
}

class TextParseInfoWithToken {
  token: string = '';

  found: boolean = false;

  parseInfo: TextParseInfo[] = [];
}

export class TextSearchResult {
  allTokensFound: boolean = false;

  details: TextParseInfoWithToken[] = [];
}

export class TextSearch {
  private readonly className = 'TextSearch';

  private textLines: { texts: string[]; prop: any }[] = [];

  //============================================================================
  // Class methods.
  //
  // constructor() {}

  add(text: string, prop?: any): void;
  add(text: string[], prop?: any): void;
  add(text: string | string[], prop?: any): void {
    if (typeof text === 'string') {
      this.textLines.push({ texts: [text], prop: prop });
    } else {
      this.textLines.push({ texts: text, prop: prop });
    }
  }

  clear() {
    this.textLines = [];
  }

  quickSearch(token: string): TextSearchResult;
  quickSearch(token: string[]): TextSearchResult;
  quickSearch(token: string | string[]): TextSearchResult {
    const result: TextSearchResult = new TextSearchResult();

    let tokens: string[];
    if (typeof token === 'string') {
      tokens = this.parseInputText(token);
    } else {
      tokens = token;
    }

    // Run search process for each text token.
    result.allTokensFound = true;
    for (let i = 0; i < tokens.length; ++i) {
      const tmpResult = this.searchTextToken(tokens[i], 'quick');
      result.details.push(tmpResult);
      if (!tmpResult.found) {
        result.allTokensFound = false;
        break;
      }
    }

    return result;
  }

  search(token: string): TextSearchResult;
  search(token: string[]): TextSearchResult;
  search(token: string | string[]): TextSearchResult {
    const result: TextSearchResult = new TextSearchResult();

    let tokens: string[];
    if (typeof token === 'string') {
      tokens = this.parseInputText(token);
    } else {
      tokens = token;
    }

    // Run search process for each text token.
    result.allTokensFound = true;
    for (let i = 0; i < tokens.length; ++i) {
      const tmpResult = this.searchTextToken(tokens[i], 'normal');
      result.details.push(tmpResult);
      if (!tmpResult.found) {
        result.allTokensFound = false;
      }
    }

    return result;
  }

  //============================================================================
  // Private methods.
  //
  private searchTextToken(token: string, mode: SearchMode): TextParseInfoWithToken {
    let result: TextParseInfoWithToken = new TextParseInfoWithToken();
    result.token = token;

    // Search token from registered text line.
    for (let i = 0; i < this.textLines.length; ++i) {
      // Make long single line text from text lines.
      const margedText: string = this.textLines[i].texts.join('');

      // Search token.
      let iStart = 0;
      let iEnd = 0;
      while (true) {
        iStart = margedText.indexOf(token, iStart); // Return '-1' if not found.
        if (iStart < 0) {
          break; // Exit while loop if not found.
        }

        // Set found flag.
        result.found = true;
        if (mode === 'quick') {
          break;
        }

        // Calc text parse info. (Normal mode only.)
        iEnd = iStart + token.length;
        const parseInfo = this.calcParseInfo(this.textLines[i].texts, iStart, iEnd, this.textLines[i].prop);
        for (let j = 0; j < parseInfo.length; ++j) {
          result.parseInfo.push(parseInfo[j]);
        }

        // Update iStart. Next search point.
        iStart = iEnd;
      }

      // Exit loop if the token is found and it runs in quick mode.
      if (result.found && mode === 'quick') {
        break;
      }
    }

    return result;
  }

  private calcParseInfo(textLines: string[], start: number, end: number, prop: any): TextParseInfo[] {
    let result: TextParseInfo[] = [];

    // Make parse info data.
    let parseInfo = new TextParseInfo();
    parseInfo.prop = prop;

    // Calc line number.
    let totalLength = 0;
    let startFound = false;
    for (let i = 0; i < textLines.length; ++i) {
      // CASE: 'start' is not found.
      if (!startFound) {
        if (totalLength + textLines[i].length > start) {
          parseInfo.line = i;
          parseInfo.start = start - totalLength;
          startFound = true;
        }
      }

      // CASE: 'start' is already found.
      else {
        parseInfo = new TextParseInfo();
        parseInfo.prop = prop;
        parseInfo.line = i;
        parseInfo.start = 0;
      }

      if (startFound) {
        // CASE: 'end' is included in the target line.
        if (totalLength + textLines[i].length >= end) {
          parseInfo.end = end - totalLength;
          parseInfo.finished = true;
          result.push(parseInfo);
          break;
        }

        // CASE: 'end' is not included in the target line.
        //       It have to check next line.
        else {
          parseInfo.end = textLines[i].length;
          parseInfo.finished = false;
          result.push(parseInfo);
        }
      }

      // Update total text length.
      totalLength += textLines[i].length;
    }

    return result;
  }

  private parseInputText(text: string): string[] {
    let result: string[] = [];
    let start = 0;
    let end = 0;
    let status: 'none' | 'normalText' | 'singleQuote' | 'doubleQuote' = 'none';

    for (let i = 0; i < text.length; ++i) {
      const char = text.charAt(i);

      // CASE: Last character.
      if (i + 1 >= text.length) {
        if (status === 'normalText') {
          end = i + 1;
          result.push(text.slice(start, end));
          break;
        }
      }

      // CASE: White space.
      if (char === ' ' || char === '　') {
        // End normal text.
        if (status === 'normalText') {
          end = i;
          result.push(text.slice(start, end));
          status = 'none';
        }
      }

      // CASE: Single quote.
      else if (char === "'") {
        // Begin text if not started.
        if (status === 'none') {
          if (text.indexOf("'", i + 1) > 0) {
            start = i + 1;
            status = 'singleQuote';
          } else {
            start = i;
            status = 'normalText';
          }
        }

        // Close single quote text.
        else if (status === 'singleQuote') {
          end = i;
          result.push(text.slice(start, end));
          status = 'none';
        }
      }

      // CASE: Double quote.
      else if (char === '"') {
        // Begin text if not started.
        if (status === 'none') {
          if (text.indexOf('"', i + 1) > 0) {
            start = i + 1;
            status = 'doubleQuote';
          } else {
            start = i;
            status = 'normalText';
          }
        }

        // Close double quote text.
        else if (status === 'doubleQuote') {
          end = i;
          result.push(text.slice(start, end));
          status = 'none';
        }
      }

      // CASE: Other character.
      else {
        // Begin text if not started.
        if (status === 'none') {
          start = i;
          status = 'normalText';
        }
      }
    }

    return result;
  }
}
