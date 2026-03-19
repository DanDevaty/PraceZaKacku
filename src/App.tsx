import React, { useState, useMemo, useEffect, Component } from 'react';
import { Briefcase, Search, Users, Zap, Star, Mail, Phone, MapPin, Instagram, Facebook, ArrowRight, Hammer, Laptop, BookOpen, Clock, X, CheckCircle2, LogOut, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ChatWidget from './components/ChatWidget';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, collection, addDoc, onSnapshot, query, orderBy, Timestamp, handleFirestoreError, OperationType, FirebaseUser, setDoc, doc, getDoc } from './firebase';

const categories = [
  { title: 'Manuální práce', icon: Hammer, color: 'bg-blue-100 text-blue-600' },
  { title: 'IT & Design', icon: Laptop, color: 'bg-purple-100 text-purple-600' },
  { title: 'Doučování', icon: BookOpen, color: 'bg-orange-100 text-orange-600' },
  { title: 'Ostatní', icon: Zap, color: 'bg-emerald-100 text-emerald-600' },
];

interface Gig {
  id: string;
  title: string;
  category: string;
  price: string;
  location: string;
  author: string;
  authorId: string;
  description: string;
  createdAt: Timestamp;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, errorInfo: string }> {
  public state: { hasError: boolean, errorInfo: string };
  public props: { children: React.ReactNode };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.props = props;
    this.state = { hasError: false, errorInfo: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-neutral-200 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Něco se nepovedlo</h2>
            <p className="text-neutral-600 mb-6">Omlouváme se, ale v aplikaci došlo k chybě.</p>
            <div className="bg-neutral-100 p-4 rounded-xl text-xs font-mono text-left mb-6 overflow-auto max-h-40">
              {this.state.errorInfo}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-emerald-600 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-500 transition-all"
            >
              Zkusit znovu
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [messageSent, setMessageSent] = useState(false);
  const [messageText, setMessageText] = useState('');

  // New Gig Form State
  const [newGig, setNewGig] = useState({
    title: '',
    category: 'Manuální práce',
    price: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const q = query(collection(db, 'gigs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedGigs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Gig[];
      setGigs(fetchedGigs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gigs');
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Sync user profile to Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName || 'Anonym',
          email: user.email,
          photoURL: user.photoURL,
          role: 'user' // Default role
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      // If it's a Firestore error during sync, handle it
      if (error instanceof Error && error.message.includes('permission-denied')) {
        handleFirestoreError(error, OperationType.WRITE, 'users');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const filteredGigs = useMemo(() => {
    if (!activeSearch) return gigs;
    return gigs.filter(gig => 
      gig.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
      gig.category.toLowerCase().includes(activeSearch.toLowerCase()) ||
      gig.description.toLowerCase().includes(activeSearch.toLowerCase())
    );
  }, [activeSearch, gigs]);

  const handleSearch = () => {
    setActiveSearch(searchQuery);
  };

  const handleAddGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'gigs'), {
        ...newGig,
        author: user.displayName || 'Anonym',
        authorId: user.uid,
        createdAt: Timestamp.now()
      });
      setIsAddModalOpen(false);
      setNewGig({
        title: '',
        category: 'Manuální práce',
        price: '',
        location: '',
        description: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gigs');
    }
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
    <ErrorBoundary>
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
            <div className="flex gap-4 items-center">
              {user ? (
                <>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-500 transition-colors"
                  >
                    <Plus size={16} />
                    Vložit inzerát
                  </button>
                  <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
                    <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full bg-neutral-200" />
                    <button onClick={handleLogout} className="text-neutral-500 hover:text-red-600 transition-colors">
                      <LogOut size={18} />
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="bg-neutral-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  Přihlásit se
                </button>
              )}
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

      {/* Add Gig Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-neutral-100 rounded-full transition-colors z-10"
              >
                <X size={24} />
              </button>
              
              <div className="p-8 md:p-10">
                <h2 className="text-2xl font-bold mb-6">Vložit nový inzerát</h2>
                <form onSubmit={handleAddGig} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">Název brigády</label>
                    <input 
                      required
                      type="text"
                      value={newGig.title}
                      onChange={(e) => setNewGig({...newGig, title: e.target.value})}
                      placeholder="Např. Pomoc se stěhováním"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Kategorie</label>
                      <select 
                        value={newGig.category}
                        onChange={(e) => setNewGig({...newGig, category: e.target.value})}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-600 outline-none"
                      >
                        {categories.map(c => <option key={c.title} value={c.title}>{c.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Odměna</label>
                      <input 
                        required
                        type="text"
                        value={newGig.price}
                        onChange={(e) => setNewGig({...newGig, price: e.target.value})}
                        placeholder="Např. 250 Kč/hod"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-600 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Lokalita</label>
                    <input 
                      required
                      type="text"
                      value={newGig.location}
                      onChange={(e) => setNewGig({...newGig, location: e.target.value})}
                      placeholder="Např. Praha 4"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Popis</label>
                    <textarea 
                      required
                      value={newGig.description}
                      onChange={(e) => setNewGig({...newGig, description: e.target.value})}
                      placeholder="Popište podrobně, co práce obnáší..."
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-600 outline-none h-32 resize-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-500 transition-colors mt-4"
                  >
                    Zveřejnit inzerát
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
    </ErrorBoundary>
  );
}
