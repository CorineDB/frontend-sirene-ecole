import apiClient from './api'
import { logger } from '../utils/logger'

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
  mode: 'TEST' | 'PRODUCTION'
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

    // Configure SDK avec le mode depuis la configuration backend
    window.CinetPay.setConfig({
      apikey: config.apiKey,
      site_id: config.siteId,
      mode: config.mode,
      notify_url: config.notifyUrl,
    })

    logger.debug('CinetPay configuré:', {
      site_id: config.siteId,
      mode: config.mode,
      notify_url: config.notifyUrl
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

      // Préparer les données pour le checkout
      const checkoutData: any = {
        transaction_id: paymentData.transaction_id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'XOF',
        channels: paymentData.channels || 'ALL',
        description: paymentData.description,
        customer_name: paymentData.customer_name,
        customer_surname: paymentData.customer_surname,
        customer_phone_number: paymentData.customer_phone_number,
        lang: paymentData.lang || 'FR',
      }

      // Ajouter les champs optionnels uniquement s'ils existent
      if (paymentData.customer_email) {
        checkoutData.customer_email = paymentData.customer_email
      }
      if (paymentData.customer_address) {
        checkoutData.customer_address = paymentData.customer_address
      }
      if (paymentData.customer_city) {
        checkoutData.customer_city = paymentData.customer_city
      }
      if (paymentData.customer_country) {
        checkoutData.customer_country = paymentData.customer_country
      }
      if (paymentData.customer_state) {
        checkoutData.customer_state = paymentData.customer_state
      }
      if (paymentData.customer_zip_code) {
        checkoutData.customer_zip_code = paymentData.customer_zip_code
      }

      // Metadata doit être une chaîne JSON
      if (paymentData.metadata) {
        checkoutData.metadata = JSON.stringify(paymentData.metadata)
      }

      // Invoice data - stringifier aussi pour éviter les problèmes
      if (paymentData.invoice_data) {
        checkoutData.invoice_data = paymentData.invoice_data
      }

      logger.debug('Données envoyées au SDK CinetPay:', checkoutData)

      // Open payment checkout
      window.CinetPay.getCheckout(checkoutData)
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
   * Format phone number for CinetPay (format international requis)
   */
  formatPhoneNumber(phone: string | undefined): string {
    if (!phone) {
      return '+2250000000000'
    }

    // Remove spaces and special characters
    let cleaned = phone.replace(/[^0-9+]/g, '')

    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '')

    // Add Benin country code if no country code present
    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 8 || cleaned.length === 9) {
        // Numéro béninois sans indicatif
        cleaned = '+229' + cleaned
      } else if (cleaned.startsWith('229') && cleaned.length === 11) {
        // Avec 229 mais sans +
        cleaned = '+' + cleaned
      } else {
        // Par défaut, ajouter juste +
        cleaned = '+' + cleaned
      }
    }

    // Valider le format final
    if (cleaned.length < 10) {
      logger.warn('Phone number too short:', cleaned, '- using default')
      return '+2290000000000'
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

  /**
   * Simuler un paiement réussi (DEVELOPMENT ONLY)
   * Simule un paiement accepté sans passer par CinetPay
   */
  async simulerPaiementReussi(paymentData: {
    transaction_id: string
    amount: number
    metadata?: any
  }): Promise<CinetPayResponse> {
    if (import.meta.env.MODE === 'production') {
      throw new Error('Payment simulation not allowed in production environment.')
    }
    logger.debug('🎭 SIMULATION: Paiement simulé', paymentData)

    // Simuler un délai de traitement (2 secondes)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simuler une réponse acceptée de CinetPay
    const simulatedResponse: CinetPayResponse = {
      status: 'ACCEPTED',
      amount: paymentData.amount,
      currency: 'XOF',
      transaction_id: paymentData.transaction_id,
      payment_method: 'SIMULATED_MOBILE_MONEY',
      description: 'Paiement simulé pour test',
      metadata: paymentData.metadata,
      operator_id: 'SIM_OPERATOR',
      payment_date: new Date().toISOString(),
    }

    logger.debug('✅ SIMULATION: Paiement accepté', simulatedResponse)

    // Envoyer la notification simulée au backend
    try {
      await apiClient.post('/cinetpay/notify', {
        cpm_trans_id: paymentData.transaction_id,
        cpm_trans_status: 'ACCEPTED',
        cpm_amount: paymentData.amount,
        cpm_currency: 'XOF',
        cpm_payment_token: 'SIMULATED_TOKEN_' + Date.now(),
        cpm_site_id: (await this.getConfig()).siteId,
        payment_method: 'SIMULATED_MOBILE_MONEY',
        cel_phone_num: '+2290000000000',
        cpm_phone_prefixe: '229',
        cpm_language: 'FR',
        payment_date: new Date().toISOString(),
        metadata: JSON.stringify(paymentData.metadata || {}),
      })
      logger.debug('📡 SIMULATION: Notification envoyée au backend')
    } catch (error) {
      logger.error('❌ SIMULATION: Erreur envoi notification', error)
    }

    return simulatedResponse
  }
}

export default new CinetPayService()
