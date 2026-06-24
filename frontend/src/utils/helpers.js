export const formatMoney = (n) =>
  `${Number(n || 0).toLocaleString('uz-UZ')} so'm`

export const formatDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// DRF paginatsiyalangan javobdan ({count, results}) yoki oddiy massivdan qatorlar
export const rowsOf = (data) => (Array.isArray(data) ? data : data?.results ?? [])

export const gradeColor = (score) => {
  if (score >= 80) return { bg: '#dcfce7', fg: '#166534' }
  if (score >= 60) return { bg: '#fef9c3', fg: '#854d0e' }
  return { bg: '#fee2e2', fg: '#991b1b' }
}
