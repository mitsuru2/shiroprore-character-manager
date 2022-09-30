import { AppInfo } from 'src/app/app-info.enum';

export class HtmlElementUtil {
  static appendTextAnchor(elem: HTMLElement, text: string, url: string) {
    const isFullUrl = url.includes('://');

    if (!isFullUrl) {
      url = `${AppInfo.baseUrlProd}/${url}`;
    }

    const anchor = document.createElement('a');
    anchor.appendChild(document.createTextNode(text));
    anchor.href = url;
    elem.appendChild(anchor);
  }

  static appendTextNode(elem: HTMLElement, text: string) {
    elem.appendChild(document.createTextNode(text));
  }
}
