import React, { useState, useEffect } from 'react';
import { Camera, Search, User, ShoppingBag, Sparkles, ShieldCheck, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// detect if running in a native mobile environment or web
const isNative = window.location.protocol === 'capacitor:';
const API_BASE = isNative ? 'http://localhost:8500/api' : '/api';

export default function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('gaura_user')));
    const [activeTab, setActiveTab] = useState('discover');
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [hasToken, setHasToken] = useState(true);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (user && activeTab === 'discover') fetchMarket('');
        if (user && activeTab === 'seller') fetchSales();
    }, [activeTab, user]);

    // Simple Push Simulation: Poll for notifications every 10s
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(fetchSales, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const fetchSales = async () => {
        try {
            const res = await fetch(`${API_BASE}/my_sales`);
            const result = await res.json();
            if (result.status === 'success') setOrders(result.data);
        } catch (err) { console.error(err); }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        const endpoint = authMode === 'login' ? '/login' : '/signup';

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.status === 'success') {
                if (authMode === 'login') {
                    setUser(result.user);
                    localStorage.setItem('gaura_user', JSON.stringify(result.user));
                } else {
                    if (!hasToken) {
                        alert("Merchant ID created! Securing your Telegram Bot... (This may take a moment)");
                        await fetch(`${API_BASE}/auto_create_bot?user_id=${result.user_id}&bot_name=${data.name}`, { method: 'POST' });
                    }
                    setAuthMode('login');
                    alert('Identity Verified! Welcome to the network.');
                }
            } else {
                alert(result.detail || 'Auth failed');
            }
        } catch (err) { alert('Server error'); }
    };

    if (!user) {
        return (
            <div className="flex flex-col h-screen bg-slate-950 text-white p-8 justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-6 shadow-2xl">
                    <h1 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">Gaura AI</h1>
                    <p className="text-slate-500 text-sm">Decentralized AI-Commerce Network</p>

                    <div className="flex bg-black/40 p-1 rounded-2xl">
                        <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${authMode === 'login' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>LOGIN</button>
                        <button onClick={() => setAuthMode('signup')} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${authMode === 'signup' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>SIGNUP</button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {authMode === 'signup' && (
                            <>
                                <input name="name" placeholder="Business Name (Optional)" className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 outline-none" />
                                <div className="space-y-4 pt-2">
                                    <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                                        <button type="button" onClick={() => setHasToken(true)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${hasToken ? 'bg-violet-600/50 text-white' : 'text-slate-500'}`}>I HAVE A TOKEN</button>
                                        <button type="button" onClick={() => setHasToken(false)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${!hasToken ? 'bg-violet-600/50 text-white' : 'text-slate-500'}`}>AUTOMATE BOT</button>
                                    </div>
                                    {hasToken ? (
                                        <input name="bot_token" placeholder="Paste Telegram Token" className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 outline-none border-dashed border-violet-500/30" />
                                    ) : (
                                        <p className="text-[10px] text-slate-500 text-center italic">Our AI Agent will chat with @BotFather to create your bot instantly.</p>
                                    )}
                                    <input name="upi_id" placeholder="Your UPI ID (Optional)" className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 outline-none" />
                                </div>
                            </>
                        )}
                        <input name="email" type="email" placeholder="Email Address" className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 outline-none" required />
                        <input name="password" type="password" placeholder="Password" className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 outline-none" required />
                        <button className="w-full bg-gradient-to-r from-violet-600 to-emerald-600 py-4 rounded-2xl font-bold">{authMode.toUpperCase()}</button>
                    </form>
                </motion.div>
            </div>
        );
    }

    const fetchMarket = async (q) => {
        try {
            const res = await fetch(`${API_BASE}/market_search?q=${q}`);
            const data = await res.json();
            setItems(data);
        } catch (err) { console.error(err); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        console.log("📤 [Frontend] Starting upload...");
        const formData = new FormData(e.target);

        const imageFile = formData.get('image');
        if (!imageFile || imageFile.size === 0) {
            alert("Wait! You need to capture a photo of the product first.");
            setIsProcessing(false);
            return;
        }

        try {
            console.log("📤 [Frontend] Sending to server...");
            const res = await fetch(`${API_BASE}/upload_product`, { method: 'POST', body: formData });
            const result = await res.json();
            console.log("📤 [Frontend] Server Response:", result);
            if (result.status === 'success') {
                setActiveTab('discover');
                fetchMarket('');
            } else {
                alert("Upload failed: " + (result.detail || "Unknown error"));
            }
        } catch (err) {
            console.error("📤 [Frontend] Error:", err);
            alert('Upload failed: Network error');
        }
        finally { setIsProcessing(false); }
    };

    const approvePayment = async (orderId) => {
        try {
            const res = await fetch(`${API_BASE}/confirm_upi_payment?order_id=${orderId}&vendor_node_id=${user.node_id}`, { method: 'POST' });
            if (res.ok) fetchSales();
        } catch (err) { console.error(err); }
    };

    const fetchDetails = async (nodeId, productId) => {
        setSelectedProduct({ loading: true });
        try {
            const res = await fetch(`${API_BASE}/product_details/${nodeId}/${productId}`);
            const data = await res.json();
            setSelectedProduct(data.data || data);
        } catch (err) { setSelectedProduct({ error: true }); }
    };

    const categories = [...new Set(items.map(i => i.category))];

    return (
        <div className="flex flex-col h-screen bg-slate-950 text-white font-sans overflow-hidden">
            {/* Top Header */}
            <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-slate-950/80 backdrop-blur-md z-10">
                <h1 className="text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">
                    Gaura AI
                </h1>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                        <User size={20} />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-6 pb-24">
                {activeTab === 'discover' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search the decentralized node..."
                                className="w-full bg-slate-900/50 border border-white/5 rounded-3xl p-5 pl-14 outline-none focus:border-emerald-500/30 transition-all font-medium"
                                onChange={(e) => fetchMarket(e.target.value)}
                            />
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500"><Search size={18} /></div>
                        </div>

                        {categories.map(cat => (
                            <div key={cat} className="space-y-4">
                                <h3 className="text-xl font-black tracking-tight">{cat}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {items.filter(i => i.category === cat).map(item => (
                                        <motion.div
                                            whileTap={{ scale: 0.95 }}
                                            key={item.id}
                                            onClick={() => fetchDetails(item.node_id, item.id)}
                                            className="bg-slate-900/40 border border-white/5 rounded-[32px] overflow-hidden group p-3"
                                        >
                                            <div className="aspect-square bg-slate-800 rounded-2xl relative mb-3 overflow-hidden">
                                                {item.ai_generated_image_url ? (
                                                    <img src={item.ai_generated_image_url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-20"><ShoppingBag /></div>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-sm truncate">{item.name}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-violet-400 font-bold">${item.price || item.base_price}</span>
                                                <span className="text-[8px] text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20 uppercase">Node</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'seller' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-[32px] p-6 shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="text-emerald-400" />
                                <h2 className="text-xl font-bold">Edge Processing Center</h2>
                            </div>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                Convert raw products into AI-verified assets. All encryption and processing happens on your device.
                            </p>

                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Product Title</label>
                                    <input name="name" className="w-full bg-black/20 border border-white/5 rounded-xl p-4 outline-none" placeholder="e.g. Vintage Camera" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Category</label>
                                        <input name="category" className="w-full bg-black/20 border border-white/5 rounded-xl p-4 outline-none" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Price</label>
                                        <input name="price" type="number" className="w-full bg-black/20 border border-white/5 rounded-xl p-4 outline-none" />
                                    </div>
                                </div>

                                <label className="block">
                                    <div className="w-full py-12 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all">
                                        <Camera className="text-slate-400" />
                                        <span className="text-sm text-slate-500">Capture Product Photo</span>
                                        <input type="file" name="image" className="hidden" accept="image/*" capture="environment" onChange={() => console.log("📸 Image Captured!")} />
                                    </div>
                                </label>

                                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                                    <Sparkles size={18} /> Process on Edge
                                </button>
                            </form>
                        </div>

                        {/* Order Notifications Service */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">Node Receipts</h3>
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full animate-pulse border border-emerald-500/20">LIVE HANDSHAKE</span>
                            </div>

                            {orders.length === 0 && (
                                <div className="bg-slate-900/30 border border-dashed border-white/5 rounded-3xl p-8 text-center text-slate-600 text-sm">
                                    Awaiting decentralized traffic...
                                </div>
                            )}

                            {orders.map(order => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-slate-900/60 border border-white/5 rounded-3xl p-5"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <div className="text-xs font-bold text-slate-500">{order.id}</div>
                                            <div className="font-semibold text-sm">{order.items[0]?.name || 'Unknown Item'}</div>
                                            <div className="text-[10px] text-slate-500 uppercase">{new Date(order.created_at).toLocaleString()}</div>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <div className="text-emerald-400 font-bold">${order.total_amount}</div>
                                            <div className={`text-[9px] font-bold px-2 py-1 rounded-md border uppercase ${order.payment_status === 'paid' ? 'bg-emerald-400/20 text-emerald-400 border-emerald-400/30' : 'bg-amber-400/20 text-amber-400 border-amber-400/30'}`}>
                                                {order.payment_status}
                                            </div>
                                        </div>
                                    </div>

                                    {order.payment_status === 'awaiting_payment' && (
                                        <button
                                            onClick={() => approvePayment(order.id)}
                                            className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20 font-bold py-2 rounded-xl text-[10px] uppercase tracking-widest transition-all"
                                        >
                                            Verify UPI & Approve
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Bottom Nav */}
            <nav className="px-10 py-6 bg-slate-950/80 backdrop-blur-xl border-t border-white/5 flex justify-between items-center">
                <button onClick={() => setActiveTab('discover')} className={`flex flex-col items-center gap-1 ${activeTab === 'discover' ? 'text-violet-400' : 'text-slate-500'}`}>
                    <Search size={22} />
                    <span className="text-[10px] font-bold">DISCOVER</span>
                </button>
                <button className="text-slate-500 flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-500 to-emerald-500 flex items-center justify-center text-slate-950 -mt-10 border-4 border-slate-950 shadow-xl">
                        <ShoppingBag size={24} />
                    </div>
                </button>
                <button onClick={() => setActiveTab('seller')} className={`flex flex-col items-center gap-1 ${activeTab === 'seller' ? 'text-emerald-400' : 'text-slate-500'}`}>
                    <Camera size={22} />
                    <span className="text-[10px] font-bold">SELLER</span>
                </button>
            </nav>

            {/* Processing Overly */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h2 className="text-xl font-bold">Edge AI Computing...</h2>
                        <p className="text-slate-500 text-sm mt-2">Generating Secure Reports & Photos Locally</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Detail Panel */}
            <AnimatePresence>
                {selectedProduct && (
                    <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 bg-slate-950 z-40 flex flex-col">
                        <header className="p-6 flex justify-between items-center">
                            <button onClick={() => setSelectedProduct(null)} className="p-2 bg-slate-900 rounded-full"><X /></button>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Relayed Document</span>
                            <div className="w-10"></div>
                        </header>
                        <div className="flex-1 overflow-y-auto px-6 pb-20">
                            {selectedProduct.loading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-slate-500 animate-pulse">Establishing Relay to Phone Node...</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="aspect-square bg-slate-900 rounded-[40px] overflow-hidden border border-white/5">
                                        <img src={selectedProduct.ai_generated_image_url || selectedProduct.specs?.ai_generated_image_url} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck size={14} /> AI Verified Technical Report
                                        </span>
                                        <h2 className="text-3xl font-extrabold">{selectedProduct.name}</h2>
                                        <p className="text-slate-400 leading-relaxed text-sm">
                                            {selectedProduct.specs?.marketing_description || selectedProduct.marketing_description}
                                        </p>
                                    </div>

                                    <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/5 space-y-4">
                                        <h4 className="font-bold flex items-center gap-2 text-violet-400"><Search size={16} /> Specifications</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedProduct.specs?.technical_specs && Object.entries(selectedProduct.specs.technical_specs).map(([k, v]) => (
                                                <div key={k} className="space-y-1">
                                                    <div className="text-[10px] text-slate-500 uppercase font-bold">{k}</div>
                                                    <div className="text-sm">{v}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button className="w-full bg-violet-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-violet-600/20">
                                        Initiate Transaction <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
