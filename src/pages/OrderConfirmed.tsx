import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Tractor, Calendar, ArrowRight, Home, Download } from 'lucide-react';

const OrderConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingId = location.state?.bookingId || 'AR-782341';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-black text-gray-900 mb-4">Booking Confirmed!</h1>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            Your equipment is reserved. The owner has been notified and will contact you shortly for pickup details.
          </p>

          <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 mb-10 text-left">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-emerald-100/50">
              <span className="text-emerald-700 font-bold">Booking ID</span>
              <span className="text-gray-900 font-black">#{bookingId.slice(-6).toUpperCase()}</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Tractor className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Equipment</p>
                  <p className="font-bold text-gray-900">Mahindra Arjun 555 DI</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Scheduled For</p>
                  <p className="font-bold text-gray-900">Tomorrow, 08:00 AM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/bookings"
              className="py-4 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-2xl hover:border-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              View Bookings
            </Link>
            <Link 
              to="/farmer/home"
              className="py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" /> Home
            </Link>
          </div>

          <button className="mt-8 text-emerald-600 font-bold flex items-center gap-2 mx-auto hover:gap-3 transition-all">
            <Download className="w-5 h-5" /> Download Invoice
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmed;
