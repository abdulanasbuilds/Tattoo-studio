export const iconArrow = '↗';
export const iconPlus = '+';
export const componentContract = {
  Header: 'Variant switcher + anchor navigation',
  WorkGrid: 'Shared work data, variable density by theme',
  ArtistList: 'Shared artist roster',
  BookingForm: 'Shared lead capture form',
  Footer: 'Shared contact and policy footer',
};

export function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}
