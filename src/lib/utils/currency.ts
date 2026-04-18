// 금액을 한국 원화 형식으로 포맷 (정수 단위)
export function formatKRW(amount: number): string {
  return Math.round(amount).toLocaleString('ko-KR') + '원'
}

// 숫자에 천단위 콤마 적용
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('ko-KR')
}

// 원 → 만원 단위로 변환 (반올림)
export function toManwon(amount: number): number {
  return Math.round(amount / 10_000)
}

// 만원 단위 포맷
export function formatManwon(amount: number): string {
  return toManwon(amount).toLocaleString('ko-KR') + '만원'
}

// 퍼센트 포맷 (소수점 1자리)
export function formatPercent(rate: number): string {
  return (rate * 100).toFixed(1) + '%'
}

// 입력 문자열에서 숫자만 추출 (폼 입력 처리용)
export function parseNumericInput(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
}
