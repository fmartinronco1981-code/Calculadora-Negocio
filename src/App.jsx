import React from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  BedDouble,
  Receipt,
  Download,
  Filter,
  Trash2,
  Edit3,
  Globe,
  Phone,
  Mail,
  Building,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Lock,
  UserCheck,
  Check,
  MapPin,
  Wifi,
  Coffee,
  Tv
} from 'lucide-react';

// --- INITIAL MOCK DATA ---
const ROOM_DETAILS = {
  id: 'h1',
  name: 'Habitación Executive Aeropuerto',
  subtitle: 'Suite Privada cerca de Madrid-Barajas (LEMD)',
  basePrice: 50,
  address: 'Zona Barajas / Corredor Henares, Madrid',
  features: ['Wifi 600 Mb', 'Cama King Size', 'Baño Privado/Compartido', 'Escritorio de Trabajo', 'Aire Acondicionado'],
  images: [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
  ]
};

const INITIAL_BOOKINGS = [
  {
    id: 'BK-101',
    roomId: 'h1',
    guestName: 'Carlos Mendoza',
    guestEmail: 'carlos.m@example.com',
    guestPhone: '+34 612 345 678',
    checkIn: '2026-11-02',
    checkOut: '2026-11-06',
    nights: 4,
    ratePerNight: 50,
    totalAmount: 200,
    paidAmount: 200,
    paymentStatus: 'Pagado',
    bookingStatus: 'Confirmada',
    channel: 'Directo (Web)',
    paymentMethod: 'Tarjeta de Crédito',
    notes: 'Vuelo con llegada nocturna.'
  },
  {
    id: 'BK-102',
    roomId: 'h1',
    guestName: 'Sophie Laurent',
    guestEmail: 'sophie.l@example.fr',
    guestPhone: '+33 698 765 432',
    checkIn: '2026-11-10',
    checkOut: '2026-11-14',
    nights: 4,
    ratePerNight: 50,
    totalAmount: 200,
    paidAmount: 200,
    paymentStatus: 'Pagado',
    bookingStatus: 'Confirmada',
    channel: 'Directo (Web)',
    paymentMethod: 'Bizum',
    notes: ''
  }
];

export default function App() {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [isAdminView, setIsAdminView] = useState(false); // Toggle between Guest Portal & Owner Admin

  // --- ROOM PRICE STATE (ADMIN MODIFIABLE) ---
  const [basePrice, setBasePrice] = useState(ROOM_DETAILS.basePrice);

  // --- ADMIN BLOCK DATES STATE ---
  const [blockIn, setBlockIn] = useState('');
  const [blockOut, setBlockOut] = useState('');
  const [blockReason, setBlockReason] = useState('Mantenimiento');

  // --- CLIENT BOOKING FORM STATE ---
  const [checkIn, setCheckIn] = useState('2026-11-18');
  const [checkOut, setCheckOut] = useState('2026-11-21');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'bizum'
  
  // Payment step state
  const [bookingStep, setBookingStep] = useState(1);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Admin filter states
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate nights dynamically
  const computedNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end - start;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [checkIn, checkOut]);

  const computedTotal = useMemo(() => {
    if (computedNights <= 0) return 0;
    return computedNights * basePrice;
  }, [computedNights, basePrice]);

  // Check if selected dates are available
  const isAvailable = useMemo(() => {
    if (!checkIn || !checkOut || computedNights <= 0) return false;
    
    // Check overlapping dates with confirmed bookings or blocked dates
    return !bookings.some(b => {
      if (b.bookingStatus === 'Cancelada') return false;
      const bIn = b.checkIn;
      const bOut = b.checkOut;

      return (checkIn < bOut && checkOut > bIn);
    });
  }, [checkIn, checkOut, bookings, computedNights]);

  // Handle Admin Cancel Booking
  const handleCancelBooking = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, bookingStatus: 'Cancelada', paymentStatus: 'Reembolsado / Cancelado' } : b));
  };

  // Handle Admin Delete Booking
  const handleDeleteBooking = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  // Handle Admin Block Dates
  const handleAddBlockDates = (e) => {
    e.preventDefault();
    if (!blockIn || !blockOut || blockIn >= blockOut) return;

    const newBlock = {
      id: `BLK-${Math.floor(1000 + Math.random() * 9000)}`,
      roomId: ROOM_DETAILS.id,
      guestName: `[FECHAS BLOQUEADAS] ${blockReason}`,
      guestEmail: 'admin@propiedad.com',
      guestPhone: '-',
      checkIn: blockIn,
      checkOut: blockOut,
      nights: Math.ceil((new Date(blockOut) - new Date(blockIn)) / (1000 * 60 * 60 * 24)),
      ratePerNight: 0,
      totalAmount: 0,
      paidAmount: 0,
      paymentStatus: 'N/A',
      bookingStatus: 'Bloqueado',
      channel: 'Bloqueo Manual (Admin)',
      paymentMethod: 'N/A',
      notes: blockReason
    };

    setBookings(prev => [newBlock, ...prev]);
    setBlockIn('');
    setBlockOut('');
  };

  // Filtered bookings for Admin Table
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => 
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);

  // Handle Client Payment & Confirmation
  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!isAvailable || computedNights <= 0) return;

    setIsProcessingPayment(true);

    setTimeout(() => {
      const newBk = {
        id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
        roomId: ROOM_DETAILS.id,
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        nights: computedNights,
        ratePerNight: basePrice,
        totalAmount: computedTotal,
        paidAmount: computedTotal,
        paymentStatus: 'Pagado',
        bookingStatus: 'Confirmada',
        channel: 'Directo (Portal Web)',
        paymentMethod: paymentMethod === 'card' ? 'Tarjeta de Crédito / Débito' : 'Bizum Inmediato',
        notes: 'Reserva confirmada y pagada en línea por el cliente.'
      };

      setBookings(prev => [newBk, ...prev]);
      setCreatedBooking(newBk);
      setIsProcessingPayment(false);
      setBookingStep(3);
    }, 1500);
  };

  const handleResetClientForm = () => {
    setBookingStep(1);
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setCreatedBooking(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased">
      
      {/* Navbar with View Switcher */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white block leading-none">Aeropuerto Suites</span>
              <span className="text-[11px] text-slate-400">Reserva Directa sin Comisiones</span>
            </div>
          </div>

          {/* Admin Toggle Switch */}
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              isAdminView
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>{isAdminView ? 'Modo Propietario (Admin)' : 'Vista Cliente (Portal)'}</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        
        {/* ... existing client view ... */}
        {!isAdminView && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Hero / Banner */}
            <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold uppercase tracking-wider">
                  Reserva Online • Confirmación Inmediata
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">Alquiler por Noches junto al Aeropuerto</h1>
                <p className="text-sm text-slate-300 max-w-xl">
                  Habitación privada completamente equipada a 10 min de Barajas (LEMD). Comprueba disponibilidad en tiempo real y asegura tu estancia con pago seguro.
                </p>
              </div>
              
              <div className="flex items-center space-x-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400">{basePrice} €</div>
                  <div className="text-[11px] text-slate-400">por noche</div>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="flex items-center space-x-1 text-emerald-400"><CheckCircle className="h-3.5 w-3.5" /> <span>Check-in Autónomo</span></div>
                  <div className="flex items-center space-x-1 text-blue-400"><Wifi className="h-3.5 w-3.5" /> <span>Wifi Alta Velocidad</span></div>
                </div>
              </div>
            </div>

            {/* STEP 1 & 2: AVAILABILITY & PAYMENT FLOW */}
            {bookingStep < 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Column: Room Overview & Dates Selector */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Gallery & Features */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <img 
                      src={ROOM_DETAILS.images[0]} 
                      alt="Room" 
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-white">{ROOM_DETAILS.name}</h2>
                          <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                            <MapPin className="h-3.5 w-3.5 text-blue-400" />
                            <span>{ROOM_DETAILS.address}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                        {ROOM_DETAILS.features.map((feat, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg border border-slate-700/60">
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Dates & Availability Checker */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
                    <h3 className="text-base font-bold text-white flex items-center space-x-2">
                      <CalendarIcon className="h-5 w-5 text-blue-400" />
                      <span>1. Selecciona tus Fechas de Estancia</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Fecha de Check-in</label>
                        <input
                          type="date"
                          value={checkIn}
                          onChange={(e) => {
                            setCheckIn(e.target.value);
                            setBookingStep(1);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1.5">Fecha de Check-out</label>
                        <input
                          type="date"
                          value={checkOut}
                          onChange={(e) => {
                            setCheckOut(e.target.value);
                            setBookingStep(1);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Availability Status Badge */}
                    {computedNights > 0 && (
                      <div className={`p-4 rounded-xl border flex items-center justify-between ${
                        isAvailable 
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                          : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      }`}>
                        <div className="flex items-center space-x-3">
                          {isAvailable ? <CheckCircle className="h-6 w-6 text-emerald-400" /> : <XCircle className="h-6 w-6 text-rose-400" />}
                          <div>
                            <div className="font-bold text-sm">
                              {isAvailable ? '¡Habitación Disponible!' : 'No disponible en estas fechas'}
                            </div>
                            <div className="text-xs opacity-80">
                              {isAvailable 
                                ? `${computedNights} noches seleccionadas (${checkIn} al ${checkOut})`
                                : 'Prueba seleccionando otras fechas en el calendario.'}
                            </div>
                          </div>
                        </div>

                        {isAvailable && bookingStep === 1 && (
                          <button
                            onClick={() => setBookingStep(2)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition shadow-lg shadow-emerald-600/20"
                          >
                            Continuar al Pago →
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right Column: Pricing Summary & Payment Checkout Form */}
                <div className="lg:col-span-1 space-y-6 sticky top-24">
                  
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                    <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Resumen de la Reserva</h3>

                    {/* Cost Breakdown */}
                    <div className="space-y-3 text-sm text-slate-300">
                      <div className="flex justify-between">
                        <span>{basePrice} € × {computedNights} noches</span>
                        <span className="font-semibold text-white">{computedNights * basePrice} €</span>
                      </div>
                      <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                        <span className="font-bold text-white text-base">Total a pagar:</span>
                        <span className="text-2xl font-black text-emerald-400">{computedTotal} €</span>
                      </div>
                    </div>

                    {/* Step 2: Payment Form */}
                    {bookingStep === 2 && isAvailable && (
                      <form onSubmit={handleProcessPayment} className="space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
                        
                        <div className="space-y-3">
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Datos del Inquilino</span>
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Nombre y Apellidos *"
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <input
                              type="email"
                              required
                              placeholder="Email de confirmación *"
                              value={guestEmail}
                              onChange={(e) => setGuestEmail(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <input
                              type="tel"
                              required
                              placeholder="Teléfono (Móvil) *"
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        {/* Payment Gateway Options */}
                        <div className="space-y-3 pt-2">
                          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Método de Pago Seguro</span>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('card')}
                              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                                paymentMethod === 'card'
                                  ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <CreditCard className="h-5 w-5" />
                              <span className="text-xs font-semibold">Tarjeta de Crédito</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentMethod('bizum')}
                              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                                paymentMethod === 'bizum'
                                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                              }`}
                            >
                              <Phone className="h-5 w-5" />
                              <span className="text-xs font-semibold">Bizum Inmediato</span>
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isProcessingPayment}
                          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-emerald-600/25 transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-50"
                        >
                          {isProcessingPayment ? (
                            <span>Procesando Pago Seguro...</span>
                          ) : (
                            <>
                              <Lock className="h-4 w-4" />
                              <span>Pagar {computedTotal} € y Confirmar</span>
                            </>
                          )}
                        </button>

                        <p className="text-[11px] text-center text-slate-500 flex items-center justify-center space-x-1">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Pago cifrado con garantía de reserva</span>
                        </p>

                      </form>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION RECEIPT */}
            {bookingStep === 3 && createdBooking && (
              <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl animate-scaleUp">
                
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-black text-white">¡Reserva y Pago Confirmados!</h2>
                  <p className="text-sm text-slate-300">
                    Hemos enviado el recibo y las instrucciones de llegada a <strong className="text-white">{createdBooking.guestEmail}</strong>.
                  </p>
                </div>

                {/* Printable Receipt Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <span className="text-slate-400">Código de Confirmación:</span>
                    <span className="text-base font-bold text-blue-400">{createdBooking.id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block">Huésped:</span>
                      <span className="font-semibold text-white text-sm">{createdBooking.guestName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Método de Pago:</span>
                      <span className="font-semibold text-emerald-400">{createdBooking.paymentMethod}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                    <div>
                      <span className="text-slate-500 block">Check-in:</span>
                      <span className="font-semibold text-white">{createdBooking.checkIn} (15:00h)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Check-out:</span>
                      <span className="font-semibold text-white">{createdBooking.checkOut} (11:00h)</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-800 pt-3 text-sm">
                    <span className="font-bold text-white">Monto Total Abonado:</span>
                    <span className="font-black text-emerald-400 text-lg">{createdBooking.totalAmount} €</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleResetClientForm}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-xs transition"
                  >
                    Hacer Otra Reserva
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs flex items-center space-x-2 transition shadow-lg shadow-blue-600/20"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar Recibo PDF</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ======================================================== */}
        {/* VISTA PROPIETARIO / ADMIN (GESTIÓN INTERNA Y TARIFAS)    */}
        {/* ======================================================== */}
        {isAdminView && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Header / Config Bar */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Panel de Control del Propietario</h2>
                <p className="text-xs text-slate-400">Actualiza precios, bloquea fechas y gestiona cancelaciones.</p>
              </div>

              {/* Price Modifier & Quick Actions */}
              <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                <DollarSign className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-slate-300 font-semibold">Precio Noche:</span>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-emerald-400 text-center focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-400">€/noche</span>
              </div>
            </div>

            {/* Block Dates Controls & Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Form to Block Dates */}
              <form onSubmit={handleAddBlockDates} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg md:col-span-1">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span>Bloquear Fechas (Mantenimiento / Uso)</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Desde (Check-in)</label>
                    <input
                      type="date"
                      required
                      value={blockIn}
                      onChange={(e) => setBlockIn(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Hasta (Check-out)</label>
                    <input
                      type="date"
                      required
                      value={blockOut}
                      onChange={(e) => setBlockOut(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Motivo del Bloqueo</label>
                    <input
                      type="text"
                      placeholder="Ej: Reforma, Uso Personal..."
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-600/20"
                >
                  Bloquear Fechas Seleccionadas
                </button>
              </form>

              {/* Bookings Table with Actions */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl md:col-span-2 flex flex-col">
                
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="relative w-64">
                    <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar cliente o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    {filteredBookings.length} Registros
                  </span>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-[11px] uppercase text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Reserva / Huésped</th>
                        <th className="px-4 py-3">Fechas</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-xs">
                      {filteredBookings.map((bk) => (
                        <tr key={bk.id} className="hover:bg-slate-800/50 transition">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{bk.guestName}</div>
                            <div className="text-slate-400">{bk.id} • {bk.guestEmail}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-200">
                            <div>{bk.checkIn} → {bk.checkOut}</div>
                            <div className="text-slate-500">{bk.nights} noches ({bk.totalAmount} €)</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              bk.bookingStatus === 'Confirmada' ? 'bg-emerald-500/20 text-emerald-400' :
                              bk.bookingStatus === 'Bloqueado' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-rose-500/20 text-rose-400'
                            }`}>
                              {bk.bookingStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            {bk.bookingStatus === 'Confirmada' && (
                              <button
                                onClick={() => handleCancelBooking(bk.id)}
                                title="Cancelar Reserva"
                                className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded border border-rose-500/30 text-[11px] transition"
                              >
                                Cancelar
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteBooking(bk.id)}
                              title="Eliminar Registro"
                              className="p-1 text-slate-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
export default App;
