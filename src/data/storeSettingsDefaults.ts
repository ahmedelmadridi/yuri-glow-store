import { governorates } from './governorates';

export interface ShippingRateItem {
  name: string;
  shippingCost: number;
  is_active: boolean;
}

export interface ShippingSettings {
  governorates: ShippingRateItem[];
  free_shipping_enabled: boolean;
  free_shipping_threshold: number;
  allow_free_shipping_with_coupon: boolean;
}

export interface PaymentSettings {
  cod_enabled: boolean;
  cod_title: string;
  cod_description: string;
  cod_deposit_required: boolean;
  cod_deposit_amount_type: 'shipping_cost' | 'fixed';
  cod_deposit_fixed_amount: number;
  cod_deposit_free_shipping_amount: number;
  cod_notice: string;
  
  wallet_enabled: boolean;
  wallet_title: string;
  wallet_instapay: string;
  wallet_vodafone_cash: string;
  wallet_instructions: string;
  
  require_receipt_upload: boolean;
}

export const defaultShippingSettings: ShippingSettings = {
  governorates: governorates.map(gov => ({
    name: gov.name,
    shippingCost: gov.shippingCost,
    is_active: true,
  })),
  free_shipping_enabled: true,
  free_shipping_threshold: 3000,
  allow_free_shipping_with_coupon: false,
};

export const defaultPaymentSettings: PaymentSettings = {
  cod_enabled: true,
  cod_title: 'الدفع عند الاستلام 💵',
  cod_description: 'الدفع نقداً عند استلام المنتجات',
  cod_deposit_required: true,
  cod_deposit_amount_type: 'shipping_cost',
  cod_deposit_fixed_amount: 100,
  cod_deposit_free_shipping_amount: 100,
  cod_notice: 'لتأكيد طلبك بنظام "الدفع عند الاستلام"، برجاء تحويل قيمة العربون مقدماً، وسيتم دفع باقي المبلغ عند الاستلام.',
  
  wallet_enabled: true,
  wallet_title: 'دفع إلكتروني (انستاباي/محفظة) 📱',
  wallet_instapay: '01277885159',
  wallet_vodafone_cash: '01277885159',
  wallet_instructions: 'برجاء تحويل إجمالي المبلغ على أحد الأرقام التالية لتأكيد طلبك:',
  
  require_receipt_upload: true,
};
