import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, deleteDoc, doc } from '../firebase';
import { Equipment, UserProfile, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Users, Tractor, Calendar, Trash2, ShieldCheck, Loader2, Search } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'equipment' | 'bookings'>('users');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userSnap = await getDocs(collection(db, 'users'));
        setUsers(userSnap.docs.map(d => d.data() as UserProfile));

        const eqSnap = await getDocs(collection(db, 'equipment'));
        setEquipment(eqSnap.docs.map(d => ({ id: d.id, ...d.data() } as Equipment)));

        const bookSnap = await getDocs(collection(db, 'bookings'));
        setBookings(bookSnap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
      } catch (error) {
        console.error("Admin fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (coll: string, id: string) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      await deleteDoc(doc(db, coll, id));
      if (coll === 'users') setUsers(prev => prev.filter(u => u.uid !== id));
      if (coll === 'equipment') setEquipment(prev => prev.filter(e => e.id !== id));
      if (coll === 'bookings') setBookings(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-emerald-600 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-emerald-50/30 pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Admin Control Panel</h1>
          <p className="text-gray-500 font-medium">Global management of users, equipment, and rentals</p>
        </div>

        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 no-scrollbar">
          <button onClick={() => setActiveTab('users')} className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-gray-500 hover:bg-emerald-50'}`}>
            <Users className="w-5 h-5" /> Users ({users.length})
          </button>
          <button onClick={() => setActiveTab('equipment')} className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'equipment' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-gray-500 hover:bg-emerald-50'}`}>
            <Tractor className="w-5 h-5" /> Equipment ({equipment.length})
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`px-8 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 ${activeTab === 'bookings' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-gray-500 hover:bg-emerald-50'}`}>
            <Calendar className="w-5 h-5" /> Bookings ({bookings.length})
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-emerald-50 overflow-hidden">
          {activeTab === 'users' && (
            <table className="w-full text-left">
              <thead className="bg-emerald-50/50 border-b border-emerald-100">
                <tr>
                  <th className="p-6 font-bold text-gray-900">User</th>
                  <th className="p-6 font-bold text-gray-900">Role</th>
                  <th className="p-6 font-bold text-gray-900">Joined</th>
                  <th className="p-6 font-bold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                          {u.displayName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{u.displayName}</p>
                          <p className="text-sm text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-6 text-gray-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-6 text-right">
                      <button onClick={() => handleDelete('users', u.uid)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'equipment' && (
            <table className="w-full text-left">
              <thead className="bg-emerald-50/50 border-b border-emerald-100">
                <tr>
                  <th className="p-6 font-bold text-gray-900">Equipment</th>
                  <th className="p-6 font-bold text-gray-900">Owner</th>
                  <th className="p-6 font-bold text-gray-900">Price</th>
                  <th className="p-6 font-bold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {equipment.map((e) => (
                  <tr key={e.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <img src={e.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-gray-900">{e.name}</p>
                          <p className="text-sm text-gray-500">{e.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 text-gray-900 font-medium">{e.ownerName}</td>
                    <td className="p-6 text-emerald-700 font-black">₹{e.pricePerHour}/hr</td>
                    <td className="p-6 text-right">
                      <button onClick={() => handleDelete('equipment', e.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'bookings' && (
            <table className="w-full text-left">
              <thead className="bg-emerald-50/50 border-b border-emerald-100">
                <tr>
                  <th className="p-6 font-bold text-gray-900">Booking</th>
                  <th className="p-6 font-bold text-gray-900">Status</th>
                  <th className="p-6 font-bold text-gray-900">Total</th>
                  <th className="p-6 font-bold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-gray-900">{b.equipmentName}</p>
                      <p className="text-sm text-gray-500">#{b.id.slice(-6).toUpperCase()}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${b.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-6 text-emerald-700 font-black">₹{b.totalCost}</td>
                    <td className="p-6 text-right">
                      <button onClick={() => handleDelete('bookings', b.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
