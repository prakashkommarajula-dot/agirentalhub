import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, where } from '../firebase';
import { Equipment } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, MapPin, Star, Tractor, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FarmerHome = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Tractors', 'Harvesters', 'Plows', 'Seeders', 'Sprayers'];

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const q = query(collection(db, 'equipment'), where('availability', '==', true));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Equipment));
        setEquipment(items);
      } catch (error) {
        console.error("Error fetching equipment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || item.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-emerald-50/30 pb-20">
      {/* Search Header */}
      <div className="bg-white border-b border-emerald-100 sticky top-16 z-40 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search for tractors, harvesters..." 
                className="w-full pl-12 pr-4 py-4 bg-emerald-50/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95">
              <Filter className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-3 mt-6 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${category === cat ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-gray-500 border border-gray-100 hover:border-emerald-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Finding best equipment for you...</p>
          </div>
        ) : filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredEquipment.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-emerald-50"
                >
                  <Link to={`/equipment/${item.id}`} className="block relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={item.images[0] || 'https://picsum.photos/seed/tractor/800/600'} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-gray-900">{item.rating}</span>
                    </div>
                  </Link>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{item.name}</h3>
                      <p className="text-emerald-600 font-extrabold text-lg">₹{item.pricePerHour}<span className="text-sm text-gray-400 font-medium">/hr</span></p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                      <MapPin className="w-4 h-4" />
                      <span>{item.location}</span>
                    </div>

                    <Link 
                      to={`/equipment/${item.id}`}
                      className="w-full py-4 bg-emerald-50 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      View Details <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Tractor className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No equipment found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerHome;
