import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, where, orderBy, updateDoc, doc } from '../firebase';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Calendar, Tractor, MapPin, Clock, Loader2, ArrowRight, MessageSquare, CheckCircle2, XCircle, PlayCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const BookingHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const field = user.role === 'farmer' ? 'farmerId' : 'ownerId';
        const q = query(collection(db, 'bookings'), where(field, '==', user.uid));
        const snap = await getDocs(q);
        setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const handleChat = (ownerId: string) => {
    if (!user) return;
    const chatId = [user.uid, ownerId].sort().join('_');
    navigate(`/chat/${chatId}`);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus as any } : b));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'in-use': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle2 className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in-use': return <PlayCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-emerald-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-emerald-50/30 pb-20">
      <div className="max-w-5xl mx-auto px-4 pt-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Booking History</h1>
          <p className="text-gray-500 font-medium">Track all your equipment rentals in one place</p>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50 hover:shadow-xl hover:shadow-emerald-100/50 transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                    <Tractor className="w-10 h-10" />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-3">
                      <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${getStatusStyle(b.status)}`}>
                        {getStatusIcon(b.status)} {b.status}
                      </span>
                      <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${b.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {b.paymentStatus}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">{b.equipmentName}</h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-500 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span>{new Date(b.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>{new Date(b.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center md:text-right space-y-4">
                    <p className="text-3xl font-black text-emerald-700">₹{b.totalCost}</p>
                    <div className="flex gap-2">
                      {user.role === 'owner' && b.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(b.id, 'accepted')}
                            className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(b.id, 'cancelled')}
                            className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleChat(user.role === 'farmer' ? b.ownerId : b.farmerId)}
                        className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <MessageSquare className="w-6 h-6" />
                      </button>
                      <Link 
                        to={`/equipment/${b.equipmentId}`}
                        className="px-6 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all flex items-center gap-2"
                      >
                        Details <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-emerald-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-emerald-200" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-8">You haven't made any bookings yet.</p>
            <Link to="/farmer/home" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
              Explore Equipment <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
