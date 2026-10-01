import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, doc, getDoc, collection, getDocs, query, where, limit } from '../firebase';
import { Equipment } from '../types';
import { motion } from 'motion/react';
import { MapPin, Star, ShieldCheck, MessageSquare, Calendar, ArrowLeft, ChevronRight, Tractor, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [similar, setSimilar] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'equipment', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Equipment;
          setEquipment(data);
          
          // Fetch similar
          const q = query(collection(db, 'equipment'), where('category', '==', data.category), where('availability', '==', true), limit(4));
          const similarSnap = await getDocs(q);
          setSimilar(similarSnap.docs.map(d => ({ id: d.id, ...d.data() } as Equipment)).filter(e => e.id !== id));
        }
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleChat = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const chatId = [user.uid, equipment.ownerId].sort().join('_');
    navigate(`/chat/${chatId}`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Tractor className="w-12 h-12 text-emerald-600 animate-spin" /></div>;
  if (!equipment) return <div className="min-h-screen flex items-center justify-center">Equipment not found</div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-bold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Search
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-100 border-8 border-white"
            >
              <img 
                src={equipment.images[activeImage] || 'https://picsum.photos/seed/tractor/1200/900'} 
                alt={equipment.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {equipment.images.map((img, i) => (
                <button 
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all ${activeImage === i ? 'border-emerald-600 scale-105' : 'border-white shadow-md'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold mb-4">
                <span className="px-3 py-1 bg-emerald-100 rounded-full text-xs uppercase tracking-wider">{equipment.category}</span>
                <div className="flex items-center gap-1 ml-2">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-gray-900">{equipment.rating}</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{equipment.name}</h1>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>{equipment.location}</span>
              </div>
            </div>

            <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex justify-between items-center">
              <div>
                <p className="text-gray-500 font-medium mb-1">Rental Price</p>
                <p className="text-4xl font-black text-emerald-700">₹{equipment.pricePerHour}<span className="text-lg text-emerald-600/60 font-bold">/hr</span></p>
              </div>
              <div className="text-right">
                <p className="text-emerald-600 font-bold flex items-center gap-1 justify-end">
                  <ShieldCheck className="w-5 h-5" /> Verified
                </p>
                <p className="text-sm text-gray-500 mt-1">Includes basic insurance</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Description</h3>
              <p className="text-gray-600 leading-relaxed">{equipment.description}</p>
            </div>

            <div className="flex items-center gap-6 p-6 border-2 border-gray-50 rounded-3xl">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium">Equipment Owner</p>
                <p className="text-lg font-bold text-gray-900">{equipment.ownerName}</p>
              </div>
              <button 
                onClick={handleChat}
                className="p-4 bg-white border border-gray-200 rounded-2xl text-emerald-600 hover:bg-emerald-50 transition-colors"
              >
                <MessageSquare className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-4">
              <Link 
                to={`/booking/${equipment.id}`}
                className="flex-1 py-5 bg-emerald-600 text-white text-center font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Calendar className="w-6 h-6" /> Book Now
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Equipment */}
        {similar.length > 0 && (
          <div className="mt-32">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Similar Equipment</h2>
                <p className="text-gray-500">Handpicked machinery in the same category</p>
              </div>
              <button className="text-emerald-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                View All <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex gap-8 overflow-x-auto pb-8 no-scrollbar">
              {similar.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/equipment/${item.id}`}
                  className="flex-shrink-0 w-80 bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={item.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-2">{item.name}</h4>
                    <div className="flex justify-between items-center">
                      <p className="text-emerald-600 font-bold">₹{item.pricePerHour}/hr</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" /> {item.location}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetails;
