import apiClient from './api'

// Declare CinetPay global object
declare global {
  interface Window {
    CinetPay: {
      setConfig(config: {
        apikey: string
        site_id: number
        mode: 'PRODUCTION' | 'TEST'
        notify_url: string
      }): void
      getCheckout(data: {
        transaction_id: string
        amount: number
        currency: string
        channels: string
        description: string
        customer_name?: string
        customer_surname?: string
        customer_email?: string
        customer_phone_number?: string
        customer_address?: string
        customer_city?: string
        customer_country?: string
        customer_state?: string
        customer_zip_code?: string
        metadata?: string
        lang?: string
        invoice_data?: any
      }): void
      waitResponse(callback: (data: CinetPayResponse) => void): void
      onClose(callback: () => void): void
    }
  }
}

export interface CinetPayConfig {
  apiKey: string
  siteId: number
  notifyUrl: string
  returnUrl: string
}

export interface CinetPayResponse {
  status: 'ACCEPTED' | 'REFUSED' | 'ERROR'
  amount: number
  currency: string
  transaction_id: string
  payment_method?: string
  description?: string
  metadata?: any
  operator_id?: string
  payment_date?: string
}

export interface TransactionStatus {
  success: boolean
  data?: any
  message?: string
}

class CinetPayService {
  private config: CinetPayConfig | null = null
  private configPromise: Promise<CinetPayConfig> | null = null

  /**
   * Get CinetPay configuration from backend
   */
  async getConfig(): Promise<CinetPayConfig> {
    if (this.config) {
      return this.config
    }

    // Prevent multiple concurrent requests
    if (this.configPromise) {
      return this.configPromise
    }

    this.configPromise = (async () => {
      const response = await apiClient.get('/cinetpay/config')
      this.config = response.data.data
      return this.config!
    })()

    return this.configPromise
  }

  /**
   * Initialize payment using Seamless SDK
   */
  async initierPaiement(paymentData: {
    transaction_id: string
    amount: number
    currency?: string
    channels?: string
    description: string
    customer_name?: string
    customer_surname?: string
    customer_email?: string
    customer_phone_number?: string
    customer_address?: string
    customer_city?: string
    customer_country?: string
    customer_state?: string
    customer_zip_code?: string
    metadata?: any
    lang?: string
    invoice_data?: any
  }): Promise<CinetPayResponse> {
    const config = await this.getConfig()

    // Check if CinetPay SDK is loaded
    if (!window.CinetPay) {
      throw new Error('CinetPay SDK not loaded')
    }

    // Configure SDK
    window.CinetPay.setConfig({
      apikey: config.apiKey,
      site_id: config.siteId,
      mode: 'PRODUCTION',
      notify_url: config.notifyUrl,
    })

    // Return a promise that resolves when payment is complete
    return new Promise((resolve, reject) => {
      // Set up response handler
      window.CinetPay.waitResponse((data) => {
        if (data.status === 'ACCEPTED') {
          resolve(data)
        } else if (data.status === 'REFUSED') {
          reject(new Error('Paiement refusé'))
        } else {
          reject(new Error('Erreur lors du paiement'))
        }
      })

      // Set up close handler
      window.CinetPay.onClose(() => {
        reject(new Error('Fenêtre de paiement fermée'))
      })

      // Open payment checkout
      window.CinetPay.getCheckout({
        transaction_id: paymentData.transaction_id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'XOF',
        channels: paymentData.channels || 'ALL',
        description: paymentData.description,
        customer_name: paymentData.customer_name,
        customer_surname: paymentData.customer_surname,
        customer_email: paymentData.customer_email,
        customer_phone_number: paymentData.customer_phone_number,
        customer_address: paymentData.customer_address,
        customer_city: paymentData.customer_city,
        customer_country: paymentData.customer_country,
        customer_state: paymentData.customer_state,
        customer_zip_code: paymentData.customer_zip_code,
        metadata: paymentData.metadata ? JSON.stringify(paymentData.metadata) : undefined,
        lang: paymentData.lang || 'FR',
        invoice_data: paymentData.invoice_data,
      })
    })
  }

  /**
   * Check transaction status
   */
  async checkStatus(transactionId: string): Promise<TransactionStatus> {
    const response = await apiClient.post('/cinetpay/check-status', {
      transaction_id: transactionId
    })
    return response.data
  }

  /**
   * Format phone number for CinetPay
   */
  formatPhoneNumber(phone: string | undefined): string {
    if (!phone) {
      return '+2250000000000'
    }

    // Remove spaces and special characters
    let cleaned = phone.replace(/[^0-9+]/g, '')

    // Add + if missing
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned
    }

    return cleaned
  }

  /**
   * Generate unique transaction ID
   */
  generateTransactionId(abonnementId: string): string {
    const shortId = abonnementId.substring(0, 8).toUpperCase()
    const timestamp = Date.now()
    return `ABN-${shortId}-${timestamp}`
  }
}

export default new CinetPayService()
