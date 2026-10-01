import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Tractor, ShieldCheck, Clock, MapPin, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    { icon: <ShieldCheck className="w-6 h-6" />, title: "Verified Equipment", desc: "Every machine is inspected and verified for quality." },
    { icon: <Clock className="w-6 h-6" />, title: "Flexible Rental", desc: "Rent by hour, day, or month based on your needs." },
    { icon: <MapPin className="w-6 h-6" />, title: "Nearby Service", desc: "Find equipment within 10km of your farm." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-emerald-700 uppercase bg-emerald-100 rounded-full">
                The Future of Farming
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
                Rent Modern Equipment <br />
                <span className="text-emerald-600">Grow Better Crops.</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10 leading-relaxed">
                Connect with local equipment owners and get the best machinery for your farm. 
                Save costs, increase yield, and farm smarter.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => navigate(user ? '/farmer/home' : '/login')}
                  className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Start Renting Now <ArrowRight className="w-5 h-5" />
                </button>
                <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border-2 border-gray-100 hover:border-emerald-200 transition-all flex items-center justify-center gap-2">
                  List Your Equipment
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-20 relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=2000" 
                alt="Modern Tractor" 
                className="rounded-3xl shadow-2xl border-8 border-white"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -right-10 hidden lg:block">
                <div className="bg-white p-6 rounded-3xl shadow-2xl border border-emerald-50 max-w-xs">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-emerald-600 fill-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">4.9/5 Rating</p>
                      <p className="text-sm text-gray-500">From 2,000+ Farmers</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 italic">"The best decision for my farm. Saved me thousands in maintenance costs!"</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-emerald-800/50 border border-emerald-700 hover:bg-emerald-800 transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-emerald-100/80 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
