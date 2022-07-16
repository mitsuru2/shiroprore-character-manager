const mobileScreenSizeMax = 959; // px.

export function isMobileMode(): boolean {
  return window.innerWidth <= mobileScreenSizeMax ? true : false;
}
