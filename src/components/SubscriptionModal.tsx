import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  Clock, 
  Copy, 
  Sparkles,
  Loader2,
  CheckCircle2,
  Receipt
} from 'lucide-react';
import { SubscriptionPlan, UserProfile } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/initialMovies';

interface SubscriptionModalProps {
  onClose: () => void;
  userProfile: UserProfile;
  onActivateSubscription: (planId: string, tierName: string) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  onClose,
  userProfile,
  onActivateSubscription,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[1]);
  const [paymentStep, setPaymentStep] = useState<'plans' | 'checkout' | 'success'>('plans');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'gopay' | 'dana' | 'bca_va' | 'card'>('qris');
  const [phoneNumber, setPhoneNumber] = useState('081298765432');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('TRX-' + Math.floor(100000 + Math.random() * 900000));
  const [copiedVa, setCopiedVa] = useState(false);

  const virtualAccount = `88099${Math.floor(10000000 + Math.random() * 90000000)}`;

  const handleProceedToPayment = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPaymentStep('checkout');
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentStep('success');
      onActivateSubscription(selectedPlan.id, selectedPlan.name);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Paket Berlangganan CineDrive VIP
              </h3>
              <p className="text-xs text-neutral-400">
                Akses semua film premium, streaming Google Drive kecepatan tinggi & download tanpa batas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          
          {/* STEP 1: Select Plan */}
          {paymentStep === 'plans' && (
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto space-y-1">
                <h4 className="text-lg sm:text-xl font-bold text-white">
                  Pilih Paket yang Sesuai dengan Gaya Menonton Anda
                </h4>
                <p className="text-xs text-neutral-400">
                  Dapat dibatalkan kapan saja • Pembayaran digital instan & aman
                </p>
              </div>

              {/* Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrent = Boolean(userProfile?.isVip && userProfile?.vipTierName && userProfile.vipTierName.includes(plan.name));
                  const isSelected = selectedPlan.id === plan.id;

                  return (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all cursor-pointer ${
                        plan.id === 'plan-vip'
                          ? 'bg-gradient-to-b from-rose-950/40 via-neutral-900 to-neutral-950 border-rose-500/60 shadow-lg shadow-rose-950/50 scale-[1.02]'
                          : plan.id === 'plan-ultra'
                          ? 'bg-gradient-to-b from-amber-950/30 via-neutral-900 to-neutral-950 border-amber-500/50 shadow-lg shadow-amber-950/40'
                          : 'bg-neutral-950 border-neutral-800'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {plan.badge && (
                        <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          plan.id === 'plan-vip' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-neutral-950'
                        }`}>
                          {plan.badge}
                        </span>
                      )}

                      <div className="space-y-3">
                        <div>
                          <h5 className="font-bold text-base text-white">{plan.name}</h5>
                          <p className="text-xs text-neutral-400 mt-0.5">{plan.description}</p>
                        </div>

                        <div className="py-2 border-y border-neutral-800">
                          {plan.price === 0 ? (
                            <span className="text-2xl font-black text-white">Gratis</span>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs text-neutral-400">Rp</span>
                              <span className="text-2xl font-black text-white">
                                {plan.price.toLocaleString('id-ID')}
                              </span>
                              <span className="text-xs text-neutral-400">/ {plan.billingPeriod}</span>
                            </div>
                          )}
                          <div className="text-[11px] text-neutral-400 mt-1">
                            Maks. {plan.resolution} • {plan.deviceLimit} Perangkat
                          </div>
                        </div>

                        {/* Features list */}
                        <ul className="space-y-2 text-xs text-neutral-300">
                          {plan.features.map((f, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-5 mt-auto">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProceedToPayment(plan);
                          }}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                            plan.id === 'plan-vip'
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30'
                              : plan.id === 'plan-ultra'
                              ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold shadow-md shadow-amber-500/20'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                          }`}
                        >
                          {plan.price === 0 ? 'Gunakan Gratis' : 'Pilih Paket Ini'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Digital Payment Checkout */}
          {paymentStep === 'checkout' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <button
                  onClick={() => setPaymentStep('plans')}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  ← Kembali ke Pilihan Paket
                </button>
                <div className="text-right">
                  <span className="text-xs text-neutral-400">Total Tagihan:</span>
                  <p className="text-base font-black text-white">
                    Rp {selectedPlan.price.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300">
                  Pilih Saluran Pembayaran Digital:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  
                  {/* QRIS */}
                  <button
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      paymentMethod === 'qris'
                        ? 'bg-rose-600/20 border-rose-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-rose-400" />
                    <div>
                      <h6 className="font-bold text-xs text-white">QRIS Dinamis</h6>
                      <p className="text-[10px] text-neutral-400">Semua Bank & E-Wallet</p>
                    </div>
                  </button>

                  {/* GoPay */}
                  <button
                    onClick={() => setPaymentMethod('gopay')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      paymentMethod === 'gopay'
                        ? 'bg-sky-600/20 border-sky-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-sky-400" />
                    <div>
                      <h6 className="font-bold text-xs text-white">GoPay / ShopeePay</h6>
                      <p className="text-[10px] text-neutral-400">Instan Debit E-Wallet</p>
                    </div>
                  </button>

                  {/* Virtual Account */}
                  <button
                    onClick={() => setPaymentMethod('bca_va')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      paymentMethod === 'bca_va'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <div>
                      <h6 className="font-bold text-xs text-white">Virtual Account</h6>
                      <p className="text-[10px] text-neutral-400">BCA, Mandiri, BRI, BNI</p>
                    </div>
                  </button>

                  {/* Kartu Kredit */}
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                      paymentMethod === 'card'
                        ? 'bg-amber-600/20 border-amber-500 text-white'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <div>
                      <h6 className="font-bold text-xs text-white">Kartu Debit/Kredit</h6>
                      <p className="text-[10px] text-neutral-400">Visa / Mastercard</p>
                    </div>
                  </button>

                </div>
              </div>

              {/* Payment Detail Display */}
              <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                
                {paymentMethod === 'qris' && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center sm:text-left">
                    {/* QR Code Canvas Visual */}
                    <div className="p-3 bg-white rounded-xl shadow-lg shrink-0">
                      <div className="w-40 h-40 bg-neutral-100 flex flex-col items-center justify-center border-2 border-neutral-900 rounded-lg p-2 relative">
                        <QrCode className="w-32 h-32 text-neutral-950" />
                        <span className="absolute bg-rose-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow">
                          QRIS
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-700 font-bold text-center mt-1">
                        NMID: ID10293847562
                      </p>
                    </div>

                    <div className="space-y-2 max-w-xs">
                      <h5 className="font-bold text-sm text-white">Pindai QRIS dengan Aplikasi Apapun</h5>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Buka aplikasi BCA Mobile, GoPay, OVO, Dana, LinkAja, atau m-Banking Anda, lalu arahkan kamera ke kode QR di samping.
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        <span>Batas waktu pembayaran: 14:52</span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'bca_va' && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-sm text-white">Nomor Virtual Account Pembayaran</h5>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                      <div>
                        <span className="text-[11px] text-neutral-400">BCA Virtual Account</span>
                        <p className="text-lg font-mono font-bold text-white tracking-wider">{virtualAccount}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(virtualAccount);
                          setCopiedVa(true);
                          setTimeout(() => setCopiedVa(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 flex items-center gap-1.5"
                      >
                        {copiedVa ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedVa ? 'Tersalin' : 'Salin Nomor'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Transfer dapat dilakukan melalui ATM BCA, KlikBCA, atau m-BCA tanpa biaya admin.
                    </p>
                  </div>
                )}

                {(paymentMethod === 'gopay' || paymentMethod === 'dana') && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-sm text-white">Nomor Ponsel Akun E-Wallet</h5>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0812xxxxxxx"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                    <p className="text-xs text-neutral-400">
                      Notifikasi konfirmasi pembayaran akan otomatis dikirimkan ke aplikasi ponsel Anda.
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-sm text-white">Rincian Kartu Debit / Kredit</h5>
                    <input
                      type="text"
                      placeholder="4000 1234 5678 9010"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                      />
                      <input
                        type="password"
                        maxLength={3}
                        placeholder="CVV"
                        className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center gap-2 pt-2 text-[11px] text-neutral-400 border-t border-neutral-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Transaksi dienkripsi 256-bit SSL & aman sesuai standar Bank Indonesia</span>
                </div>
              </div>

              {/* Action Simulation Button */}
              <button
                id="confirm-payment-btn"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:brightness-110 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Pembayaran Digital...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bayar Sekarang (Rp {selectedPlan.price.toLocaleString('id-ID')})</span>
                  </>
                )}
              </button>

            </div>
          )}

          {/* STEP 3: Success Confirmation */}
          {paymentStep === 'success' && (
            <div className="py-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-white">
                  Pembayaran Digital Berhasil!
                </h4>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Selamat! Akun Anda kini aktif sebagai <strong>{selectedPlan.name}</strong>. Anda dapat menikmati pemutaran film Google Drive tanpa batas.
                </p>
              </div>

              {/* Digital Invoice Card */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                  <span className="text-neutral-400 font-medium flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-rose-500" />
                    Bukti Transaksi Resmi
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">LUNAS</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>ID Transaksi:</span>
                  <span className="font-mono text-white">{transactionId}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Paket:</span>
                  <span className="text-white font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Masa Berlaku:</span>
                  <span className="text-white font-medium">1 Tahun (Aktif hingga 11 Sept 2027)</span>
                </div>
                <div className="flex justify-between text-neutral-400 pt-1 border-t border-neutral-900">
                  <span className="font-bold text-neutral-300">Total Dibayar:</span>
                  <span className="font-bold text-white text-sm">
                    Rp {selectedPlan.price.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                id="finish-subscription-btn"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                Mulai Nonton Film Sekarang
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
