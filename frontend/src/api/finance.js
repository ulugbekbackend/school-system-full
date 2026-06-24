import api from './axios'

export const listInvoices = (params) => api.get('/finance/invoices/', { params }).then((r) => r.data)
export const createInvoice = (data) => api.post('/finance/invoices/', data).then((r) => r.data)
export const listPayments = (params) => api.get('/finance/payments/', { params }).then((r) => r.data)
export const createPayment = (data) => api.post('/finance/payments/', data).then((r) => r.data)
export const listFeeTypes = () => api.get('/finance/fee-types/').then((r) => r.data)
export const createFeeType = (data) => api.post('/finance/fee-types/', data).then((r) => r.data)
