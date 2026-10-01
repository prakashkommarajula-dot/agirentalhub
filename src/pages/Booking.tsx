import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, addDoc, collection, serverTimestamp } from '../firebase';
import { Equipment, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Calendar, Clock, CreditCard, ShieldCheck, ArrowLeft, Loader2, Info } from 'lucide-react';
import { format, addHours, differenceInHours } from 'date-fns';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  const [endDate, setEndDate] = useState(format(addHours(new Date(), 4), "yyyy-MM-dd'T'HH:mm"));
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'equipment', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEquipment({ id: docSnap.id, ...docSnap.data() } as Equipment);
        }
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id]);

  const calculateTotal = () => {
    if (!equipment) return 0;
    const hours = differenceInHours(new Date(endDate), new Date(startDate));
    return Math.max(hours, 1) * equipment.pricePerHour;
  };

  const handleBooking = async () => {
    if (!user || !equipment) return;
    setBookingLoading(true);
    try {
      const totalCost = calculateTotal();
      const bookingData: Partial<Booking> = {
        farmerId: user.uid,
        ownerId: equipment.ownerId,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        startDate,
        endDate,
        totalCost,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      navigate(`/payment/${docRef.id}`);
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-emerald-600 animate-spin" /></div>;
  if (!equipment) return <div className="min-h-screen flex items-center justify-center">Equipment not found</div>;

  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-emerald-50/30 pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Details
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-100 border border-emerald-50"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Calendar className="w-7 h-7 text-emerald-600" /> Select Duration
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Start Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-4 bg-emerald-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-4 bg-emerald-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900"
                  />
                </div>
              </div>

              <div className="mt-10 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700 leading-relaxed">
                  Minimum booking duration is 1 hour. Security deposit of ₹500 will be collected at the time of pickup and refunded after return.
                </p>
              </div>
            </motion.div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-100 border border-emerald-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-emerald-600" /> Safety & Insurance
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <p className="text-gray-700 font-medium">Equipment is fully insured against mechanical failure.</p>
                </div>
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <p className="text-gray-700 font-medium">24/7 roadside assistance included in the rental price.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-emerald-100 border border-emerald-50 sticky top-24"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              <div className="flex items-center gap-4 mb-8">
                <img src={equipment.images[0]} alt="" className="w-20 h-20 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                <div>
                  <p className="font-bold text-gray-900">{equipment.name}</p>
                  <p className="text-sm text-gray-500">{equipment.category}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 border-t border-gray-100 pt-6">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Price per hour</span>
                  <span>₹{equipment.pricePerHour}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Total Hours</span>
                  <span>{Math.max(differenceInHours(new Date(endDate), new Date(startDate)), 1)} hrs</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Security Deposit</span>
                  <span>₹500</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-gray-900 pt-4 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-emerald-600">₹{total + 500}</span>
                </div>
              </div>

              <button 
                onClick={handleBooking}
                disabled={bookingLoading}
                className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {bookingLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CreditCard className="w-6 h-6" /> Proceed to Payment</>}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
