export class TextParseInfo {
  prop: any = {};

  line: number = 0;

  start: number = 0;

  end: number = 0;

  finished: boolean = true;
}

export class TextParseInfoWithToken {
  token: string = '';

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
  constructor() {}

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

  search(token: string): TextSearchResult;
  search(token: string[]): TextSearchResult;
  search(token: string | string[]): TextSearchResult {
    const result: TextSearchResult = new TextSearchResult();
    let allTokensFound = true;

    let tokens: string[];
    if (typeof token === 'string') {
      tokens = [token];
    } else {
      tokens = token;
    }

    // Run search process for each text token.
    for (let i = 0; i < tokens.length; ++i) {
      const tmpResult = this.searchTextToken(tokens[i]);
      result.details.push(tmpResult);
      if (tmpResult.parseInfo.length === 0) {
        allTokensFound = false;
      }
    }

    result.allTokensFound = allTokensFound;

    return result;
  }

  //============================================================================
  // Private methods.
  //
  private searchTextToken(token: string): TextParseInfoWithToken {
    let result: TextParseInfoWithToken = { token: token, parseInfo: [] };

    // Search token from registered text line.
    for (let i = 0; i < this.textLines.length; ++i) {
      // Make long single line text from text lines.
      const margedText: string = this.textLines[i].texts.join('');

      // Search token.
      let iStart = 0;
      let iEnd = 0;
      while (iStart >= 0) {
        iStart = margedText.indexOf(token, iStart); // Return '-1' if not found.
        if (iStart >= 0) {
          // Calc text parse info.
          iEnd = iStart + token.length;
          const parseInfo = this.calcParseInfo(this.textLines[i].texts, iStart, iEnd, this.textLines[i].prop);
          for (let j = 0; j < parseInfo.length; ++j) {
            result.parseInfo.push(parseInfo[j]);
          }
          console.log(result);

          // Update iStart. Next search point.
          iStart = iEnd;
        }
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
}
