import React, { useState, useEffect } from 'react';
import { Calendar, Users, ArrowRight, Star, Wifi, Coffee, MapPin, X, CreditCard, CheckCircle, Loader2, QrCode, LogOut, Clock, Crown, ChevronLeft, ChevronRight, Banknote, Smartphone, Download, User as UserIcon, Settings, Shield, FileText, Upload, Trash2, Plus, AlertCircle, Sparkles, Music, Mic, Utensils, ShoppingBag, ChefHat, Minus, Mail, Phone, Map, Facebook, Instagram, Linkedin, Twitter, Camera, Lock, MessageCircle, HelpCircle, History, Info } from 'lucide-react';
import { jsPDF } from "jspdf";

const CustomerPortal = ({ rooms, halls, menuItems, bookings, diningOrders, user, profile, adminProfile, onCreateBooking, onAddDiningOrder, onAddFeedback, onUpdateProfile, onLogout }) => {
  const [view, setView] = useState('HOME');
  
  // -- BOOKING STATE --
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1); 
  
  // Payment State (Shared)
  // FIXED: Removed <'CARD' | 'QR' | 'CASH'>
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrListening, setQrListening] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // UPI Payment State
  const [upiId, setUpiId] = useState('');

  // Feedback State
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  // FIXED: Removed <'Complaint' | 'Feedback'>
  const [feedbackType, setFeedbackType] = useState('Feedback');

  // Default dates
  const formatDateForInput = (date) => {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  const getTomorrow = (hour) => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(hour, 0, 0, 0);
      return d;
  };

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  
  const [guestName, setGuestName] = useState(user.name || '');
  const [guestEmail, setGuestEmail] = useState(user.email || '');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  // -- PROFILE STATE --
  const [profileTab, setProfileTab] = useState('DETAILS');
  const [isUploading, setIsUploading] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  // -- DINING STATE --
  const [diningCategory, setDiningCategory] = useState('Western');
  const [cart, setCart] = useState([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [diningStep, setDiningStep] = useState(1); // 1: Cart, 2: Payment, 3: Success
  const [roomNumberForFood, setRoomNumberForFood] = useState('');
  const [lastOrderId, setLastOrderId] = useState('');

  // Derived Booking Calculations
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const isValidDateRange = startDate < endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());

  const nights = isValidDateRange ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
  const durationHours = isValidDateRange ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))) : 0;
  
  const calculateTotal = () => {
      if (!isValidDateRange) return 0;
      if (selectedRoom) return selectedRoom.price * nights;
      else if (selectedHall) return selectedHall.pricePerHour * durationHours;
      return 0;
  };
  const total = calculateTotal();
  const taxes = total * 0.18; 
  const grandTotal = total + taxes;

  // --- BOOKING HANDLERS ---
  const handleBookRoomClick = (room) => {
    setSelectedRoom(room);
    setSelectedHall(null);
    setCurrentImageIndex(0);
    setStep(1);
    setPaymentMethod('CARD');
    setQrListening(false);
    
    // Set sensible defaults (Tomorrow 3PM to Day After 11AM)
    const start = getTomorrow(15);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    end.setHours(11, 0, 0, 0);
    
    setCheckIn(formatDateForInput(start));
    setCheckOut(formatDateForInput(end));
    
    setGuestName(profile.name || '');
    setGuestEmail(profile.email || '');
    setIsModalOpen(true);
  };

  const handleBookHallClick = (hall) => {
    setSelectedHall(hall);
    setSelectedRoom(null);
    setCurrentImageIndex(0);
    setStep(1);
    setPaymentMethod('CARD');
    setQrListening(false);
    
    // Set sensible defaults (Tomorrow 10AM to 2PM)
    const start = getTomorrow(10);
    const end = new Date(start);
    end.setHours(14, 0, 0, 0);

    setCheckIn(formatDateForInput(start));
    setCheckOut(formatDateForInput(end));
    
    setGuestName(profile.name || '');
    setGuestEmail(profile.email || '');
    setIsModalOpen(true);
  };

  const hasVerifiedID = () => profile.documents && profile.documents.some(doc => doc.status === 'Verified');

  const handleDetailsSubmit = () => {
      if (!guestName || !guestEmail) return;
      if (!isValidDateRange) {
          alert("Please select a valid date range.");
          return;
      }
      setStep(hasVerifiedID() ? 3 : 2);
  };

  // QR Code Simulation (Shared for Booking and Dining)
  useEffect(() => {
    let timer;
    
    // Booking QR
    if (isModalOpen && step === 3 && paymentMethod === 'QR' && qrListening) {
        timer = setTimeout(() => handleFinalizeBooking('Paid'), 5000);
    }

    // Dining QR
    if (isOrderModalOpen && diningStep === 2 && paymentMethod === 'QR' && qrListening) {
        timer = setTimeout(() => handleFinalizeDiningOrder(), 5000);
    }

    return () => clearTimeout(timer);
  }, [step, paymentMethod, qrListening, isModalOpen, isOrderModalOpen, diningStep]);

  const handleFinalizeBooking = (paymentStatus) => {
      if (!selectedRoom && !selectedHall) return;
      const newBooking = {
        id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        roomId: selectedRoom ? selectedRoom.id : selectedHall.id,
        roomType: selectedRoom ? selectedRoom.type : selectedHall.name,
        bookingCategory: selectedRoom ? 'ROOM' : 'HALL',
        guestName,
        guestEmail,
        checkIn,
        checkOut,
        guests,
        totalPrice: grandTotal,
        status: 'Confirmed',
        paymentStatus: paymentStatus,
        bookingDate: new Date().toISOString()
      };
      onCreateBooking(newBooking);
      setConfirmedBookingId(newBooking.id);
      setIsProcessing(false);
      setQrListening(false);
      setStep(4);
  };

  const handleManualPaymentSubmit = async () => {
    if ((!selectedRoom && !selectedHall) || !guestName || !guestEmail) return;
    
    if (paymentMethod === 'CARD') {
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
            alert("Please enter card details.");
            return;
        }
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        handleFinalizeBooking('Paid');
    } else if (paymentMethod === 'UPI') {
        if (!upiId || !upiId.includes('@')) {
            alert("Please enter a valid UPI ID (e.g., user@paytm)");
            return;
        }
        setIsProcessing(true);
        
        // Create UPI payment URL
        const upiUrl = `upi://pay?pa=${upiId}&pn=Aetheria%20Heights&am=${grandTotal}&cu=INR&tn=Hotel%20Booking%20Payment`;
        
        // Try to open UPI app directly (this will open the native UPI app on mobile)
        try {
            // Create a temporary link element to trigger UPI app
            const upiLink = document.createElement('a');
            upiLink.href = upiUrl;
            upiLink.style.display = 'none';
            document.body.appendChild(upiLink);
            upiLink.click();
            document.body.removeChild(upiLink);
        } catch (error) {
            // Fallback: try window.open with minimal window
            window.open(upiUrl, '_blank', 'width=1,height=1,top=0,left=0');
        }
        
        // Show success message
        alert(`✅ UPI Payment Request Sent!\n\n📱 Your UPI app should open automatically with payment details:\n💰 Amount: ₹${grandTotal}\n👤 Payee: Aetheria Heights\n📝 For: Hotel Booking\n\n⚡ Approve the payment in your UPI app to complete booking`);
        
        // For demo purposes, we'll mark as paid after a delay
        // In real implementation, you'd wait for webhook or user confirmation
        await new Promise(resolve => setTimeout(resolve, 3000));
        handleFinalizeBooking('Paid');
    } else if (paymentMethod === 'CASH') {
        setIsProcessing(true);
        handleFinalizeBooking('Pending');
    } else if (paymentMethod === 'QR') {
        // Fallback if effect doesn't trigger
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        handleFinalizeBooking('Paid');
    }
  };

  // --- NEWSLETTER HANDLER ---
  const handleSubscribe = async (e) => {
      e.preventDefault();
      if (!newsletterEmail) return;

      setIsSubscribing(true);
      try {
          const response = await fetch('http://localhost:3002/api/newsletter/subscribe', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: newsletterEmail })
          });

          const data = await response.json();

          if (response.ok) {
              alert(`Success! \n\n${data.message}\n\nCheck your email for our detailed welcome brochure featuring:\n- Full amenities list\n- Dining menu preview\n- Event hall floor plans\n- Exclusive guest offers`);
              setNewsletterEmail('');
          } else {
              alert(`Error: ${data.error}`);
          }
      } catch (error) {
          console.error('Newsletter subscription error:', error);
          alert('Failed to subscribe to newsletter. Please try again later.');
      } finally {
          setIsSubscribing(false);
      }
  };

  // --- DINING HANDLERS ---
  const addToCart = (item) => {
      setCart(prev => {
          const existing = prev.find(i => i.id === item.id);
          if (existing) {
              return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
          }
          return [...prev, { ...item, quantity: 1 }];
      });
  };

  const removeFromCart = (itemId) => {
      setCart(prev => {
          const existing = prev.find(i => i.id === itemId);
          if (existing && existing.quantity > 1) {
              return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
          }
          return prev.filter(i => i.id !== itemId);
      });
  };

  const calculateFoodTotal = () => {
      return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const isItemInCart = (itemId) => {
      return cart.some(item => item.id === itemId);
  };

  const getCartItemQuantity = (itemId) => {
      const item = cart.find(item => item.id === itemId);
      return item ? item.quantity : 0;
  };

  const handleProceedToDiningPayment = () => {
      if (cart.length === 0 || !roomNumberForFood) return;
      setPaymentMethod('CARD');
      setCardDetails({ number: '', expiry: '', cvv: '', name: '' });
      setQrListening(false);
      setDiningStep(2);
  };

  const handleFinalizeDiningOrder = async () => {
      if (paymentMethod === 'CARD') {
          if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
              alert("Please enter card details.");
              return;
          }
      } else if (paymentMethod === 'UPI') {
          if (!upiId || !upiId.includes('@')) {
              alert("Please enter a valid UPI ID (e.g., user@paytm)");
              return;
          }
          
          // Create UPI payment URL for dining
          const diningTotal = calculateFoodTotal() * 1.15;
          const upiUrl = `upi://pay?pa=${upiId}&pn=Aetheria%20Heights&am=${diningTotal}&cu=INR&tn=Dining%20Order%20Payment`;
          
          // Try to open UPI app directly (this will open the native UPI app on mobile)
          try {
              // Create a temporary link element to trigger UPI app
              const upiLink = document.createElement('a');
              upiLink.href = upiUrl;
              upiLink.style.display = 'none';
              document.body.appendChild(upiLink);
              upiLink.click();
              document.body.removeChild(upiLink);
          } catch (error) {
              // Fallback: try window.open with minimal window
              window.open(upiUrl, '_blank', 'width=1,height=1,top=0,left=0');
          }
          
          // Show success message
          alert(`✅ UPI Payment Request Sent!\n\n📱 Your UPI app should open automatically with payment details:\n💰 Amount: ₹${diningTotal}\n👤 Payee: Aetheria Heights\n📝 For: Dining Order\n\n🍽️ Your order will be prepared after payment approval`);
      }
      
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderId = `FOOD-${Math.floor(Math.random() * 10000)}`;
      
      const newOrder = {
          id: orderId,
          guestName: profile.name,
          guestEmail: profile.email,
          roomNumber: roomNumberForFood,
          items: cart,
          totalPrice: calculateFoodTotal() * 1.15,
          status: 'Preparing',
          orderTime: new Date().toISOString(),
          paymentMethod: paymentMethod
      };
      
      onAddDiningOrder(newOrder);
      setLastOrderId(orderId);
      setIsProcessing(false);
      setQrListening(false);
      setDiningStep(3);
  };

  const closeDiningModal = () => {
      setIsOrderModalOpen(false);
      setDiningStep(1);
      setLastOrderId('');
      setCart([]);
      setRoomNumberForFood('');
  }

  // --- RECEIPTS ---
  const generateReceiptPDF = (booking) => {
    const doc = new jsPDF();
    const gold = '#D4AF37';
    const navy = '#0A192F';
    
    doc.setFillColor(navy);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(gold);
    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.text(adminProfile?.hotelName?.toUpperCase() || "AETHERIA HEIGHTS", 105, 25, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(255, 255, 255);
    doc.text("LUXURY HOSPITALITY SUITE", 105, 35, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const leftMargin = 20;
    doc.text(`Date Issued: ${new Date().toLocaleString()}`, leftMargin, 60);
    doc.text(`Booking Reference: ${booking.id}`, leftMargin, 66);
    
    let yPos = 80;
    const drawSection = (title, data) => {
        doc.setFillColor(230, 230, 230);
        doc.rect(leftMargin, yPos, 170, 8, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(navy);
        doc.text(title.toUpperCase(), leftMargin + 5, yPos + 6);
        yPos += 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        data.forEach(item => {
            doc.setFont("helvetica", "bold");
            doc.text(`${item.label}:`, leftMargin + 5, yPos);
            doc.setFont("helvetica", "normal");
            doc.text(item.value, leftMargin + 60, yPos);
            yPos += 7;
        });
        yPos += 5;
    };

    drawSection("Guest Details", [
        { label: "Guest Name", value: booking.guestName },
        { label: "Email Address", value: booking.guestEmail },
        { label: "Party Size", value: `${booking.guests} Guest(s)` },
    ]);

    drawSection("Reservation Details", [
        { label: "Type", value: booking.roomType },
        { label: "Category", value: booking.bookingCategory },
        { label: "Check-In", value: new Date(booking.checkIn).toLocaleString() },
        { label: "Check-Out", value: new Date(booking.checkOut).toLocaleString() },
    ]);

    drawSection("Payment Information", [
        { label: "Total Amount", value: `INR ${booking.totalPrice.toLocaleString('en-IN')} (incl. taxes)` },
        { label: "Payment Status", value: booking.paymentStatus === 'Paid' ? 'PAID' : booking.paymentStatus === 'Refunded' ? 'REFUNDED' : 'NOT PAID' },
    ]);

    doc.save(`Aetheria_Booking_${booking.id}.pdf`);
  };

  const generateDiningReceiptPDF = (order) => {
      const doc = new jsPDF();
      const gold = '#D4AF37';
      const navy = '#0A192F';
      
      doc.setFillColor(navy);
      doc.rect(0, 0, 210, 50, 'F');
      doc.setTextColor(gold);
      doc.setFont("times", "bold");
      doc.setFontSize(26);
      doc.text(`${adminProfile?.hotelName?.toUpperCase() || "AETHERIA"} DINING`, 105, 25, { align: "center" });
      
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const leftMargin = 20;

      doc.text(`Date: ${new Date(order.orderTime).toLocaleString()}`, leftMargin, 60);
      doc.text(`Order ID: ${order.id}`, leftMargin, 66);
      doc.text(`Room: ${order.roomNumber}`, leftMargin, 72);
      
      let yPos = 94;
      doc.setFillColor(230, 230, 230);
      doc.rect(leftMargin, yPos, 170, 8, 'F');
      doc.setFont("helvetica", "bold");
      doc.setTextColor(navy);
      doc.text("ITEM", leftMargin + 5, yPos + 6);
      doc.text("QTY", 140, yPos + 6);
      doc.text("PRICE", 170, yPos + 6);
      yPos += 14;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      order.items.forEach(item => {
          doc.text(item.name, leftMargin + 5, yPos);
          doc.text(item.quantity.toString(), 145, yPos);
          doc.text(`INR ${(item.price * item.quantity).toLocaleString()}`, 170, yPos);
          yPos += 8;
      });

      yPos += 10;
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL: INR ${order.totalPrice.toLocaleString()}`, 140, yPos);

      doc.save(`Aetheria_Dining_${order.id}.pdf`);
  };

  // Handle immediate download for new booking
  const downloadReceipt = () => {
      if (!selectedRoom && !selectedHall) return;
      // Construct a temporary booking object for the receipt function
      const tempBooking = {
          id: confirmedBookingId,
          roomId: selectedRoom ? selectedRoom.id : selectedHall.id,
          roomType: selectedRoom ? selectedRoom.type : selectedHall.name,
          bookingCategory: selectedRoom ? 'ROOM' : 'HALL',
          guestName,
          guestEmail,
          checkIn,
          checkOut,
          guests,
          totalPrice: grandTotal,
          status: 'Confirmed',
          paymentStatus: paymentMethod === 'CASH' ? 'Pending' : 'Paid',
          bookingDate: new Date().toISOString()
      };
      generateReceiptPDF(tempBooking);
  };

  // Handle immediate download for new food order
  const downloadFoodReceipt = () => {
      const tempOrder = {
          id: lastOrderId,
          guestName: profile.name,
          guestEmail: profile.email,
          roomNumber: roomNumberForFood,
          items: cart,
          totalAmount: calculateFoodTotal() * 1.15,
          status: 'Preparing',
          orderTime: new Date().toISOString(),
          paymentMethod: paymentMethod
      };
      generateDiningReceiptPDF(tempOrder);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
    setSelectedHall(null);
  };

  const filteredRooms = rooms.filter(r => {
    if (r.status !== 'Clean') return false;
    if (guests === 1) return r.maxCapacity >= 1;
    else if (guests === 2) return r.maxCapacity >= 2;
    else if (guests === 3) return r.maxCapacity >= 3;
    else return r.maxCapacity >= 4;
  });

  // --- PROFILE LOGIC ---
  const handleProfilePhotoUpload = (e) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (reader.result) {
                  onUpdateProfile({ ...profile, profileImage: reader.result });
              }
          };
          reader.readAsDataURL(file);
          // Reset value to allow re-upload of same file if needed
          e.target.value = '';
      }
  };

  const handleUploadDocument = (e) => {
      const file = e.target.files?.[0];
      if (file) {
          setIsUploading(true);

          // Convert file to base64 for storage
          const reader = new FileReader();
          reader.onload = (event) => {
              const base64 = event.target.result;
              const newDoc = {
                  id: Date.now().toString(),
                  type: 'National ID',
                  fileName: file.name,
                  fileData: base64, // Store actual file content
                  fileType: file.type,
                  uploadDate: new Date().toISOString().split('T')[0],
                  status: 'Pending'
              };
              const currentDocs = profile.documents || [];
              onUpdateProfile({ ...profile, documents: [...currentDocs, newDoc] });
              setIsUploading(false);
              // Reset value to allow re-upload
              e.target.value = '';
          };
          reader.readAsDataURL(file);
      }
  };

  const handleRemoveDocument = (id) => onUpdateProfile({ ...profile, documents: profile.documents.filter(d => d.id !== id) });
  const handleRemoveCard = (id) => onUpdateProfile({ ...profile, paymentMethods: profile.paymentMethods.filter(p => p.id !== id) });
  const handleAddCard = () => {
      setNewCardDetails({ number: '', expiry: '', cvv: '', name: '' });
      setIsAddCardModalOpen(true);
  };

  const handleSaveCard = (e) => {
      e.preventDefault();
      if (!newCardDetails.number || !newCardDetails.expiry || !newCardDetails.cvv || !newCardDetails.name) {
          alert('Please fill in all card details');
          return;
      }

      // Basic validation
      if (newCardDetails.number.replace(/\s/g, '').length < 16) {
          alert('Please enter a valid card number');
          return;
      }

      if (newCardDetails.cvv.length < 3) {
          alert('Please enter a valid CVV');
          return;
      }

      // Determine card brand
      const cardNumber = newCardDetails.number.replace(/\s/g, '');
      let brand = 'Unknown';
      if (cardNumber.startsWith('4')) brand = 'Visa';
      else if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) brand = 'MasterCard';
      else if (cardNumber.startsWith('3')) brand = 'American Express';

      const newCard = {
          id: Date.now().toString(),
          brand: brand,
          last4: cardNumber.slice(-4),
          expiry: newCardDetails.expiry,
          cardHolder: newCardDetails.name
      };

      onUpdateProfile({ ...profile, paymentMethods: [...profile.paymentMethods, newCard] });
      setIsAddCardModalOpen(false);
      setNewCardDetails({ number: '', expiry: '', cvv: '', name: '' });
  };

  const submitFeedback = (e) => {
      e.preventDefault();
      if (!feedbackSubject || !feedbackMessage) return;
      
      const newFeedback = {
          id: Date.now().toString(),
          userId: user.id,
          userName: user.name,
          email: user.email,
          type: feedbackType,
          subject: feedbackSubject,
          message: feedbackMessage,
          date: new Date().toISOString(),
          status: 'New'
      };
      
      onAddFeedback(newFeedback);
      setFeedbackSubject('');
      setFeedbackMessage('');
      alert("Thank you for your feedback! We will review it shortly.");
  };

  // --- NEW RENDER HELPERS (About, Privacy, Terms) ---
  const renderAbout = () => (
    <div className="max-w-7xl mx-auto py-24 px-4 min-h-[80vh] animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Hero */}
        <div className="relative rounded-3xl overflow-hidden mb-16 h-[400px]">
             <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?random=about')] bg-cover bg-center">
                 <div className="absolute inset-0 bg-black/60"></div>
             </div>
             <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
                 <h2 className="text-5xl font-serif text-white mb-6">The Aetheria Standard</h2>
                 <p className="max-w-2xl text-xl text-gray-200 font-light">Where timeless elegance meets cutting-edge innovation.</p>
             </div>
        </div>

        {/* Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
                <h3 className="text-3xl font-serif text-aetheria-gold mb-6">Our Philosophy</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                    Aetheria Heights was born from a singular vision: to create a sanctuary where the friction of travel dissolves, leaving only the experience. We believe that true luxury is seamlessness.
                </p>
                <p className="text-gray-300 leading-relaxed">
                    By integrating state-of-the-art technology—from our AI Concierge to instant digital invoicing—we ensure that your focus remains entirely on your enjoyment, relaxation, and the moments that matter.
                </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <img src="https://picsum.photos/400/500?random=arch1" className="rounded-lg opacity-80 hover:opacity-100 transition-opacity" />
                <img src="https://picsum.photos/400/500?random=arch2" className="rounded-lg mt-8 opacity-80 hover:opacity-100 transition-opacity" />
            </div>
        </div>

        {/* Features Grid */}
        <div className="mb-24">
            <h3 className="text-3xl font-serif text-white text-center mb-12">Elevated Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: Sparkles, title: "AI Concierge", desc: "Your personal digital assistant, available 24/7 to fulfill amenity requests and answer queries instantly." },
                    { icon: QrCode, title: "Smart Access", desc: "Seamless check-in experiences and secure digital interactions throughout your stay." },
                    { icon: Calendar, title: "Effortless Booking", desc: "Real-time availability for suites and event halls with transparent, instant confirmation." },
                    { icon: Utensils, title: "Gourmet Dining", desc: "Curated culinary masterpieces delivered directly to your suite with live tracking." },
                    { icon: Shield, title: "Privacy First", desc: "Your data and comfort are paramount. We employ top-tier security for all guest interactions." },
                    { icon: Download, title: "Instant Paperwork", desc: "Access invoices, receipts, and booking details instantly via your personal portal." }
                ].map((feat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-8 rounded-xl hover:bg-white/10 transition-colors group">
                        <div className="w-12 h-12 bg-aetheria-gold/10 rounded-full flex items-center justify-center text-aetheria-gold mb-6 group-hover:scale-110 transition-transform">
                            <feat.icon className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-3">{feat.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="max-w-4xl mx-auto py-24 px-4 min-h-[80vh] text-gray-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-4xl font-serif text-white mb-8">Privacy Policy</h2>
        <div className="bg-white/5 border border-white/10 p-8 rounded-xl space-y-6">
            <p className="text-sm">Last Updated: October 24, 2024</p>
            <section>
                <h3 className="text-xl font-bold text-white mb-2">1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, make a reservation, or communicate with us. This includes:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Name, email address, and phone number.</li>
                    <li>Payment information (processed via secure third-party gateways).</li>
                    <li>Passport or ID documents for verification purposes.</li>
                </ul>
            </section>
            <section>
                <h3 className="text-xl font-bold text-white mb-2">2. How We Use Your Information</h3>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Process your bookings and payments.</li>
                    <li>Provide customer support and AI concierge services.</li>
                    <li>Send you technical notices, updates, and security alerts.</li>
                </ul>
            </section>
            <section>
                <h3 className="text-xl font-bold text-white mb-2">3. Data Security</h3>
                <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized alteration, loss, or misuse.</p>
            </section>
        </div>
    </div>
  );

  const renderTerms = () => (
    <div className="max-w-4xl mx-auto py-24 px-4 min-h-[80vh] text-gray-300 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-4xl font-serif text-white mb-8">Terms of Service</h2>
        <div className="bg-white/5 border border-white/10 p-8 rounded-xl space-y-6">
            <p className="text-sm">Last Updated: October 24, 2024</p>
            <section>
                <h3 className="text-xl font-bold text-white mb-2">1. Acceptance of Terms</h3>
                <p>By accessing or using our website and services, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
            </section>
            <section>
                <h3 className="text-xl font-bold text-white mb-2">2. Booking & Cancellations</h3>
                <p>All bookings are subject to availability. Cancellations must be made at least 48 hours in advance for a full refund. Late cancellations may be subject to fees equivalent to one night's stay.</p>
            </section>
            <section>
                <h3 className="text-xl font-bold text-white mb-2">3. Hotel Rules</h3>
                <p>Guests are expected to conduct themselves in a respectful manner. Any damage to property will be billed to the card on file. Check-in is at 3:00 PM and Check-out is at 11:00 AM.</p>
            </section>
            <section>
                <h3 className="text-xl font-bold text-white mb-2">4. AI Concierge Usage</h3>
                <p>The AI Concierge is provided as a convenience tool. While we strive for accuracy, Aetheria Heights is not liable for misunderstandings arising from AI interactions.</p>
            </section>
        </div>
    </div>
  );

  // --- RENDER HELPERS ---
  const renderProfile = () => (
      <div className="max-w-7xl mx-auto py-24 px-4 min-h-[80vh]">
          {/* ... existing profile render logic ... */}
          <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-64 flex flex-col gap-2">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-lg text-center mb-4">
                      <div className="relative w-24 h-24 mx-auto mb-4 group cursor-pointer">
                          <div className="w-full h-full rounded-full overflow-hidden border-2 border-aetheria-gold/30 flex items-center justify-center bg-aetheria-gold/10">
                              {profile.profileImage ? (
                                  <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                  <UserIcon className="w-10 h-10 text-aetheria-gold" />
                              )}
                          </div>
                          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-6 h-6 text-white" />
                          </div>
                          <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleProfilePhotoUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                      </div>
                      
                      <h3 className="font-bold text-lg text-white">{profile.name}</h3>
                      <p className="text-xs text-gray-400">Loyalty Member</p>
                  </div>
                  
                  <nav className="space-y-1">
                      {['DETAILS', 'PREFS', 'WALLET', 'DOCS'].map(tab => (
                          <button 
                              key={tab}
                              onClick={() => setProfileTab(tab)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${profileTab === tab ? 'bg-aetheria-gold text-aetheria-navy' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                          >
                              {tab === 'DETAILS' && <UserIcon className="w-4 h-4" />}
                              {tab === 'PREFS' && <Settings className="w-4 h-4" />}
                              {tab === 'WALLET' && <CreditCard className="w-4 h-4" />}
                              {tab === 'DOCS' && <Shield className="w-4 h-4" />}
                              {tab === 'DETAILS' ? 'Personal Details' : tab === 'PREFS' ? 'Stay Preferences' : tab === 'WALLET' ? 'Wallet' : 'Identity Vault'}
                          </button>
                      ))}
                  </nav>
              </div>

              <div className="flex-1 bg-black/20 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
                  {/* ... existing profile tabs content ... */}
                  {profileTab === 'DETAILS' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                          <h2 className="text-2xl font-serif text-white mb-6">Personal Information</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {['Full Name', 'Email Address', 'Phone Number', 'Address'].map(label => (
                                  <div key={label} className="space-y-2">
                                      <label className="text-xs uppercase text-gray-500 font-bold">{label}</label>
                                      <input 
                                          type="text" 
                                          value={label === 'Full Name' ? profile.name : label === 'Email Address' ? profile.email : label === 'Phone Number' ? profile.phone : profile.address}
                                          onChange={(e) => onUpdateProfile({
                                              ...profile, 
                                              [label === 'Full Name' ? 'name' : label === 'Email Address' ? 'email' : label === 'Phone Number' ? 'phone' : 'address']: e.target.value
                                          })}
                                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-aetheria-gold outline-none"
                                      />
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {profileTab === 'PREFS' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                          <h2 className="text-2xl font-serif text-white mb-6">Stay Preferences</h2>
                          <div className="space-y-4">
                              <div className="space-y-2">
                                  <label className="text-xs uppercase text-gray-500 font-bold">Preferred Floor</label>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {['High', 'Low', 'Ground', 'No Preference'].map((opt) => (
                                          <button 
                                              key={opt}
                                              onClick={() => onUpdateProfile({...profile, preferences: {...profile.preferences, preferredFloor: opt}})}
                                              className={`py-2 px-4 rounded border text-sm font-medium transition-colors ${profile.preferences?.preferredFloor === opt ? 'bg-aetheria-gold border-aetheria-gold text-aetheria-navy' : 'border-white/20 text-gray-400 hover:border-white'}`}
                                          >
                                              {opt}
                                          </button>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {profileTab === 'WALLET' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                           <div className="flex justify-between items-center mb-4">
                              <h2 className="text-2xl font-serif text-white">Saved Cards</h2>
                              <button onClick={handleAddCard} className="text-xs flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-white transition-colors">
                                  <Plus className="w-3 h-3" /> Add Card
                              </button>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {profile.paymentMethods.map((card) => (
                                   <div key={card.id} className="relative group p-6 rounded-xl bg-gradient-to-br from-slate-800 to-black border border-white/10 hover:border-aetheria-gold/50 transition-colors">
                                       <div className="flex justify-between items-start mb-4">
                                           <div className="text-xs uppercase text-gray-500 font-bold">{card.brand}</div>
                                           <button onClick={() => handleRemoveCard(card.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                                       </div>
                                       <div className="text-xl font-mono text-white tracking-widest mb-4">**** **** **** {card.last4}</div>
                                       <div className="flex justify-between items-end">
                                            <div className="text-xs text-gray-400">
                                                <div className="uppercase text-[10px]">Card Holder</div>
                                                <div className="font-bold text-white">{card.cardHolder}</div>
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                <div className="uppercase text-[10px]">Expires</div>
                                                <div className="font-bold text-white">{card.expiry}</div>
                                            </div>
                                       </div>
                                   </div>
                               ))}
                           </div>
                      </div>
                  )}

                  {profileTab === 'DOCS' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                          <h2 className="text-2xl font-serif text-white mb-6">Identity Vault</h2>
                          <div className="space-y-3">
                              {(profile.documents || []).map((doc) => (
                                  <div key={doc.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                                      <div className="flex items-center gap-4">
                                          <div className="p-2 bg-slate-800 rounded text-aetheria-gold"><FileText className="w-6 h-6" /></div>
                                          <div><div className="font-bold text-white">{doc.type}</div><div className="text-xs text-gray-500">{doc.fileName}</div></div>
                                      </div>
                                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${doc.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>{doc.status}</span>
                                      <button onClick={() => handleRemoveDocument(doc.id)} className="text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                              ))}
                          </div>
                          <div className="mt-8 border-t border-white/10 pt-6">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-aetheria-gold hover:bg-white/5 transition-all">
                                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-aetheria-gold" /> : <><Upload className="w-8 h-8 text-gray-500 mb-2" /><span className="text-sm text-gray-400">Upload Document</span></>}
                                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUploadDocument} disabled={isUploading} />
                              </label>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );

  const renderMyBookings = () => (
      <div className="max-w-7xl mx-auto py-24 px-4 min-h-[80vh]">
          <h2 className="text-4xl font-serif text-white mb-8">My History</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Room & Hall Bookings */}
              <div>
                  <h3 className="text-xl font-bold text-aetheria-gold mb-6 flex items-center gap-2"><Calendar className="w-5 h-5"/> Reservations</h3>
                  <div className="space-y-4">
                      {bookings.length === 0 ? (
                          <div className="p-8 text-center bg-white/5 rounded-xl text-gray-500">No reservations found.</div>
                      ) : (
                          bookings.map(booking => (
                              <div key={booking.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-aetheria-gold/30 transition-all">
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{booking.bookingCategory}</div>
                                          <h4 className="text-lg font-bold text-white">{booking.roomType}</h4>
                                      </div>
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${booking.status === 'Confirmed' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                          {booking.status}
                                      </span>
                                  </div>
                                  <div className="flex gap-6 text-sm text-gray-300 mb-6">
                                      <div>
                                          <div className="text-gray-500 text-xs">Check In</div>
                                          <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                                      </div>
                                      <div>
                                          <div className="text-gray-500 text-xs">Check Out</div>
                                          <div>{new Date(booking.checkOut).toLocaleDateString()}</div>
                                      </div>
                                      <div className="ml-auto text-right">
                                          <div className="text-gray-500 text-xs">Total</div>
                                          <div className="font-bold text-aetheria-gold">₹{booking.totalPrice.toLocaleString()}</div>
                                      </div>
                                  </div>
                                  <button onClick={() => generateReceiptPDF(booking)} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center gap-2 text-sm text-white transition-colors">
                                      <Download className="w-4 h-4" /> Download Receipt
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>

              {/* Dining Orders */}
              <div>
                  <h3 className="text-xl font-bold text-aetheria-gold mb-6 flex items-center gap-2"><Utensils className="w-5 h-5"/> Dining Orders</h3>
                  <div className="space-y-4">
                      {diningOrders.length === 0 ? (
                          <div className="p-8 text-center bg-white/5 rounded-xl text-gray-500">No dining history available.</div>
                      ) : (
                          diningOrders.map(order => (
                              <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-aetheria-gold/30 transition-all">
                                  <div className="flex justify-between items-start mb-4">
                                      <div>
                                          <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Room {order.roomNumber}</div>
                                          <h4 className="text-lg font-bold text-white">In-Room Dining</h4>
                                      </div>
                                      <span className="text-xs text-gray-400">{new Date(order.orderTime).toLocaleDateString()}</span>
                                  </div>
                                  <div className="space-y-1 mb-6">
                                      {order.items.map((item, i) => (
                                          <div key={i} className="flex justify-between text-sm text-gray-300">
                                              <span>{item.quantity}x {item.name}</span>
                                              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                          </div>
                                      ))}
                                      <div className="border-t border-white/10 pt-2 mt-2 flex justify-between font-bold text-white">
                                          <span>Total Paid</span>
                                          <span>₹{order.totalPrice.toLocaleString()}</span>
                                      </div>
                                  </div>
                                  <button onClick={() => generateDiningReceiptPDF(order)} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center gap-2 text-sm text-white transition-colors">
                                      <Download className="w-4 h-4" /> Download Bill
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderFAQ = () => (
      <div className="max-w-4xl mx-auto py-24 px-4 min-h-[80vh]">
          <h2 className="text-4xl font-serif text-white mb-4 text-center">Frequently Asked Questions</h2>
          <p className="text-gray-400 text-center mb-12">Everything you need to know for a perfect stay.</p>
          
          <div className="space-y-6">
              {[
                  { q: "What are the check-in and check-out times?", a: "Check-in is from 3:00 PM onwards, and check-out is until 11:00 AM. Early check-in and late check-out are subject to availability." },
                  { q: "Is breakfast included in the room rate?", a: "Complimentary gourmet breakfast is included for all VIP suites (Ocean View, Penthouse). For other rooms, it can be added during booking or upon arrival." },
                  { q: "Do you offer airport transfers?", a: "Yes, we offer luxury chauffeur services. You can request this via the Aetheria Dashboard or contact the concierge directly." },
                  { q: "What is your cancellation policy?", a: "Cancellations made 48 hours prior to arrival are fully refundable. Late cancellations may incur a one-night charge." },
                  { q: "Are pets allowed?", a: "Aetheria Heights is a pet-friendly establishment. A small cleaning fee applies for furry companions." },
                  { q: "How do I access the Wi-Fi?", a: "High-speed Wi-Fi is complimentary throughout the property. Select 'Aetheria_Guest' and log in with your room number and last name." }
              ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                      <h4 className="text-lg font-bold text-white mb-2 flex items-start gap-3"><HelpCircle className="w-5 h-5 text-aetheria-gold flex-shrink-0 mt-1"/> {item.q}</h4>
                      <p className="text-gray-400 ml-8 leading-relaxed">{item.a}</p>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderFeedback = () => (
      <div className="max-w-2xl mx-auto py-24 px-4 min-h-[80vh]">
          <div className="text-center mb-12">
              <MessageCircle className="w-16 h-16 text-aetheria-gold mx-auto mb-6" />
              <h2 className="text-4xl font-serif text-white mb-4">We Value Your Voice</h2>
              <p className="text-gray-400">Your experience shapes our legacy. Please share your compliments, suggestions, or concerns.</p>
          </div>

          <form onSubmit={submitFeedback} className="bg-white/5 border border-white/10 p-8 rounded-2xl space-y-6">
              <div className="flex bg-black/40 p-1 rounded-lg">
                  <button type="button" onClick={() => setFeedbackType('Feedback')} className={`flex-1 py-3 rounded-md text-sm font-bold transition-all ${feedbackType === 'Feedback' ? 'bg-aetheria-gold text-aetheria-navy' : 'text-gray-400 hover:text-white'}`}>General Feedback</button>
                  <button type="button" onClick={() => setFeedbackType('Complaint')} className={`flex-1 py-3 rounded-md text-sm font-bold transition-all ${feedbackType === 'Complaint' ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'}`}>Report an Issue</button>
              </div>

              <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Subject</label>
                  <input 
                      type="text" 
                      value={feedbackSubject} 
                      onChange={e => setFeedbackSubject(e.target.value)} 
                      placeholder="Brief title (e.g. Room Service, Pool Area)" 
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white focus:border-aetheria-gold outline-none"
                  />
              </div>

              <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Message</label>
                  <textarea 
                      rows={5}
                      value={feedbackMessage} 
                      onChange={e => setFeedbackMessage(e.target.value)} 
                      placeholder="Tell us more about your experience..." 
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white focus:border-aetheria-gold outline-none resize-none"
                  />
              </div>

              <button type="submit" className="w-full bg-aetheria-gold text-aetheria-navy font-bold py-4 rounded-lg hover:bg-white transition-colors">
                  Submit {feedbackType}
              </button>
          </form>
      </div>
  );

  return (
    <div className="min-h-screen bg-aetheria-navy text-white font-sans selection:bg-aetheria-gold selection:text-aetheria-navy flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-aetheria-navy/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="text-2xl font-serif font-bold text-white cursor-pointer flex items-center gap-2" onClick={() => setView('HOME')}>
            <span className="text-aetheria-gold">✦</span> Aetheria.
        </div>
        
        <div className="hidden md:flex bg-black/30 rounded-full p-1 border border-white/10">
            <button onClick={() => setView('HOME')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${view === 'HOME' ? 'bg-aetheria-gold text-aetheria-navy' : 'text-gray-400 hover:text-white'}`}>Suites</button>
            <button onClick={() => setView('HALLS')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${view === 'HALLS' ? 'bg-aetheria-gold text-aetheria-navy' : 'text-gray-400 hover:text-white'}`}>Event Halls</button>
            <button onClick={() => setView('DINING')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${view === 'DINING' ? 'bg-aetheria-gold text-aetheria-navy' : 'text-gray-400 hover:text-white'}`}>Dining</button>
        </div>

        <div className="flex items-center gap-6">
            {/* User Menu Dropdown (Simplified as visible buttons for this layout) */}
            <div className="hidden md:flex items-center gap-4 text-xs font-bold text-gray-400">
                <button onClick={() => setView('MY_BOOKINGS')} className={`hover:text-white transition-colors ${view === 'MY_BOOKINGS' ? 'text-aetheria-gold' : ''}`}>My Bookings</button>
                <button onClick={() => setView('FAQ')} className={`hover:text-white transition-colors ${view === 'FAQ' ? 'text-aetheria-gold' : ''}`}>FAQ</button>
                <button onClick={() => setView('FEEDBACK')} className={`hover:text-white transition-colors ${view === 'FEEDBACK' ? 'text-aetheria-gold' : ''}`}>Feedback</button>
            </div>

            <button onClick={() => setView('PROFILE')} className="hidden md:flex items-center gap-2 text-sm text-gray-200 hover:text-white transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold overflow-hidden border ${view === 'PROFILE' ? 'border-aetheria-gold bg-aetheria-gold text-aetheria-navy' : 'border-aetheria-gold/30 bg-aetheria-gold text-aetheria-navy'}`}>
                    {profile.profileImage ? (
                        <img src={profile.profileImage} alt="User" className="w-full h-full object-cover" />
                    ) : (
                        user.name.charAt(0)
                    )}
                </div>
            </button>
            <button onClick={onLogout} className="text-gray-400 hover:text-red-400 transition-colors"><LogOut className="w-5 h-5" /></button>
        </div>
      </nav>

      <div className="pt-20 flex-grow"> 
      
      {/* HOME VIEW (Suites) */}
      {view === 'HOME' && (
          // ... Existing Home View content ...
          <>
            <div className="relative h-[60vh] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?random=10')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-aetheria-navy/60 via-aetheria-navy/30 to-aetheria-navy"></div>
                </div>
                <div className="relative text-center px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h5 className="text-aetheria-gold uppercase tracking-[0.3em] text-sm mb-4">Welcome to</h5>
                    <h1 className="text-6xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-2xl">Aetheria Heights</h1>
                    <p className="max-w-xl mx-auto text-lg text-gray-200 font-light">Where minimalist luxury meets the infinite horizon.</p>
                </div>
            </div>

            {/* Sticky Booking Bar */}
            <div className="sticky top-[72px] z-40 bg-aetheria-navy/95 backdrop-blur-md border-b border-white/10 py-4 px-4 shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    <div className="flex-1 flex items-center gap-3 bg-black/40 px-4 py-3 rounded border border-white/10 min-w-[240px]">
                        <Calendar className="text-aetheria-gold w-5 h-5 flex-shrink-0" />
                        <div className="flex flex-col w-full"><span className="text-xs text-gray-400 uppercase flex items-center gap-1">Check In <Clock className="w-3 h-3"/></span><input type="datetime-local" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="bg-transparent text-sm font-bold focus:outline-none text-white w-full appearance-none [&::-webkit-calendar-picker-indicator]:invert" /></div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 bg-black/40 px-4 py-3 rounded border border-white/10 min-w-[240px]">
                        <Calendar className="text-aetheria-gold w-5 h-5 flex-shrink-0" />
                        <div className="flex flex-col w-full"><span className="text-xs text-gray-400 uppercase flex items-center gap-1">Check Out <Clock className="w-3 h-3"/></span><input type="datetime-local" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="bg-transparent text-sm font-bold focus:outline-none text-white w-full appearance-none [&::-webkit-calendar-picker-indicator]:invert" /></div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 bg-black/40 px-4 py-3 rounded border border-white/10 min-w-[150px]">
                        <Users className="text-aetheria-gold w-5 h-5 flex-shrink-0" />
                        <div className="flex flex-col w-full"><span className="text-xs text-gray-400 uppercase">Guests</span><select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="bg-transparent text-sm font-bold focus:outline-none text-white appearance-none w-full">{[1,2,3,4,5,6,7,8,9,10].map(num => (<option key={num} value={num} className="text-black">{num} Guest{num > 1 ? 's' : ''}</option>))}</select></div>
                    </div>
                </div>
                <button onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full xl:w-auto bg-aetheria-gold text-aetheria-navy font-bold uppercase tracking-wider py-3 px-8 hover:bg-white transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)] whitespace-nowrap">Update Search</button>
                </div>
            </div>

            <section id="rooms-section" className="max-w-7xl mx-auto py-12 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {filteredRooms.map((room) => (
                        <div key={room.id} onClick={() => handleBookRoomClick(room)} className="group cursor-pointer bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-aetheria-gold/50 transition-all duration-300 hover:transform hover:-translate-y-2">
                            <div className="h-64 overflow-hidden relative">
                                <img src={room.images[0]} alt={room.type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur text-white px-3 py-1 rounded text-sm font-bold border border-white/20">₹{room.price.toLocaleString('en-IN')} <span className="text-xs font-normal text-gray-400">/ night</span></div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-aetheria-gold transition-colors">{room.type}</h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{room.description}</p>
                                <div className="flex flex-wrap gap-2">{room.amenities.slice(0,3).map((am, i) => (<span key={i} className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-1 rounded text-gray-300">{am}</span>))}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-24 px-4 bg-gradient-to-b from-aetheria-navy to-black relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute right-0 top-0 w-96 h-96 bg-aetheria-gold rounded-full blur-[128px]"></div>
                    <div className="absolute left-0 bottom-0 w-96 h-96 bg-blue-900 rounded-full blur-[128px]"></div>
                </div>
                
                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-8 text-aetheria-gold">
                        <Mail className="w-8 h-8" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Stay Connected to Luxury</h2>
                    <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                        Join our exclusive mailing list to receive our curated brochure, upcoming event schedules, and private offers directly to your inbox.
                    </p>
                    
                    <form onSubmit={handleSubscribe} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
                        <input 
                            type="email" 
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                            className="flex-1 bg-white/5 border border-white/10 rounded-full py-4 px-6 text-white placeholder-gray-500 focus:outline-none focus:border-aetheria-gold transition-colors"
                        />
                        <button 
                            type="submit" 
                            disabled={isSubscribing}
                            className="bg-aetheria-gold text-aetheria-navy font-bold py-4 px-8 rounded-full hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Subscribe'}
                        </button>
                    </form>
                    <p className="text-xs text-gray-600 mt-6">
                        By subscribing, you agree to receive communications from Aetheria Heights. 
                        <br/>We respect your privacy.
                    </p>
                </div>
            </section>
          </>
      )}

      {/* HALLS VIEW */}
      {view === 'HALLS' && (
          // ... Existing Halls View ...
          <>
            <div className="relative h-[50vh] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?random=88')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-aetheria-navy/80 via-aetheria-navy/50 to-aetheria-navy"></div>
                </div>
                <div className="relative text-center px-4 animate-in fade-in zoom-in duration-700">
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4">Grand Event Spaces</h1>
                    <p className="max-w-2xl mx-auto text-lg text-gray-300">Host your unforgettable moments in our world-class halls.</p>
                </div>
            </div>
            <section className="max-w-7xl mx-auto py-12 px-4">
                <div className="grid grid-cols-1 gap-12">
                    {halls.map((hall, idx) => (
                        <div key={hall.id} className={`flex flex-col md:flex-row gap-8 items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-6 hover:border-aetheria-gold/30 transition-all ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                            <div className="w-full md:w-1/2 h-80 rounded-xl overflow-hidden relative group">
                                <img src={hall.images[0]} alt={hall.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute top-4 left-4 bg-aetheria-gold text-aetheria-navy px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">{hall.type}</div>
                            </div>
                            <div className="w-full md:w-1/2 flex flex-col justify-center">
                                <h3 className="text-3xl font-serif font-bold text-white mb-2">{hall.name}</h3>
                                <p className="text-gray-400 mb-6 leading-relaxed">{hall.description}</p>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="flex items-center gap-3"><div className="p-2 bg-white/10 rounded-full text-aetheria-gold"><Users className="w-5 h-5" /></div><div><div className="text-xs text-gray-500 uppercase">Capacity</div><div className="text-white font-bold">{hall.capacity} Guests</div></div></div>
                                    <div className="flex items-center gap-3"><div className="p-2 bg-white/10 rounded-full text-aetheria-gold"><Banknote className="w-5 h-5" /></div><div><div className="text-xs text-gray-500 uppercase">Rate</div><div className="text-white font-bold">₹{hall.pricePerHour.toLocaleString()}/hr</div></div></div>
                                </div>
                                <button onClick={() => handleBookHallClick(hall)} className="w-fit px-8 py-3 bg-aetheria-gold text-aetheria-navy font-bold rounded-lg hover:bg-white transition-colors">Check Availability & Book</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
          </>
      )}

      {/* DINING VIEW */}
      {view === 'DINING' && (
        // ... Existing Dining View ...
        <>
            <div className="relative h-[50vh] w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?random=food_hero')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-aetheria-navy/80 via-aetheria-navy/50 to-aetheria-navy"></div>
                </div>
                <div className="relative text-center px-4 animate-in fade-in zoom-in duration-700">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border border-aetheria-gold/30 bg-black/30 backdrop-blur-md mb-6 text-aetheria-gold">
                        <Utensils className="w-10 h-10" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4">Culinary Excellence</h1>
                    <p className="max-w-2xl mx-auto text-lg text-gray-300">Exquisite in-room dining brought to your sanctuary.</p>
                </div>
            </div>

            <section className="max-w-7xl mx-auto py-12 px-4 relative">
                {/* Dining Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 sticky top-24 z-30 bg-aetheria-navy/95 backdrop-blur py-4 -mx-4 px-4 border-b border-white/10">
                    <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                        <button onClick={() => setDiningCategory('Western')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${diningCategory === 'Western' ? 'bg-aetheria-gold text-aetheria-navy' : 'text-gray-400 hover:text-white'}`}>Western</button>
                        <button onClick={() => setDiningCategory('Indian')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${diningCategory === 'Indian' ? 'bg-aetheria-gold text-aetheria-navy' : 'text-gray-400 hover:text-white'}`}>Indian</button>
                    </div>
                    
                    <button 
                        onClick={() => setIsOrderModalOpen(true)}
                        className="flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full border border-white/10 hover:border-aetheria-gold/50 transition-all relative"
                    >
                        <ShoppingBag className="w-5 h-5 text-aetheria-gold" />
                        <span className="font-bold text-white">Your Order</span>
                        {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{cart.reduce((a,b) => a + b.quantity, 0)}</span>}
                        <span className="text-gray-400 text-sm ml-2 border-l border-white/20 pl-3">₹{calculateFoodTotal().toLocaleString()}</span>
                    </button>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {menuItems.filter(item => item.category === diningCategory).map(item => (
                        <div key={item.id} className="flex gap-4 bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-aetheria-gold/30 transition-all group p-4">
                            <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden relative">
                                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold ${item.type === 'Veg' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>{item.type}</div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-serif font-bold text-lg text-white">{item.name}</h3>
                                    <span className="font-bold text-aetheria-gold">₹{item.price}</span>
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                                <div className="mt-auto flex justify-between items-center">
                                    <span className="text-[10px] text-gray-500">{item.calories} kcal</span>
                                    {isItemInCart(item.id) ? (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-red-500/20 text-white"><Minus className="w-3 h-3" /></button>
                                            <span className="text-white font-bold w-6 text-center">{getCartItemQuantity(item.id)}</span>
                                            <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-green-500/20 text-white"><Plus className="w-3 h-3" /></button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => addToCart(item)}
                                            className="bg-white/10 hover:bg-aetheria-gold hover:text-aetheria-navy text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            Add <Plus className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
      )}

      {view === 'PROFILE' && renderProfile()}
      {view === 'MY_BOOKINGS' && renderMyBookings()}
      {view === 'FAQ' && renderFAQ()}
      {view === 'FEEDBACK' && renderFeedback()}
      {view === 'ABOUT' && renderAbout()}
      {view === 'PRIVACY' && renderPrivacy()}
      {view === 'TERMS' && renderTerms()}

      </div>

      {/* FOOTER */}
      <footer className="bg-black py-16 px-4 border-t border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
              
              {/* Brand Section */}
              <div className="space-y-6">
                  <div className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                      <span className="text-aetheria-gold">✦</span> {adminProfile?.hotelName || 'Aetheria'}.
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                      Experience the pinnacle of minimalist luxury. Where modern elegance meets the infinite horizon, providing a sanctuary for the discerning traveler.
                  </p>
                  <div className="flex gap-4">
                      {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                          <a key={i} href="#" onClick={(e) => e.preventDefault()} className="text-gray-500 hover:text-aetheria-gold transition-colors">
                              <Icon className="w-5 h-5" />
                          </a>
                      ))}
                  </div>
              </div>

              {/* Navigation Links */}
              <div>
                  <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Quick Links</h4>
                  <ul className="space-y-4 text-sm text-gray-400">
                      <li><button onClick={() => setView('HOME')} className="hover:text-aetheria-gold transition-colors text-left w-full">Luxury Suites</button></li>
                      <li><button onClick={() => setView('DINING')} className="hover:text-aetheria-gold transition-colors text-left w-full">In-Room Dining</button></li>
                      <li><button onClick={() => setView('HALLS')} className="hover:text-aetheria-gold transition-colors text-left w-full">Event Spaces</button></li>
                      <li><button onClick={() => setView('MY_BOOKINGS')} className="hover:text-aetheria-gold transition-colors text-left w-full">My Bookings</button></li>
                      <li><button onClick={() => setView('ABOUT')} className="hover:text-aetheria-gold transition-colors text-left w-full text-aetheria-gold/80 font-bold">About Us</button></li>
                  </ul>
              </div>

              {/* Contact Info */}
              <div>
                  <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Contact Us</h4>
                  <ul className="space-y-4 text-sm text-gray-400">
                      <li className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-aetheria-gold flex-shrink-0 mt-0.5" />
                          <span>{adminProfile?.location || '1 Ocean Drive, Azure Coast\nParadise City, PC 10001'}</span>
                      </li>
                      <li className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-aetheria-gold flex-shrink-0" />
                          <a href={`tel:${adminProfile?.phone || '+15551234567'}`} className="hover:text-white transition-colors">{adminProfile?.phone || '+1 (555) 123-4567'}</a>
                      </li>
                      <li className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-aetheria-gold flex-shrink-0" />
                          <a href={`mailto:${adminProfile?.email || 'concierge@aetheria.com'}`} className="hover:text-white transition-colors">{adminProfile?.email || 'concierge@aetheria.com'}</a>
                      </li>
                  </ul>
              </div>

              {/* Legal / Hours */}
              <div>
                  <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Front Desk Hours</h4>
                  <ul className="space-y-2 text-sm text-gray-400 mb-6">
                      <li className="flex justify-between"><span>Mon - Fri</span> <span className="text-white">24 Hours</span></li>
                      <li className="flex justify-between"><span>Sat - Sun</span> <span className="text-white">24 Hours</span></li>
                  </ul>
                  <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Legal</h4>
                  <ul className="space-y-2 text-sm text-gray-400">
                      <li><button onClick={() => setView('PRIVACY')} className="hover:text-aetheria-gold text-left w-full">Privacy Policy</button></li>
                      <li><button onClick={() => setView('TERMS')} className="hover:text-aetheria-gold text-left w-full">Terms of Service</button></li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
              <p>&copy; {new Date().getFullYear()} {adminProfile?.hotelName || 'Aetheria Heights'} Hospitality Group. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                  <span>Designed for Luxury</span>
              </div>
          </div>
      </footer>

      {/* BOOKING MODAL */}
      {isModalOpen && (selectedRoom || selectedHall) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-[#0B1120] border border-aetheria-gold/30 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
              <div><h3 className="text-2xl font-serif text-white">{step === 4 ? "Booking Confirmed" : "Complete Reservation"}</h3></div>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-8 overflow-y-auto glass-scroll">
              {step === 1 && (
                <div className="space-y-6">
                  {/* ... Booking Form Content Same as Before ... */}
                  <div className="bg-white/5 p-4 rounded-lg flex flex-col md:flex-row gap-4">
                    <img src={selectedRoom ? selectedRoom.images[currentImageIndex] : selectedHall.images[currentImageIndex]} alt="Preview" className="w-32 h-32 object-cover rounded" />
                    <div>
                        <h4 className="text-xl font-bold text-aetheria-gold">{selectedRoom ? selectedRoom.type : selectedHall.name}</h4>
                        <div className="text-lg font-bold mt-2 text-white">₹{grandTotal.toLocaleString('en-IN')} <span className="text-xs font-normal text-gray-500">(inc. GST)</span></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Booking Dates</label>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="datetime-local" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="bg-white/5 border border-white/10 rounded p-3 text-white" />
                            <input type="datetime-local" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="bg-white/5 border border-white/10 rounded p-3 text-white" />
                        </div>
                        {!isValidDateRange && <p className="text-red-400 text-xs mt-2">Invalid date range. Checkout must be after Check-in.</p>}
                    </div>
                    <div><label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Organizer Name</label><input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 text-white" /></div>
                    <div><label className="block text-xs uppercase text-gray-500 mb-1 font-bold">Contact Email</label><input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded p-3 text-white" /></div>
                  </div>
                  <div className="flex justify-end pt-4"><button onClick={handleDetailsSubmit} disabled={!guestName || !guestEmail || !isValidDateRange} className="bg-aetheria-gold text-aetheria-navy font-bold py-3 px-8 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Continue</button></div>
                </div>
              )}
              {step === 2 && (
                  <div className="space-y-6">
                      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg flex gap-3"><AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" /><div><h4 className="text-amber-500 font-bold mb-1">Verification Required</h4><p className="text-sm text-gray-400">ID required.</p></div></div>
                      <div className="border-t border-white/10 pt-6">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-aetheria-gold hover:bg-white/5 transition-all">
                              {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-aetheria-gold" /> : <><Upload className="w-8 h-8 text-gray-500 mb-2" /><span className="text-sm text-gray-400">Upload Document</span></>}
                              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleUploadDocument} disabled={isUploading} />
                          </label>
                      </div>
                      
                      {/* Document List Feedback */}
                      {profile.documents && profile.documents.length > 0 && (
                          <div className="bg-white/5 rounded-lg p-3 space-y-2">
                              <p className="text-xs font-bold text-gray-400 uppercase">Attached Documents</p>
                              {profile.documents.map((doc) => (
                                  <div key={doc.id} className="flex items-center justify-between bg-black/30 p-2 rounded border border-white/10">
                                      <div className="flex items-center gap-2 overflow-hidden">
                                          <FileText className="w-4 h-4 text-aetheria-gold flex-shrink-0" />
                                          <span className="text-sm text-white truncate max-w-[150px]">{doc.fileName}</span>
                                      </div>
                                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${doc.status === 'Verified' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                          {doc.status}
                                      </span>
                                  </div>
                              ))}
                          </div>
                      )}

                      <div className="flex justify-between pt-4">
                          <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white">Back</button>
                          <button 
                              onClick={() => setStep(3)} 
                              disabled={!profile.documents || profile.documents.length === 0}
                              className="bg-aetheria-gold text-aetheria-navy font-bold py-3 px-8 rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Proceed
                          </button>
                      </div>
                  </div>
              )}
              {step === 3 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4"><span className="text-gray-400">Total Payable</span><span className="text-2xl font-bold text-white">₹{grandTotal.toLocaleString('en-IN')}</span></div>
                    
                    <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-lg">
                        <button onClick={() => { setPaymentMethod('CARD'); setQrListening(false); }} className={`py-2 rounded text-sm font-bold transition-all ${paymentMethod === 'CARD' ? 'bg-aetheria-gold text-aetheria-navy shadow-lg' : 'text-gray-400 hover:text-white'}`}>Card</button>
                        <button onClick={() => { setPaymentMethod('UPI'); setQrListening(false); }} className={`py-2 rounded text-sm font-bold transition-all ${paymentMethod === 'UPI' ? 'bg-aetheria-gold text-aetheria-navy shadow-lg' : 'text-gray-400 hover:text-white'}`}>UPI Pay</button>
                        <button onClick={() => { setPaymentMethod('QR'); setQrListening(true); }} className={`py-2 rounded text-sm font-bold transition-all ${paymentMethod === 'QR' ? 'bg-aetheria-gold text-aetheria-navy shadow-lg' : 'text-gray-400 hover:text-white'}`}>QR Pay</button>
                        <button onClick={() => { setPaymentMethod('CASH'); setQrListening(false); }} className={`py-2 rounded text-sm font-bold transition-all ${paymentMethod === 'CASH' ? 'bg-aetheria-gold text-aetheria-navy shadow-lg' : 'text-gray-400 hover:text-white'}`}>Later</button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-6 min-h-[200px] flex flex-col justify-center">
                        {paymentMethod === 'CARD' && (
                            <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input 
                                        type="text" 
                                        placeholder="Card Number" 
                                        value={cardDetails.number}
                                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded p-3 pl-10 text-white text-sm outline-none focus:border-aetheria-gold"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY" 
                                        value={cardDetails.expiry}
                                        onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm outline-none focus:border-aetheria-gold"
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="CVV" 
                                        value={cardDetails.cvv}
                                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm outline-none focus:border-aetheria-gold"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 text-center mt-2 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Secure Transaction</p>
                            </div>
                        )}

                        {paymentMethod === 'UPI' && (
                            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-aetheria-gold">
                                        <Smartphone className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-white font-bold mb-2">UPI Payment</h4>
                                    <p className="text-sm text-gray-400">Enter your UPI ID to receive payment notification</p>
                                </div>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="yourname@paytm / @ybl / @oksbi"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded p-3 pl-10 text-white text-sm outline-none focus:border-aetheria-gold"
                                    />
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p>• Enter your UPI ID (e.g., user@paytm, user@ybl)</p>
                                    <p>• You'll receive a payment notification on your phone</p>
                                    <p>• Approve the payment in your UPI app</p>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'QR' && (
                            <div className="text-center animate-in fade-in zoom-in duration-300">
                                <div className="bg-white p-2 rounded-lg inline-block mb-4">
                                    <QrCode className="w-32 h-32 text-black" />
                                </div>
                                <p className="text-sm text-gray-300 mb-2">Scan with any UPI app</p>
                                <div className="flex items-center justify-center gap-2 text-aetheria-gold text-xs">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Waiting for payment...
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'CASH' && (
                            <div className="text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-aetheria-gold">
                                    <Banknote className="w-8 h-8" />
                                </div>
                                <h4 className="text-white font-bold mb-2">Pay at Hotel</h4>
                                <p className="text-sm text-gray-400">Your booking will be held. Please settle the amount upon arrival at the front desk.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between pt-4"><button onClick={() => setStep(hasVerifiedID() ? 1 : 2)} className="text-gray-400 hover:text-white">Back</button><button onClick={handleManualPaymentSubmit} disabled={isProcessing} className="bg-aetheria-gold text-aetheria-navy font-bold py-3 px-8 rounded hover:bg-white transition-colors flex items-center justify-center min-w-[140px] disabled:opacity-50">{isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}</button></div>
                </div>
              )}
              {step === 4 && (
                <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500 relative">
                  {/* Subtle confetti background or effect */}
                  <div className="flex justify-center mb-6 relative">
                      <div className="absolute inset-0 animate-ping opacity-20 bg-emerald-500 rounded-full"></div>
                      <CheckCircle className="w-20 h-20 text-emerald-500 relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                      <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDuration: '2s' }} />
                      <Sparkles className="absolute -bottom-2 -left-4 w-6 h-6 text-yellow-400 animate-bounce" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }} />
                  </div>
                  <h2 className="text-4xl font-serif text-white mb-2">Booking Confirmed</h2>
                  <p className="text-gray-400 text-lg">Your sanctuary awaits.</p>
                  <div className="bg-white/5 inline-block px-6 py-2 rounded-lg border border-white/10 mt-4">
                      <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Reference Number</span>
                      <span className="text-xl font-mono text-aetheria-gold">{confirmedBookingId}</span>
                  </div>
                  <div className="pt-8 flex justify-center gap-4">
                      <button onClick={closeModal} className="border border-white/20 text-white py-2 px-6 rounded hover:bg-white/5 transition-colors">Close</button>
                      <button onClick={downloadReceipt} className="bg-aetheria-gold text-aetheria-navy py-2 px-6 rounded font-bold flex items-center gap-2 hover:bg-white transition-colors shadow-lg shadow-aetheria-gold/20">
                          <Download className="w-4 h-4"/> Download Receipt
                      </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DINING ORDER MODAL */}
      {isOrderModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !lastOrderId && closeDiningModal()}></div>
              <div className="relative bg-[#0B1120] border border-aetheria-gold/30 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                      <h3 className="text-xl font-serif text-white">{diningStep === 3 ? 'Order Confirmed' : diningStep === 2 ? 'Payment' : 'Your Order'}</h3>
                      {!lastOrderId && <button onClick={closeDiningModal}><X className="w-6 h-6 text-gray-400" /></button>}
                  </div>
                  <div className="p-6 max-h-[70vh] overflow-y-auto glass-scroll">
                      {diningStep === 3 ? (
                          <div className="text-center py-8">
                              <ChefHat className="w-16 h-16 text-aetheria-gold mx-auto mb-4" />
                              <h2 className="text-2xl font-bold text-white mb-2">Kitchen is Preparing</h2>
                              <p className="text-gray-400 mb-6">Your order will be delivered to Room {roomNumberForFood} shortly.</p>
                              <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                                  <div className="flex justify-between text-sm mb-2"><span className="text-gray-400">Order ID:</span><span className="text-white font-mono">{lastOrderId}</span></div>
                                  <div className="flex justify-between text-sm"><span className="text-gray-400">Estimated Time:</span><span className="text-white">35-45 mins</span></div>
                              </div>
                              <div className="flex gap-4 justify-center">
                                  <button onClick={closeDiningModal} className="text-gray-400 hover:text-white">Close</button>
                                  <button onClick={downloadFoodReceipt} className="bg-aetheria-gold text-aetheria-navy px-6 py-2 rounded font-bold flex items-center gap-2"><Download className="w-4 h-4" /> Download Bill</button>
                              </div>
                          </div>
                      ) : diningStep === 2 ? (
                          // ... existing payment step in dining ...
                          <div className="space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400">Order Total</span>
                                <span className="text-2xl font-bold text-white">₹{(calculateFoodTotal() * 1.15).toLocaleString()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-lg">
                                <button onClick={() => { setPaymentMethod('CARD'); setQrListening(false); }} className={`py-2 rounded text-sm font-bold transition-all ${paymentMethod === 'CARD' ? 'bg-aetheria-gold text-aetheria-navy shadow-lg' : 'text-gray-400 hover:text-white'}`}>Card</button>
                                <button onClick={() => { setPaymentMethod('UPI'); setQrListening(false); }} className={`py-2 rounded text-sm font-bold transition-all ${paymentMethod === 'UPI' ? 'bg-aetheria-gold text-aetheria-navy shadow-lg' : 'text-gray-400 hover:text-white'}`}>UPI Pay</button>
                                <button onClick={() => { setPaymentMethod('QR'); setQrListening(true); }} className={`py-2 rounded text-sm font-bold transition-all ${paymentMethod === 'QR' ? 'bg-aetheria-gold text-aetheria-navy shadow-lg' : 'text-gray-400 hover:text-white'}`}>QR Pay</button>
                                <button onClick={() => { setPaymentMethod('CASH'); setQrListening(false); }} className={`py-2 rounded text-sm font-bold transition-all ${paymentMethod === 'CASH' ? 'bg-aetheria-gold text-aetheria-navy shadow-lg' : 'text-gray-400 hover:text-white'}`}>Charge</button>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-lg p-6 min-h-[200px] flex flex-col justify-center">
                                {paymentMethod === 'CARD' && (
                                    <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                                        <div className="relative">
                                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input 
                                                type="text" 
                                                placeholder="Card Number" 
                                                value={cardDetails.number}
                                                onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                                                className="w-full bg-black/40 border border-white/10 rounded p-3 pl-10 text-white text-sm outline-none focus:border-aetheria-gold"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <input 
                                                type="text" 
                                                placeholder="MM/YY" 
                                                value={cardDetails.expiry}
                                                onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm outline-none focus:border-aetheria-gold"
                                            />
                                            <input 
                                                type="text" 
                                                placeholder="CVV" 
                                                value={cardDetails.cvv}
                                                onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                                                className="w-full bg-black/40 border border-white/10 rounded p-3 text-white text-sm outline-none focus:border-aetheria-gold"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 text-center mt-2 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Secure Transaction</p>
                                    </div>
                                )}

                                {paymentMethod === 'UPI' && (
                                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                        <div className="text-center mb-4">
                                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 text-aetheria-gold">
                                                <Smartphone className="w-8 h-8" />
                                            </div>
                                            <h4 className="text-white font-bold mb-2">UPI Payment</h4>
                                            <p className="text-sm text-gray-400">Enter your UPI ID to receive payment notification</p>
                                        </div>
                                        <div className="relative">
                                            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="yourname@paytm / @ybl / @oksbi"
                                                value={upiId}
                                                onChange={(e) => setUpiId(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded p-3 pl-10 text-white text-sm outline-none focus:border-aetheria-gold"
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p>• Enter your UPI ID (e.g., user@paytm, user@ybl)</p>
                                            <p>• You'll receive a payment notification on your phone</p>
                                            <p>• Approve the payment in your UPI app</p>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'QR' && (
                                    <div className="text-center animate-in fade-in zoom-in duration-300">
                                        <div className="bg-white p-2 rounded-lg inline-block mb-4">
                                            <QrCode className="w-32 h-32 text-black" />
                                        </div>
                                        <p className="text-sm text-gray-300 mb-2">Scan with any UPI app</p>
                                        <div className="flex items-center justify-center gap-2 text-aetheria-gold text-xs">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Waiting for payment...
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === 'CASH' && (
                                    <div className="text-center animate-in fade-in zoom-in duration-300">
                                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-aetheria-gold">
                                            <Banknote className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-white font-bold mb-2">Room Charge</h4>
                                        <p className="text-sm text-gray-400">Total will be added to your final room bill for settlement at checkout.</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between pt-4">
                                <button onClick={() => setDiningStep(1)} className="text-gray-400 hover:text-white">Back</button>
                                <button onClick={handleFinalizeDiningOrder} disabled={isProcessing} className="bg-aetheria-gold text-aetheria-navy font-bold py-3 px-8 rounded hover:bg-white transition-colors flex items-center justify-center min-w-[140px] disabled:opacity-50">
                                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay & Order'}
                                </button>
                            </div>
                          </div>
                      ) : (
                          // ... existing cart view ...
                          <>
                            {cart.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">Your cart is empty.</div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                            <div>
                                                <div className="font-bold text-white">{item.name}</div>
                                                <div className="text-xs text-aetheria-gold">₹{item.price} x {item.quantity}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-red-500/20 text-white"><Minus className="w-3 h-3" /></button>
                                                <span className="text-white font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-green-500/20 text-white"><Plus className="w-3 h-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                                        <div className="flex justify-between text-sm text-gray-400"><span>Subtotal</span><span>₹{calculateFoodTotal().toLocaleString()}</span></div>
                                        <div className="flex justify-between text-sm text-gray-400"><span>Taxes & Service (15%)</span><span>₹{(calculateFoodTotal() * 0.15).toLocaleString()}</span></div>
                                        <div className="flex justify-between text-xl font-bold text-white mt-2 pt-2 border-t border-white/10"><span>Total</span><span>₹{(calculateFoodTotal() * 1.15).toLocaleString()}</span></div>
                                    </div>

                                    <div className="bg-aetheria-navy/50 p-4 rounded-lg border border-white/10 mt-4">
                                        <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Deliver to Room</label>
                                        <input 
                                            type="text" 
                                            placeholder="Enter Room Number"
                                            value={roomNumberForFood}
                                            onChange={(e) => setRoomNumberForFood(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded p-3 text-white focus:border-aetheria-gold outline-none"
                                        />
                                    </div>

                                    <button 
                                        onClick={handleProceedToDiningPayment}
                                        disabled={!roomNumberForFood || isProcessing}
                                        className="w-full bg-aetheria-gold text-aetheria-navy font-bold py-4 rounded-lg mt-4 hover:bg-white transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        Proceed to Payment <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Add Card Modal */}
      {isAddCardModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-aetheria-navy border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif font-bold text-white">Add New Card</h3>
              <button 
                onClick={() => setIsAddCardModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="space-y-6">
              <div>
                <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Card Number</label>
                <input 
                  type="text" 
                  placeholder="1234 5678 9012 3456"
                  value={newCardDetails.number}
                  onChange={(e) => setNewCardDetails({...newCardDetails, number: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white focus:border-aetheria-gold outline-none"
                  maxLength="19"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Expiry Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    value={newCardDetails.expiry}
                    onChange={(e) => setNewCardDetails({...newCardDetails, expiry: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white focus:border-aetheria-gold outline-none"
                    maxLength="5"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-500 font-bold mb-2">CVV</label>
                  <input 
                    type="text" 
                    placeholder="123"
                    value={newCardDetails.cvv}
                    onChange={(e) => setNewCardDetails({...newCardDetails, cvv: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white focus:border-aetheria-gold outline-none"
                    maxLength="4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-gray-500 font-bold mb-2">Name on Card</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={newCardDetails.name}
                  onChange={(e) => setNewCardDetails({...newCardDetails, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-4 text-white focus:border-aetheria-gold outline-none"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddCardModalOpen(false)}
                  className="flex-1 bg-gray-600 text-white font-bold py-3 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-aetheria-gold text-aetheria-navy font-bold py-3 rounded-lg hover:bg-white transition-colors"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerPortal;