import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, where, addDoc, serverTimestamp } from '../firebase';
import { Equipment, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Plus, Tractor, Calendar, DollarSign, Users, ArrowRight, Loader2, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const eqQuery = query(collection(db, 'equipment'), where('ownerId', '==', user.uid));
        const eqSnap = await getDocs(eqQuery);
        setEquipment(eqSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment)));

        const bookQuery = query(collection(db, 'bookings'), where('ownerId', '==', user.uid));
        const bookSnap = await getDocs(bookQuery);
        setBookings(bookSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
      } catch (error) {
        console.error("Error fetching owner data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const stats = [
    { label: 'Total Equipment', value: equipment.length, icon: <Tractor className="w-6 h-6" />, color: 'bg-blue-500' },
    { label: 'Active Bookings', value: bookings.filter(b => b.status === 'accepted' || b.status === 'in-use').length, icon: <Calendar className="w-6 h-6" />, color: 'bg-emerald-500' },
    { label: 'Total Earnings', value: `₹${bookings.filter(b => b.paymentStatus === 'paid').reduce((acc, b) => acc + b.totalCost, 0)}`, icon: <DollarSign className="w-6 h-6" />, color: 'bg-amber-500' },
    { label: 'Happy Farmers', value: new Set(bookings.map(b => b.farmerId)).size, icon: <Users className="w-6 h-6" />, color: 'bg-purple-500' },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-emerald-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-emerald-50/30 pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Owner Dashboard</h1>
            <p className="text-gray-500 font-medium">Manage your machinery and grow your business</p>
          </div>
          <Link 
            to="/owner/add-equipment"
            className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-6 h-6" /> Add New Equipment
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-50 flex items-center gap-6"
            >
              <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                {s.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
              <Link to="/bookings" className="text-emerald-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                View All <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-emerald-50 overflow-hidden">
              {bookings.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="p-6 hover:bg-emerald-50/50 transition-colors flex items-center gap-6">
                      <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                        <Tractor className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{b.equipmentName}</p>
                        <p className="text-sm text-gray-500">Booking ID: #{b.id.slice(-6).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-700">₹{b.totalCost}</p>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full ${b.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center">
                  <Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">No bookings yet</p>
                </div>
              )}
            </div>
          </div>

          {/* My Equipment */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">My Equipment</h2>
            <div className="space-y-4">
              {equipment.map((e) => (
                <div key={e.id} className="bg-white p-4 rounded-3xl shadow-sm border border-emerald-50 flex items-center gap-4 group">
                  <img src={e.images[0]} alt="" className="w-20 h-20 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{e.name}</p>
                    <p className="text-sm text-gray-500">₹{e.pricePerHour}/hr</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${e.availability ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                </div>
              ))}
              {equipment.length === 0 && (
                <div className="p-10 bg-white rounded-3xl border-2 border-dashed border-emerald-100 text-center">
                  <Plus className="w-8 h-8 text-emerald-200 mx-auto mb-2" />
                  <p className="text-emerald-600 font-bold">Add your first machine</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
