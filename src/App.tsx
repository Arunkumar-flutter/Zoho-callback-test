import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { isAndroid, isIOS } from "react-device-detect";

interface PaymentDetails {
  hostedpage_id: string | null;
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
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const redirectToApp = useCallback((paymentDetails: PaymentDetails) => {
    const params = new URLSearchParams();
    Object.entries(paymentDetails).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const WEB_FALLBACK_URL = 'https://vealthx-ollamavm.centralindia.cloudapp.azure.com/dis-test/app/callback?';

    if (isAndroid || isIOS) {
      window.location.href = `vealthx://app/callback?${params.toString()}`;
    } else {
      window.location.href = `${WEB_FALLBACK_URL}${params.toString()}`;
    }
  }, []);

  const syncSubscription = useCallback(async (paymentDetails: PaymentDetails) => {
    setSyncStatus('syncing');
    try {
      const response = await axios.post(
        `https://vealthx-ollamavm2.centralindia.cloudapp.azure.com/zoho-subscription-test/api/v2/hostedpage/payment-complete`,
        { hostedpage_id: paymentDetails.hostedpage_id }
      );

      if (response.data && response.data.success) {
        setSyncStatus('success');
      } else {
        console.error('Subscription sync failed:', response.data);
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Failed to sync subscription:', error);
      setSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const paymentDetails: PaymentDetails = {
      hostedpage_id: urlParams.get('hostedpage_id'),
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

    if (paymentDetails.hostedpage_id) {
      setIsValid(true);
      syncSubscription(paymentDetails);
    } else {
      setIsValid(false);
      setSyncStatus('error');
    }
  }, [syncSubscription]);

  // Auto-redirect on success - no manual click needed
  useEffect(() => {
    if (isValid && syncStatus === 'success' && details) {
      // Small delay so user sees success feedback before redirect
      const timer = setTimeout(() => {
        redirectToApp(details);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isValid, syncStatus, details, redirectToApp]);

  // Single UI: circular progress indicator only
  // covers idle/checking, syncing, and success (redirecting) - no data display, no buttons
  if (isValid === null || syncStatus === 'syncing' || (isValid && syncStatus === 'success')) {
    const message =
      syncStatus === 'success'
        ? 'Payment successful! Redirecting to app...'
        : syncStatus === 'syncing'
          ? 'Verifying subscription...'
          : 'Loading...';

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">{message}</p>
          {syncStatus === 'success' && (
            <p className="text-gray-400 text-sm mt-2">Please wait</p>
          )}
        </div>
      </div>
    );
  }

  // Error / invalid state - minimal, no data, no Choose Plan button
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-700 font-semibold">
          {isValid ? 'Subscription verification failed' : 'Invalid subscription details'}
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Please return to the app and try again.
        </p>
      </div>
    </div>
  );
}

export default App;
