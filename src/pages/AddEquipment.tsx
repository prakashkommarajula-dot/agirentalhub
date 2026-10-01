import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Tractor, Upload, MapPin, DollarSign, Info, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

const AddEquipment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tractors',
    description: '',
    pricePerHour: '',
    location: '',
    imageUrl: '',
  });

  const categories = ['Tractors', 'Harvesters', 'Plows', 'Seeders', 'Sprayers', 'Others'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'equipment'), {
        ...formData,
        pricePerHour: Number(formData.pricePerHour),
        ownerId: user.uid,
        ownerName: user.displayName,
        availability: true,
        rating: 4.5,
        images: [formData.imageUrl || 'https://picsum.photos/seed/tractor/800/600'],
        createdAt: serverTimestamp(),
      });
      navigate('/owner/dashboard');
    } catch (error) {
      console.error("Error adding equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-emerald-100 border border-emerald-50"
        >
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Tractor className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">List Equipment</h1>
              <p className="text-gray-500">Reach thousands of farmers instantly</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">Equipment Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Mahindra Arjun 555 DI"
                  className="w-full p-4 bg-emerald-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">Category</label>
                <select 
                  className="w-full p-4 bg-emerald-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">Description</label>
              <textarea 
                required
                rows={4}
                placeholder="Tell farmers about your machine's power, condition, and features..."
                className="w-full p-4 bg-emerald-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">Price per Hour (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5" />
                  <input 
                    required
                    type="number" 
                    placeholder="500"
                    className="w-full pl-12 pr-4 py-4 bg-emerald-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5" />
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Ludhiana, Punjab"
                    className="w-full pl-12 pr-4 py-4 bg-emerald-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-2">Image URL</label>
              <div className="relative">
                <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5" />
                <input 
                  type="url" 
                  placeholder="Paste image link (Unsplash, etc.)"
                  className="w-full pl-12 pr-4 py-4 bg-emerald-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
              </div>
            </div>

            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
              <Info className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700 font-medium">
                Make sure to upload clear images of your equipment. Machines with high-quality photos get 3x more bookings.
              </p>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> List Equipment Now</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddEquipment;
