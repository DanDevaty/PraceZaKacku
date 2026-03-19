import React, { useState, useMemo } from 'react';
import { Briefcase, Search, Users, Zap, Star, Mail, Phone, MapPin, Instagram, Facebook, ArrowRight, Hammer, Laptop, BookOpen, Clock, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatWidget from './components/ChatWidget';

const categories = [
  { title: 'Manuální práce', icon: Hammer, color: 'bg-blue-100 text-blue-600' },
  { title: 'IT & Design', icon: Laptop, color: 'bg-purple-100 text-purple-600' },
  { title: 'Doučování', icon: BookOpen, color: 'bg-orange-100 text-orange-600' },
  { title: 'Ostatní', icon: Zap, color: 'bg-emerald-100 text-emerald-600' },
];

interface Gig {
  id: number;
  title: string;
  category: string;
  price: string;
  location: string;
  author: string;
  description: string;
}

const featuredGigs: Gig[] = [
  {
    id: 1,
    title: 'Pomoc se stěhováním',
    category: 'Manuální práce',
    price: '250 Kč/hod',
    location: 'Praha 4',
    author: 'Martin D.',
    description: 'Hledám dva silné kluky na pomoc se stěhováním bytu 2+kk. Jedná se hlavně o krabice a pár kusů nábytku. Práce na cca 4 hodiny.',
  },
  {
    id: 2,
    title: 'Doučování Angličtiny',
    category: 'Doučování',
    price: '400 Kč/hod',
    location: 'Online',
    author: 'Lucie K.',
    description: 'Nabízím doučování angličtiny pro začátečníky i pokročilé. Zaměření na konverzaci a gramatiku. První hodina zdarma na vyzkoušení.',
  },
  {
    id: 3,
    title: 'Tvorba loga pro startup',
    category: 'IT & Design',
    price: '2500 Kč/projekt',
    location: 'Vzdáleně',
    author: 'Jakub S.',
    description: 'Potřebuji vytvořit minimalistické logo pro nový technologický startup. Požaduji zkušenosti s vektorovou grafikou a portfolio.',
  },
  {
    id: 4,
    title: 'Venčení psů',
    category: 'Ostatní',
    price: '150 Kč/hod',
    location: 'Brno',
    author: 'Alena M.',
    description: 'Hledám někoho spolehlivého na pravidelné venčení mého labradora v odpoledních hodinách. Ideálně někdo, kdo má rád zvířata.',
  },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [messageSent, setMessageSent] = useState(false);
  const [messageText, setMessageText] = useState('');

  const filteredGigs = useMemo(() => {
    if (!activeSearch) return featuredGigs;
    return featuredGigs.filter(gig => 
      gig.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      gig.category.toLowerCase().includes(activeSearch.toLowerCase()) ||
      gig.description.toLowerCase().includes(activeSearch.toLowerCase())
    );
  }, [activeSearch]);

  const handleSearch = () => {
    setActiveSearch(searchQuery);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    // Fake sending process
    setTimeout(() => {
      setMessageSent(true);
      setMessageText('');
      setTimeout(() => {
        setMessageSent(false);
        setSelectedGig(null);
      }, 2000);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-40 glass border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2 cursor-pointer" onClick={() => setActiveSearch('')}>
            <Briefcase className="text-emerald-600" />
            Práce za kačku<span className="text-emerald-600">.</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#categories" className="hover:text-emerald-600 transition-colors">Kategorie</a>
            <a href="#gigs" className="hover:text-emerald-600 transition-colors">Nabídky</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">Jak to funguje</a>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Hledat brigádu..."
                  className="pl-10 pr-4 py-2 bg-neutral-100 rounded-full text-sm border-none focus:ring-2 focus:ring-emerald-600 outline-none w-48 focus:w-64 transition-all"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
            <div className="flex gap-4">
              <button className="text-sm font-medium hover:text-emerald-600 transition-colors">Přihlásit</button>
              <button className="bg-neutral-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors">
                Vložit inzerát
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                Najděte si brigádu za <span className="text-emerald-600">pár kaček.</span>
              </h1>
              <p className="text-xl text-neutral-500 mb-10 font-light leading-relaxed">
                Práce za kačku je nejrychlejší cesta k výdělku. Od stěhování po programování. 
                Vše na jednom místě, s AI asistentkou Kačkou.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Co hledáte za brigádu?" 
                    className="w-full pl-12 pr-4 py-4 bg-neutral-100 rounded-2xl border-none focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-500 transition-all"
                >
                  Hledat
                </button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=1000" 
                  alt="People working" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-neutral-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">1,200+</div>
                    <div className="text-xs text-neutral-500 uppercase font-semibold">Aktivních uživatelů</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Prozkoumejte kategorie</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((cat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  onClick={() => {
                    setSearchQuery(cat.title);
                    setActiveSearch(cat.title);
                  }}
                  className="p-8 rounded-3xl bg-white border border-neutral-200 text-center hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${cat.color}`}>
                    <cat.icon size={32} />
                  </div>
                  <h3 className="font-bold">{cat.title}</h3>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Gigs */}
        <section id="gigs" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {activeSearch ? `Výsledky pro: "${activeSearch}"` : 'Aktuální nabídky'}
                </h2>
                <p className="text-neutral-500">
                  {filteredGigs.length > 0 ? 'Nejnovější brigády ve vašem okolí.' : 'Bohužel jsme nic nenašli. Zkuste jiné klíčové slovo.'}
                </p>
              </div>
              {activeSearch && (
                <button 
                  onClick={() => {
                    setActiveSearch('');
                    setSearchQuery('');
                  }}
                  className="text-neutral-500 font-bold flex items-center gap-2 hover:text-neutral-900 transition-all"
                >
                  Zrušit filtr
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {filteredGigs.map((gig) => (
                <div key={gig.id} className="group p-6 rounded-3xl bg-neutral-50 border border-neutral-100 hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-neutral-500 border border-neutral-200">
                      {gig.category}
                    </span>
                    <div className="text-emerald-600 font-bold">{gig.price}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-emerald-600 transition-colors">{gig.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-neutral-500 mb-6">
                    <div className="flex items-center gap-1"><MapPin size={14} /> {gig.location}</div>
                    <div className="flex items-center gap-1"><Clock size={14} /> Dnes</div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-neutral-200 rounded-full" />
                      <span className="text-sm font-medium">{gig.author}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedGig(gig)}
                      className="text-sm font-bold text-neutral-900 hover:text-emerald-600 transition-colors"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-24 px-6 bg-neutral-900 text-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Jak Práce za kačku funguje?</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="text-6xl font-bold text-emerald-600 mb-6 opacity-50">01</div>
                <h3 className="text-2xl font-bold mb-4">Vložte inzerát</h3>
                <p className="text-neutral-400">Popište, co potřebujete, nebo co nabízíte. Je to zdarma a zabere to minutu.</p>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-emerald-600 mb-6 opacity-50">02</div>
                <h3 className="text-2xl font-bold mb-4">Domluvte se</h3>
                <p className="text-neutral-400">Využijte náš bezpečný chat a domluvte si detaily, cenu a čas.</p>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-emerald-600 mb-6 opacity-50">03</div>
                <h3 className="text-2xl font-bold mb-4">Hotovo!</h3>
                <p className="text-neutral-400">Po dokončení práce si vzájemně udělte hodnocení a budujte svou reputaci.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-12 px-6 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <Briefcase className="text-emerald-600" />
            Práce za kačku<span className="text-emerald-600">.</span>
          </div>
          <div className="text-neutral-500 text-sm">
            © 2026 Práce za kačku Marketplace. Všechna práva vyhrazena.
          </div>
          <div className="flex gap-8 text-sm text-neutral-400">
            <a href="#" className="hover:text-emerald-600 transition-colors">Podpora</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Bezpečnost</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedGig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGig(null)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setSelectedGig(null)}
                className="absolute top-6 right-6 p-2 hover:bg-neutral-100 rounded-full transition-colors z-10"
              >
                <X size={24} />
              </button>
              
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold">
                    {selectedGig.category}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-neutral-500">
                    <MapPin size={14} /> {selectedGig.location}
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-4">{selectedGig.title}</h2>
                <div className="text-2xl font-bold text-emerald-600 mb-8">{selectedGig.price}</div>
                
                <div className="bg-neutral-50 p-6 rounded-2xl mb-8">
                  <h4 className="font-bold mb-2">Popis brigády</h4>
                  <p className="text-neutral-600 leading-relaxed">
                    {selectedGig.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-neutral-200 rounded-full" />
                  <div>
                    <div className="font-bold">{selectedGig.author}</div>
                    <div className="text-sm text-neutral-500">Inzerent na Práce za kačku</div>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-8">
                  <h4 className="font-bold mb-4">Napsat inzerentovi</h4>
                  {messageSent ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 text-emerald-600 p-6 rounded-2xl flex items-center gap-3"
                    >
                      <CheckCircle2 size={24} />
                      <span className="font-medium">Zpráva byla úspěšně odeslána!</span>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
                      <textarea 
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Dobrý den, měl bych o tuto brigádu zájem..."
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-emerald-600 outline-none transition-all h-32 resize-none"
                      />
                      <button 
                        type="submit"
                        className="bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-colors"
                      >
                        Odeslat zprávu
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
