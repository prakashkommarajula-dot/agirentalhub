import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, updateDoc } from '../firebase';
import { Booking } from '../types';
import { motion } from 'motion/react';
import { CreditCard, Smartphone, Banknote, ShieldCheck, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('upi');

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      try {
        const docRef = doc(db, 'bookings', bookingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBooking({ id: docSnap.id, ...docSnap.data() } as Booking);
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    if (!bookingId) return;
    setPaying(true);
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const docRef = doc(db, 'bookings', bookingId);
      await updateDoc(docRef, {
        paymentStatus: 'paid',
        status: 'accepted'
      });
      navigate('/order-confirmed', { state: { bookingId } });
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-emerald-600 animate-spin" /></div>;
  if (!booking) return <div className="min-h-screen flex items-center justify-center">Booking not found</div>;

  const paymentMethods = [
    { id: 'upi', name: 'UPI Payment', icon: <Smartphone className="w-6 h-6" />, desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard className="w-6 h-6" />, desc: 'Visa, Mastercard, RuPay' },
    { id: 'cash', name: 'Pay at Pickup', icon: <Banknote className="w-6 h-6" />, desc: 'Pay cash to owner directly' },
  ];

  return (
    <div className="min-h-screen bg-emerald-50/30 pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Booking
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-100 border border-emerald-50"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Secure Payment</h2>
            <p className="text-gray-500">Complete your booking for <span className="text-emerald-600 font-bold">{booking.equipmentName}</span></p>
          </div>

          <div className="bg-emerald-900 text-white p-8 rounded-3xl mb-10 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-emerald-200 text-sm font-bold uppercase tracking-widest mb-2">Total Amount Payable</p>
              <p className="text-5xl font-black">₹{booking.totalCost + 500}</p>
              <div className="mt-6 flex items-center gap-2 text-emerald-300 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>SSL Encrypted Secure Transaction</span>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-800 rounded-full -mr-16 -mt-16 opacity-50"></div>
          </div>

          <div className="space-y-4 mb-10">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">Choose Payment Method</p>
            {paymentMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center gap-6 text-left ${method === m.id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-50 hover:border-emerald-100'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${method === m.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {m.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${method === m.id ? 'text-emerald-900' : 'text-gray-700'}`}>{m.name}</p>
                  <p className="text-sm text-gray-500">{m.desc}</p>
                </div>
                {method === m.id && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
              </button>
            ))}
          </div>

          <button 
            onClick={handlePayment}
            disabled={paying}
            className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {paying ? <Loader2 className="w-6 h-6 animate-spin" /> : `Pay ₹${booking.totalCost + 500} Now`}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;
