// src/utils/format.js
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const PRICE_LEVEL_LABEL = {
  murah: 'Murah',
  sedang: 'Sedang',
  mahal: 'Mahal',
}
