const icon = (paths) => '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths + '</svg>';

export const foodIcons = {
  burgers: icon('<path d="M7 21a17 10 0 0 1 34 0"/><path d="M6 23h36v5H6z"/><path d="M8 31h32v4H8z"/><path d="M10 38h28"/>'),
  enrollados: icon('<path d="M9 10c8-5 20-5 29 0l-5 30c-8 4-16 4-24 0z"/><path d="m10 18 27 1M8 29l27 2M13 37l21-1"/>'),
  jumbos: icon('<path d="M11 13c0-3 3-5 6-5h14c3 0 6 2 6 5v22c0 3-3 5-6 5H17c-3 0-6-2-6-5z"/><path d="M13 18h22M13 30h22"/><path d="M17 13v22M31 13v22"/>'),
  pepitos: icon('<path d="M8 15 37 8l5 22-29 8z"/><path d="m12 20 28-7M15 29l28-7M17 36l24-6"/><path d="M18 17 23 35M29 14l5 18"/>'),
  fries: icon('<path d="M12 18h25l-3 24H15z"/><path d="m16 17 1-10M22 17l1-13M28 17V6M34 17l2-9"/><path d="M18 28h13"/>'),
  grill: icon('<path d="M9 29h30l-4 9H13z"/><path d="M13 26h22M16 22h16"/><path d="M20 18c-4-5 3-6 1-12M28 18c-4-5 3-6 1-12"/>'),
  club: icon('<path d="m7 16 31-8 4 7-30 9z"/><path d="m11 25 30-8 3 8-30 9z"/><path d="m14 34 29-8 2 7-29 8z"/>'),
  kids: icon('<path d="M8 17h32l-3 25H11z"/><path d="M17 17v-5h14v5M8 23h32"/><path d="m24 25 2 4 4 .5-3 3 .8 4.5-3.8-2.2-3.8 2.2.8-4.5-3-3 4-.5z"/>'),
  promo: icon('<path d="M7 21a17 10 0 0 1 34 0"/><path d="M6 23h36v5H6z"/><path d="M8 31h32v4H8z"/><path d="M10 38h28"/><path d="m37 4 1.3 3 3.2.3-2.4 2 .7 3.1-2.8-1.6-2.8 1.6.7-3.1-2.4-2 3.2-.3z"/>'),
};

export function getFoodIcon(category) {
  return foodIcons[category] || foodIcons.burgers;
}
