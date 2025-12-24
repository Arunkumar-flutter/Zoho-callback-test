import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowRight, CheckCircle, Receipt, CreditCard, Calendar, Mail, FileText, XCircle } from 'lucide-react';

interface PaymentDetails {
  subscription_id: string | null;
  plan_name: string | null;
  invoice_amount: string | null;
  email: string | null;
  recurring_charges: string | null;
  transaction_id: string | null;
  payment_id: string | null;
  invoice_number: string | null;
}

function App() {
  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null); // null = loading/checking
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Extract URL parameters
    const urlParams = new URLSearchParams(window.location.search);

    const paymentDetails: PaymentDetails = {
      subscription_id: urlParams.get('subscription_id'),
      plan_name: urlParams.get('plan_name'),
      invoice_amount: urlParams.get('invoice_amount'),
      email: urlParams.get('email'),
      recurring_charges: urlParams.get('recurring_charges'),
      transaction_id: urlParams.get('transaction_id'),
      payment_id: urlParams.get('paymentnumber'),
      invoice_number: urlParams.get('invoicenumber'),
    };

    setDetails(paymentDetails);

    if (paymentDetails.subscription_id) {
      setIsValid(true);

      // Call Sync API
      const syncSubscription = async () => {
        setSyncStatus('syncing');
        try {
          await axios.post(`https://vealthx-ollamavm2.centralindia.cloudapp.azure.com/zoho-subscription-test/api/hostedpage/sync-subscription`, paymentDetails);
          setSyncStatus('success');
        } catch (error) {
          console.error('Failed to sync subscription:', error);
          setSyncStatus('error');
        }
      };

      syncSubscription();
    } else {
      setIsValid(false);
    }
  }, []);

  const handleContinue = () => {
    if (!details) return;

    const params = new URLSearchParams();
    Object.entries(details).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const mobileAppUrl = `vealthx://app/callback?${params.toString()}`;
    window.location.href = mobileAppUrl;
  };

  const handleChoosePlan = () => {
    const mobileAppUrl = 'vealthx://app/callback'; // No params for failure case
    window.location.href = mobileAppUrl;
  };

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          {/* Success State */}
          {isValid ? (
            <>
              {/* Header */}
              <div className="bg-green-600 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Payment Successful</h1>
                <p className="text-green-100">Thank you for your subscription</p>
              </div>

              {/* Content */}
              <div className="p-6">
                {details && (
                  <div className="space-y-4">
                    {/* Amount Card */}
                    <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Receipt className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Amount Paid</p>
                          <p className="text-lg font-bold text-gray-900">{details.invoice_amount || '0.00'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Details List */}
                    <div className="space-y-3 pt-2">
                      {details.plan_name && (
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600">Plan Name</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{details.plan_name}</span>
                        </div>
                      )}

                      {details.transaction_id && (
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600">Transaction ID</span>
                          </div>
                          <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">{details.transaction_id}</span>
                        </div>
                      )}

                      {details.recurring_charges && (
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600">Recurring</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{details.recurring_charges}</span>
                        </div>
                      )}

                      {details.email && (
                        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600">Email</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={details.email}>{details.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    onClick={handleContinue}
                    className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2 group"
                  >
                    <span>Continue to App</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Click above to return to the VealthX app
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Failure Header */}
              <div className="bg-red-600 p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <XCircle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Subscription Failed</h1>
                <p className="text-red-100">We could not process your subscription</p>
              </div>

              {/* Failure Content */}
              <div className="p-6">
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-6">
                    Something went wrong while verifying your subscription. Please try selecting a plan again.
                  </p>

                  <button
                    onClick={handleChoosePlan}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform active:scale-95 transition-all duration-200 flex items-center justify-center space-x-2 group"
                  >
                    <span>Choose Plan</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    Return to app to retry
                  </p>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;