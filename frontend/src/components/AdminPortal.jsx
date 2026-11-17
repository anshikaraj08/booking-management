import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BedDouble, 
  CalendarCheck, 
  DollarSign, 
  Users, 
  Search, 
  LogOut,
  X,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  XCircle,
  Pencil,
  Landmark,
  LogIn,
  LogOut as LogOutIcon,
  Ban,
  Utensils,
  ChefHat,
  Settings,
  Camera,
  Save,
  Building,
  FileBarChart,
  Wallet,
  Download,
  Receipt,
  CreditCard,
  Filter,
  Printer,
  PieChart,
  Star,
  Gift,
  History,
  FileEdit,
  User as UserIcon,
  Eye,
  MessageSquareWarning
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { jsPDF } from "jspdf";

const AdminPortal = ({ 
    rooms, halls, menuItems, bookings, profiles, feedbacks = [], 
    onUpdateRoomStatus, onUpdateBooking, 
    onAddRoom, onEditRoom, onDeleteRoom,
    onAddHall, onEditHall, onDeleteHall,
    onAddMenuItem, onEditMenuItem, onDeleteMenuItem,
    onUpdateProfile, user, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Get current admin profile
  const adminProfile = profiles.find(p => p.email === user.email);
  
  // Guest Verification & Management State
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [documentToVerify, setDocumentToVerify] = useState(null);
  const [documentToView, setDocumentToView] = useState(null);
  const [guestModalTab, setGuestModalTab] = useState('PROFILE');
  const [loyaltyInput, setLoyaltyInput] = useState(0);
  const [notesInput, setNotesInput] = useState('');
  
  // Add/Edit Room State
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [newRoom, setNewRoom] = useState({
    number: '', type: 'Deluxe Suite', category: 'General', price: 0, maxCapacity: 2, description: '', amenities: [], status: 'Clean', images: []
  });
  
  // Add/Edit Hall State
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);
  const [isEditingHall, setIsEditingHall] = useState(false);
  const [currentHallId, setCurrentHallId] = useState('');
  const [newHall, setNewHall] = useState({
      name: '', type: 'Wedding', pricePerHour: 0, capacity: 50, status: 'Available', description: '', features: [], images: []
  });

  // Add/Edit Menu Item State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [currentMenuId, setCurrentMenuId] = useState('');
  const [newMenuItem, setNewMenuItem] = useState({
      name: '', description: '', price: 0, category: 'Western', type: 'Veg', images: [], calories: 0
  });
  
  // Settings State
  const [settingsForm, setSettingsForm] = useState({
      name: user.name,
      hotelName: adminProfile?.hotelName || 'Aetheria Heights',
      email: user.email,
      phone: adminProfile?.phone || '',
      location: adminProfile?.location || ''
  });
  
  // Report State
  const [reportType, setReportType] = useState('FINANCIAL');
  const [reportDateRange, setReportDateRange] = useState({
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
      end: new Date().toISOString().split('T')[0] // Today
  });

  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');

  // Update settings form when profile loads
  useEffect(() => {
      if (adminProfile) {
          setSettingsForm({
              name: adminProfile.name,
              hotelName: adminProfile.hotelName || 'Aetheria Heights',
              email: adminProfile.email,
              phone: adminProfile.phone || '',
              location: adminProfile.location || ''
          });
      }
  }, [adminProfile]);

  // Handle Guest Modal Open
  const handleOpenGuestModal = (profile) => {
      setSelectedProfile(profile);
      setGuestModalTab('PROFILE');
      setNotesInput(profile.adminNotes || '');
      setLoyaltyInput(0);
  };

  // Update Guest Logic
  const handleSaveGuestNotes = () => {
      if (selectedProfile) {
          onUpdateProfile({ ...selectedProfile, adminNotes: notesInput });
          alert("Notes updated successfully.");
      }
  };

  const handleUpdateLoyalty = (action) => {
      if (selectedProfile && loyaltyInput > 0) {
          const newPoints = action === 'ADD' 
              ? (selectedProfile.loyaltyPoints || 0) + loyaltyInput 
              : Math.max(0, (selectedProfile.loyaltyPoints || 0) - loyaltyInput);
          
          onUpdateProfile({ ...selectedProfile, loyaltyPoints: newPoints });
          setLoyaltyInput(0);
      }
  };

  const handleTierUpdate = (tier) => {
      if (selectedProfile) {
          onUpdateProfile({ ...selectedProfile, loyaltyTier: tier });
      }
  };

  // Calculated Stats
  const revenue = bookings.reduce((acc, curr) => acc + (curr.paymentStatus === 'Paid' ? curr.totalPrice : 0), 0);
  const outstanding = bookings.reduce((acc, curr) => acc + (curr.paymentStatus === 'Pending' ? curr.totalPrice : 0), 0);
  const occupancyRate = Math.round((rooms.filter(r => r.status === 'Occupied').length / rooms.length) * 100);
  const recentBookingsCount = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Checked In').length;
  const pendingDocsCount = profiles.reduce((acc, p) => acc + p.documents.filter(d => d.status === 'Pending').length, 0);

  const stats = [
    { label: 'Total Revenue', value: `₹${revenue.toLocaleString('en-IN')}`, change: '+12%', trend: 'up' },
    { label: 'Occupancy', value: `${occupancyRate}%`, change: '+5%', trend: 'up' },
    { label: 'Active Bookings', value: recentBookingsCount.toString(), change: 'Live', trend: 'neutral' },
    { label: 'Pending Verifications', value: pendingDocsCount.toString(), change: 'Action Req', trend: pendingDocsCount > 0 ? 'down' : 'up' },
  ];

  const chartData = [
    { name: 'Mon', revenue: 34000 },
    { name: 'Tue', revenue: 25500 },
    { name: 'Wed', revenue: 42500 },
    { name: 'Thu', revenue: 38250 },
    { name: 'Fri', revenue: 68000 },
    { name: 'Sat', revenue: 80750 },
    { name: 'Sun', revenue: 59500 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Clean': case 'Available': case 'Paid': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Dirty': case 'Booked': case 'Checked Out': case 'Cancelled': case 'Refunded': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Occupied': case 'Checked In': case 'Confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Maintenance': case 'Pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const generateAdminInvoice = (booking) => {
    const doc = new jsPDF();
    const gold = '#D4AF37';
    const navy = '#0A192F';
    
    // Header
    doc.setFillColor(navy);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(gold);
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text(adminProfile?.hotelName?.toUpperCase() || "AETHERIA HEIGHTS", 20, 25);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("OFFICIAL INVOICE", 170, 25, { align: 'right' });

    // Info
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Booking Ref: ${booking.id}`, 20, 66);
    
    doc.text(`Bill To:`, 140, 60);
    doc.setFont("helvetica", "bold");
    doc.text(booking.guestName, 140, 65);
    doc.setFont("helvetica", "normal");
    doc.text(booking.guestEmail, 140, 70);

    // Table Header
    let y = 90;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, y+7);
    doc.text("Amount", 170, y+7);

    // Items
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.text(`${booking.bookingCategory} Charge (${booking.roomType})`, 25, y);
    doc.text(`INR ${booking.totalPrice.toLocaleString('en-IN')}`, 170, y);
    
    y += 10;
    doc.setDrawColor(200);
    doc.line(20, y, 190, y);
    
    // Totals
    y += 15;
    doc.setFont("helvetica", "bold");
    doc.text("Total", 140, y);
    doc.text(`INR ${booking.totalPrice.toLocaleString('en-IN')}`, 170, y);
    
    y += 10;
    const statusColor = booking.paymentStatus === 'Paid' ? '#10B981' : booking.paymentStatus === 'Refunded' ? '#EF4444' : '#F59E0B';
    doc.setTextColor(statusColor);
    doc.setFont("helvetica", "bold");
    doc.text(`PAYMENT STATUS: ${booking.paymentStatus.toUpperCase()}`, 25, y);

    doc.save(`Invoice_${booking.id}.pdf`);
  };

  const getFilteredReportData = () => {
    const start = new Date(reportDateRange.start).getTime();
    const end = new Date(reportDateRange.end).getTime() + (24 * 60 * 60 * 1000); // Include end day

    if (reportType === 'FINANCIAL') {
        return bookings.filter(b => {
            const date = new Date(b.checkIn).getTime();
            return date >= start && date <= end;
        });
    } else if (reportType === 'OCCUPANCY') {
        // For occupancy, we might want to show rooms and their stats within period
        // For simplicity, showing bookings list that occupy rooms in that period
        return bookings.filter(b => {
            const date = new Date(b.checkIn).getTime();
            return date >= start && date <= end;
        });
    } else if (reportType === 'GUESTS') {
        // Guests joined or active in period. Using booking date as proxy for active guests, 
        // or just return all guests if range is wide.
        // Let's return unique guests from bookings in range + profiles
        const activeBookings = bookings.filter(b => {
            const date = new Date(b.checkIn).getTime();
            return date >= start && date <= end;
        });
        const activeEmails = new Set(activeBookings.map(b => b.guestEmail));
        return profiles.filter(p => activeEmails.has(p.email) || p.role === 'GUEST');
    }
    return [];
  };

  const generateReportPDF = (data, type) => {
    const doc = new jsPDF();
    const navy = '#0A192F';
    const gold = '#D4AF37';

    doc.setFillColor(navy);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(gold);
    doc.setFontSize(22);
    doc.text(adminProfile?.hotelName?.toUpperCase() || "AETHERIA HEIGHTS", 105, 20, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`${type} REPORT`, 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`${reportDateRange.start} to ${reportDateRange.end}`, 105, 36, { align: 'center' });

    let y = 50;
    doc.setTextColor(0, 0, 0);

    // Simple table generator
    if (type === 'FINANCIAL') {
        const total = data.reduce((acc, curr) => acc + curr.totalPrice, 0);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Revenue: INR ${total.toLocaleString()}`, 14, y);
        y += 10;
        
        doc.setFillColor(230, 230, 230);
        doc.rect(14, y, 182, 8, 'F');
        doc.text("Date", 16, y + 6);
        doc.text("Guest", 60, y + 6);
        doc.text("Status", 120, y + 6);
        doc.text("Amount", 170, y + 6);
        y += 14;

        doc.setFont("helvetica", "normal");
        data.forEach((b) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(new Date(b.checkIn).toLocaleDateString(), 16, y);
            doc.text(b.guestName.substring(0, 25), 60, y);
            doc.text(b.paymentStatus, 120, y);
            doc.text(String(b.totalPrice), 170, y);
            y += 8;
        });
    } else if (type === 'GUESTS') {
        doc.setFont("helvetica", "bold");
        doc.text(`Total Guests: ${data.length}`, 14, y);
        y += 10;
        
        doc.setFillColor(230, 230, 230);
        doc.rect(14, y, 182, 8, 'F');
        doc.text("Name", 16, y + 6);
        doc.text("Email", 70, y + 6);
        doc.text("Phone", 140, y + 6);
        y += 14;

        doc.setFont("helvetica", "normal");
        data.forEach((p) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(p.name, 16, y);
            doc.text(p.email, 70, y);
            doc.text(String(p.phone || 'N/A'), 140, y);
            y += 8;
        });
    }

    doc.save(`${type}_Report_${reportDateRange.start}.pdf`);
  };

  const downloadCSV = (data, type) => {
    let headers = '';
    let rows = [];
    
    if (type === 'FINANCIAL' || type === 'OCCUPANCY') {
        headers = 'ID,Date,Guest,Room Type,Category,Status,Payment Status,Total Price';
        rows = data.map((b) => 
            `${b.id},${new Date(b.checkIn).toLocaleDateString()},${b.guestName},${b.roomType},${b.bookingCategory},${b.status},${b.paymentStatus},${b.totalPrice}`
        );
    } else if (type === 'GUESTS') {
        headers = 'ID,Name,Email,Phone,Role,Loyalty Tier';
        rows = data.map((p) => 
            `${p.id},${p.name},${p.email},${p.phone || ''},${p.role},Member`
        );
    }

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDocumentAction = (profileId, docId, action) => {
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) return;
      const updatedDocs = profile.documents.map(d => d.id === docId ? { ...d, status: action } : d);
      onUpdateProfile({ ...profile, documents: updatedDocs });
      setDocumentToVerify(null);
  };

  const handleOpenAddRoom = () => {
      setIsEditingRoom(false);
      setNewRoom({ number: '', type: 'Deluxe Suite', category: 'General', price: 0, maxCapacity: 2, description: '', amenities: [], status: 'Clean', images: [] });
      setAmenitiesInput('');
      setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room) => {
      setIsEditingRoom(true);
      setCurrentRoomId(room.id);
      setNewRoom({ ...room });
      setAmenitiesInput(room.amenities.join(', '));
      setIsRoomModalOpen(true);
  };

  const submitRoom = (e) => {
      e.preventDefault();
      if (!newRoom.number || !newRoom.price || !newRoom.type) return;

      const roomData = {
          id: isEditingRoom ? currentRoomId : `ROOM-${Date.now()}`,
          number: newRoom.number,
          type: newRoom.type,
          category: newRoom.category,
          price: Number(newRoom.price),
          maxCapacity: Number(newRoom.maxCapacity),
          status: newRoom.status,
          images: (newRoom.images && newRoom.images.length > 0) ? newRoom.images : ['https://picsum.photos/800/600?grayscale'],
          description: newRoom.description || '',
          amenities: amenitiesInput.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (isEditingRoom) {
          onEditRoom(roomData);
      } else {
          onAddRoom(roomData);
      }
      setIsRoomModalOpen(false);
  };

  const handleOpenAddHall = () => {
      setIsEditingHall(false);
      setNewHall({ name: '', type: 'Wedding', pricePerHour: 0, capacity: 50, status: 'Available', description: '', features: [], images: [] });
      setFeaturesInput('');
      setIsHallModalOpen(true);
  };

  const handleOpenEditHall = (hall) => {
      setIsEditingHall(true);
      setCurrentHallId(hall.id);
      setNewHall({ ...hall });
      setFeaturesInput(hall.features.join(', '));
      setIsHallModalOpen(true);
  };

  const submitHall = (e) => {
      e.preventDefault();
      if (!newHall.name || !newHall.pricePerHour) return;

      const hallData = {
          id: isEditingHall ? currentHallId : `HALL-${Date.now()}`,
          name: newHall.name,
          type: newHall.type,
          pricePerHour: Number(newHall.pricePerHour),
          capacity: Number(newHall.capacity),
          status: newHall.status,
          images: (newHall.images && newHall.images.length > 0) ? newHall.images : ['https://picsum.photos/800/600?grayscale'],
          description: newHall.description || '',
          features: featuresInput.split(',').map(s => s.trim()).filter(Boolean)
      };

      if (isEditingHall) {
          onEditHall(hallData);
      } else {
          onAddHall(hallData);
      }
      setIsHallModalOpen(false);
  };

  const handleOpenAddMenu = () => {
      setIsEditingMenu(false);
      setNewMenuItem({ name: '', description: '', price: 0, category: 'Western', type: 'Veg', images: [], calories: 0 });
      setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (item) => {
      setIsEditingMenu(true);
      setCurrentMenuId(item.id);
      setNewMenuItem({ ...item });
      setIsMenuModalOpen(true);
  };

  const submitMenu = (e) => {
      e.preventDefault();
      if (!newMenuItem.name || !newMenuItem.price) return;

      const menuData = {
          id: isEditingMenu ? currentMenuId : `DISH-${Date.now()}`,
          name: newMenuItem.name || 'Unknown Dish',
          description: newMenuItem.description || '',
          price: Number(newMenuItem.price),
          category: newMenuItem.category,
          type: newMenuItem.type,
          images: (newMenuItem.images && newMenuItem.images.length > 0) ? newMenuItem.images : ['https://picsum.photos/800/600?grayscale'],
          calories: Number(newMenuItem.calories)
      };

      if (isEditingMenu) {
          onEditMenuItem(menuData);
      } else {
          onAddMenuItem(menuData);
      }
      setIsMenuModalOpen(false);
  };


  const handleImageUpload = (e, type) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (type === 'PROFILE') {
          const file = files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              if (reader.result && adminProfile) {
                  onUpdateProfile({ ...adminProfile, profileImage: reader.result });
              }
          };
          reader.readAsDataURL(file);
      } else {
          Array.from(files).forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (reader.result) {
                    if (type === 'ROOM') {
                        setNewRoom(prev => ({ ...prev, images: [...(prev.images || []), reader.result] }));
                    } else if (type === 'HALL') {
                        setNewHall(prev => ({ ...prev, images: [...(prev.images || []), reader.result] }));
                    } else if (type === 'MENU') {
                        setNewMenuItem(prev => ({ ...prev, images: [...(prev.images || []), reader.result] }));
                    }
                }
              };
              reader.readAsDataURL(file);
          });
      }
    }
  };

  const removeImage = (index, type) => {
      if (type === 'ROOM') {
          setNewRoom(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) }));
      } else if (type === 'HALL') {
          setNewHall(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) }));
      } else {
          setNewMenuItem(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) }));
      }
  };

  const handleUpdateSettings = (e) => {
      e.preventDefault();
      if (adminProfile) {
          onUpdateProfile({
              ...adminProfile,
              name: settingsForm.name,
              hotelName: settingsForm.hotelName,
              phone: settingsForm.phone,
              location: settingsForm.location
          });
          alert('Settings updated successfully!');
      }
  };

  const renderFeedback = () => (
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-slate-800">
              <h3 className="font-bold text-white">Feedback & Complaints</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-slate-800/50 text-slate-200 font-medium">
                      <tr>
                          <th className="p-4">Type</th>
                          <th className="p-4">Guest</th>
                          <th className="p-4">Subject</th>
                          <th className="p-4">Message</th>
                          <th className="p-4">Date</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {feedbacks.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-slate-500">No feedback received yet.</td></tr>
                      ) : (
                          feedbacks.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="p-4">
                                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${item.type === 'Complaint' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                          {item.type}
                                      </span>
                                  </td>
                                  <td className="p-4">
                                      <div className="font-bold text-white">{item.userName}</div>
                                      <div className="text-xs">{item.email}</div>
                                  </td>
                                  <td className="p-4 font-bold text-white">{item.subject}</td>
                                  <td className="p-4 max-w-xs truncate" title={item.message}>{item.message}</td>
                                  <td className="p-4 text-xs">{new Date(item.date).toLocaleDateString()}</td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-aetheria-gold/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-slate-400 text-sm font-bold uppercase">{stat.label}</div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${stat.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : stat.trend === 'down' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-300'}`}>{stat.change}</span>
                    </div>
                    <div className="text-3xl font-serif text-white font-bold">{stat.value}</div>
                </div>
            ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Revenue Analytics</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );

  const renderBookings = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-800/50 text-slate-200 font-medium">
                    <tr>
                        <th className="p-4">Ref ID</th>
                        <th className="p-4">Guest</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Check In</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Total</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                            <td className="p-4 font-mono text-white">{booking.id}</td>
                            <td className="p-4">
                                <div className="font-bold text-white">{booking.guestName}</div>
                                <div className="text-xs">{booking.guestEmail}</div>
                            </td>
                            <td className="p-4">
                                <div className="text-white">{booking.roomType}</div>
                                <div className="text-xs">{booking.bookingCategory}</div>
                            </td>
                            <td className="p-4">{new Date(booking.checkIn).toLocaleDateString()}</td>
                            <td className="p-4"><span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${getStatusColor(booking.status)}`}>{booking.status}</span></td>
                            <td className="p-4"><span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${booking.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : booking.paymentStatus === 'Refunded' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>{booking.paymentStatus}</span></td>
                            <td className="p-4 font-bold text-aetheria-gold">₹{booking.totalPrice.toLocaleString()}</td>
                            <td className="p-4 text-right">
                                <button className="text-aetheria-gold hover:text-white transition-colors"><Pencil className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderRooms = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-end">
              <button onClick={handleOpenAddRoom} className="bg-aetheria-gold text-aetheria-navy px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-white transition-colors"><Plus className="w-4 h-4" /> Add Suite</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map(room => (
                  <div key={room.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-aetheria-gold/30 transition-all">
                      <div className="relative h-48">
                          <img src={room.images[0]} alt={room.type} className="w-full h-full object-cover" />
                          <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusColor(room.status)}`}>{room.status}</div>
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                              <button onClick={() => handleOpenEditRoom(room)} className="p-2 bg-white text-black rounded-full hover:bg-aetheria-gold"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => onDeleteRoom(room.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                      </div>
                      <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <div className="text-xs text-slate-500 uppercase">Room {room.number}</div>
                                  <h4 className="font-bold text-white text-lg">{room.type}</h4>
                              </div>
                              <div className="text-aetheria-gold font-bold">₹{room.price}</div>
                          </div>
                          <div className="flex gap-2 mb-4">
                              <button onClick={() => onUpdateRoomStatus(room.id, 'Clean')} className={`text-[10px] px-2 py-1 rounded border ${room.status === 'Clean' ? 'bg-emerald-500 text-emerald-950 border-emerald-500' : 'border-slate-700 text-slate-500 hover:border-emerald-500 hover:text-emerald-500'}`}>Clean</button>
                              <button onClick={() => onUpdateRoomStatus(room.id, 'Dirty')} className={`text-[10px] px-2 py-1 rounded border ${room.status === 'Dirty' ? 'bg-red-500 text-white border-red-500' : 'border-slate-700 text-slate-500 hover:border-red-500 hover:text-red-500'}`}>Dirty</button>
                              <button onClick={() => onUpdateRoomStatus(room.id, 'Maintenance')} className={`text-[10px] px-2 py-1 rounded border ${room.status === 'Maintenance' ? 'bg-amber-500 text-amber-950 border-amber-500' : 'border-slate-700 text-slate-500 hover:border-amber-500 hover:text-amber-500'}`}>Maint.</button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderHalls = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-end">
            <button onClick={handleOpenAddHall} className="bg-aetheria-gold text-aetheria-navy px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-white transition-colors"><Plus className="w-4 h-4" /> Add Hall</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {halls.map(hall => (
                <div key={hall.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-aetheria-gold/30 transition-all flex flex-col md:flex-row h-full md:h-48">
                    <div className="w-full md:w-48 relative">
                        <img src={hall.images[0]} alt={hall.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                              <button onClick={() => handleOpenEditHall(hall)} className="p-2 bg-white text-black rounded-full hover:bg-aetheria-gold"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => onDeleteHall(hall.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between">
                                <h4 className="font-bold text-white text-lg">{hall.name}</h4>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded h-fit ${hall.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{hall.status}</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{hall.type} | Cap: {hall.capacity}</p>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                            <div className="text-aetheria-gold font-bold">₹{hall.pricePerHour}/hr</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderDining = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-end">
              <button onClick={handleOpenAddMenu} className="bg-aetheria-gold text-aetheria-navy px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-white transition-colors"><Plus className="w-4 h-4" /> Add Dish</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-aetheria-gold/30 transition-all">
                       <div className="relative h-40">
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                          <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold ${item.type === 'Veg' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{item.type}</div>
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                              <button onClick={() => handleOpenEditMenu(item)} className="p-2 bg-white text-black rounded-full hover:bg-aetheria-gold"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => onDeleteMenuItem(item.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                          </div>
                      </div>
                      <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-white">{item.name}</h4>
                              <div className="text-aetheria-gold font-bold">₹{item.price}</div>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderGuests = () => (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profiles.filter(p => p.role === 'GUEST').map(profile => (
                  <div key={profile.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-aetheria-gold/30 transition-all cursor-pointer" onClick={() => handleOpenGuestModal(profile)}>
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">
                              {profile.profileImage ? <img src={profile.profileImage} alt="" className="w-full h-full object-cover" /> : <span className="text-xl font-bold text-slate-500">{profile.name.charAt(0)}</span>}
                          </div>
                          <div>
                              <h4 className="font-bold text-white">{profile.name}</h4>
                              <div className="text-xs text-slate-500">{profile.email}</div>
                          </div>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-500">Tier</span>
                          <span className={`font-bold ${profile.loyaltyTier === 'Diamond' ? 'text-cyan-400' : profile.loyaltyTier === 'Platinum' ? 'text-slate-300' : profile.loyaltyTier === 'Gold' ? 'text-amber-400' : 'text-slate-500'}`}>{profile.loyaltyTier}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-500">Points</span>
                          <span className="text-white">{profile.loyaltyPoints}</span>
                      </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Docs</span>
                          <span className={`${(profile.documents||[]).some(d => d.status === 'Pending') ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>{(profile.documents||[]).length} Uploaded</span>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderFinancial = () => (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Financial Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">Total Revenue</div>
                      <div className="text-2xl font-bold text-white">₹{revenue.toLocaleString()}</div>
                  </div>
                   <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">Outstanding</div>
                      <div className="text-2xl font-bold text-amber-400">₹{outstanding.toLocaleString()}</div>
                  </div>
                   <div className="p-4 bg-slate-800/50 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">RevPAR</div>
                      <div className="text-2xl font-bold text-emerald-400">₹4,500</div>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderReports = () => (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-6">Generate Reports</h3>
          
          <div className="space-y-6">
              <div>
                  <label className="block text-xs uppercase text-slate-500 mb-2">Report Type</label>
                  <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
                      {['FINANCIAL', 'OCCUPANCY', 'GUESTS'].map(type => (
                          <button 
                            key={type} 
                            onClick={() => setReportType(type)}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${reportType === type ? 'bg-aetheria-gold text-aetheria-navy' : 'text-slate-400 hover:text-white'}`}
                          >
                              {type}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs uppercase text-slate-500 mb-2">Start Date</label>
                      <input type="date" value={reportDateRange.start} onChange={e => setReportDateRange({...reportDateRange, start: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white" />
                  </div>
                  <div>
                      <label className="block text-xs uppercase text-slate-500 mb-2">End Date</label>
                      <input type="date" value={reportDateRange.end} onChange={e => setReportDateRange({...reportDateRange, end: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white" />
                  </div>
              </div>

              <div className="pt-6 flex gap-4">
                  <button onClick={() => generateReportPDF(getFilteredReportData(), reportType)} className="flex-1 bg-aetheria-gold text-aetheria-navy font-bold py-3 rounded hover:bg-white transition-colors flex justify-center items-center gap-2"><FileText className="w-4 h-4" /> Download PDF</button>
                  <button onClick={() => downloadCSV(getFilteredReportData(), reportType)} className="flex-1 border border-slate-700 text-slate-300 font-bold py-3 rounded hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"><FileBarChart className="w-4 h-4" /> Export CSV</button>
              </div>
          </div>
      </div>
  );

  const renderSettings = () => (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-6">System Settings</h3>
          
          <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-aetheria-gold/20 bg-slate-800 flex items-center justify-center">
                      {adminProfile?.profileImage ? (
                          <img src={adminProfile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                          <Users className="w-16 h-16 text-slate-600" />
                      )}
                  </div>
                  <label className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                      <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleImageUpload(e, 'PROFILE')}
                          className="hidden" 
                      />
                  </label>
              </div>
              <p className="text-slate-500 text-sm mt-2">Click to change profile photo</p>
          </div>

          <form onSubmit={handleUpdateSettings} className="space-y-6">
              <div>
                  <label className="block text-xs uppercase text-slate-500 mb-2">Hotel Name</label>
                  <input type="text" value={settingsForm.hotelName} onChange={e => setSettingsForm({...settingsForm, hotelName: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white" />
              </div>
               <div>
                  <label className="block text-xs uppercase text-slate-500 mb-2">Administrator Name</label>
                  <input type="text" value={settingsForm.name} onChange={e => setSettingsForm({...settingsForm, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white" />
              </div>
               <div>
                  <label className="block text-xs uppercase text-slate-500 mb-2">Hotel Phone Number</label>
                  <input type="tel" value={settingsForm.phone} onChange={e => setSettingsForm({...settingsForm, phone: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white" placeholder="+1 (555) 123-4567" />
              </div>
               <div>
                  <label className="block text-xs uppercase text-slate-500 mb-2">Hotel Location</label>
                  <input type="text" value={settingsForm.location} onChange={e => setSettingsForm({...settingsForm, location: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white" placeholder="1 Ocean Drive, Azure Coast, Paradise City, PC 10001" />
              </div>
               <div>
                  <label className="block text-xs uppercase text-slate-500 mb-2">Admin Email</label>
                  <input type="email" value={settingsForm.email} disabled className="w-full bg-slate-800/50 border border-slate-700 rounded p-3 text-slate-500 cursor-not-allowed" />
              </div>
              <div className="pt-4">
                  <button type="submit" className="w-full bg-aetheria-gold text-aetheria-navy font-bold py-3 rounded hover:bg-white transition-colors">Save Changes</button>
              </div>
          </form>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-[#0B1120] flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
             <h2 className="text-xl font-serif font-bold text-white tracking-wide truncate">{adminProfile?.hotelName || 'AETHERIA'}</h2>
             <span className="text-xs text-aetheria-gold font-bold tracking-widest uppercase">Admin Portal</span>
        </div>
        
        {/* User Mini Profile in Sidebar */}
        <div className="p-6 flex flex-col items-center border-b border-slate-800 bg-slate-900/50">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-aetheria-gold/30 mb-3">
                 {adminProfile?.profileImage ? (
                    <img src={adminProfile.profileImage} alt="Admin" className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xl font-serif text-slate-500">{user.name.charAt(0)}</div>
                 )}
            </div>
            <div className="font-bold text-white text-center">{adminProfile?.name || user.name}</div>
            <div className="text-xs text-slate-500">{user.email}</div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto glass-scroll">
          {['dashboard', 'bookings', 'financial', 'guests', 'rooms', 'halls', 'dining', 'reports', 'feedback', 'settings'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${activeTab === tab ? 'bg-slate-800/50 text-aetheria-gold border-slate-700' : 'border-transparent hover:bg-slate-800/30'}`}>
                  {tab === 'dashboard' && <LayoutDashboard className="w-5 h-5" />}
                  {tab === 'bookings' && <CalendarCheck className="w-5 h-5" />}
                  {tab === 'financial' && <Wallet className="w-5 h-5" />}
                  {tab === 'guests' && <Users className="w-5 h-5" />}
                  {tab === 'rooms' && <BedDouble className="w-5 h-5" />}
                  {tab === 'halls' && <Landmark className="w-5 h-5" />}
                  {tab === 'dining' && <Utensils className="w-5 h-5" />}
                  {tab === 'reports' && <FileBarChart className="w-5 h-5" />}
                  {tab === 'feedback' && <MessageSquareWarning className="w-5 h-5" />}
                  {tab === 'settings' && <Settings className="w-5 h-5" />}
                  <span className="capitalize">{tab}</span>
              </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><LogOut className="w-4 h-4" /> Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white capitalize">{activeTab} Overview</h1>
            <div className="flex items-center gap-4">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input type="text" placeholder="Search..." className="bg-slate-900 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm text-white" /></div>
            </div>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'financial' && renderFinancial()}
        {activeTab === 'rooms' && renderRooms()}
        {activeTab === 'halls' && renderHalls()}
        {activeTab === 'dining' && renderDining()}
        {activeTab === 'guests' && renderGuests()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'feedback' && renderFeedback()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Booking Detail Modal with ACTIONS */}
      {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}></div>
              <div className="relative bg-[#0B1120] border border-aetheria-gold/30 rounded-xl shadow-2xl w-full max-w-2xl p-8">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white">Booking {selectedBooking.id}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(selectedBooking.status)} mt-2 inline-block`}>{selectedBooking.status}</span>
                      </div>
                      <button onClick={() => setSelectedBooking(null)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 text-slate-300 mb-8">
                      <div className="space-y-2">
                        <p className="text-xs uppercase text-slate-500">Guest</p>
                        <p className="font-bold text-white">{selectedBooking.guestName}</p>
                        <p className="text-sm">{selectedBooking.guestEmail}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase text-slate-500">Details</p>
                        <p className="font-bold text-white">{selectedBooking.roomType}</p>
                        <p className="text-sm">{selectedBooking.bookingCategory}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase text-slate-500">Schedule</p>
                        <p className="text-sm">In: {new Date(selectedBooking.checkIn).toLocaleString()}</p>
                        <p className="text-sm">Out: {new Date(selectedBooking.checkOut).toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase text-slate-500">Payment</p>
                        <div className="flex items-center gap-2">
                            <span className={`font-bold ${selectedBooking.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                ₹{selectedBooking.totalPrice.toLocaleString('en-IN')} ({selectedBooking.paymentStatus})
                            </span>
                        </div>
                        <div className="flex gap-2 mt-1">
                            <button onClick={() => { onUpdateBooking({...selectedBooking, paymentStatus: 'Paid'}); setSelectedBooking({...selectedBooking, paymentStatus: 'Paid'}); }} className="text-[10px] bg-emerald-600 px-2 py-1 rounded text-white hover:bg-emerald-500">Mark Paid</button>
                            <button onClick={() => { onUpdateBooking({...selectedBooking, paymentStatus: 'Pending'}); setSelectedBooking({...selectedBooking, paymentStatus: 'Pending'}); }} className="text-[10px] bg-amber-600 px-2 py-1 rounded text-white hover:bg-amber-500">Not Paid Yet</button>
                            <button onClick={() => { onUpdateBooking({...selectedBooking, paymentStatus: 'Refunded'}); setSelectedBooking({...selectedBooking, paymentStatus: 'Refunded'}); }} className="text-[10px] bg-red-600 px-2 py-1 rounded text-white hover:bg-red-500">Refund</button>
                        </div>
                      </div>
                  </div>

                  <div className="border-t border-slate-800 pt-6 flex gap-4">
                      {selectedBooking.status === 'Confirmed' && (
                          <button 
                            onClick={() => { onUpdateBooking({ ...selectedBooking, status: 'Checked In' }); setSelectedBooking(null); }}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                          >
                             <LogIn className="w-4 h-4" /> Check In Guest
                          </button>
                      )}
                      {(selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Checked In') && (
                          <button 
                             onClick={() => { onUpdateBooking({ ...selectedBooking, status: 'Checked Out' }); setSelectedBooking(null); }}
                             className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                          >
                             <LogOutIcon className="w-4 h-4" /> Check Out
                          </button>
                      )}
                      {selectedBooking.status !== 'Cancelled' && selectedBooking.status !== 'Checked Out' && (
                          <button 
                             onClick={() => { onUpdateBooking({ ...selectedBooking, status: 'Cancelled' }); setSelectedBooking(null); }}
                             className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                          >
                             <Ban className="w-4 h-4" /> Cancel Booking
                          </button>
                      )}
                      <button 
                         onClick={() => generateAdminInvoice(selectedBooking)}
                         className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                      >
                         <Receipt className="w-4 h-4" /> Invoice
                      </button>
                  </div>
              </div>
          </div>
      )}

      {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProfile(null)}></div>
              <div className="relative bg-[#0B1120] border border-aetheria-gold/30 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="flex border-b border-slate-800">
                      <div className="p-6 border-r border-slate-800 w-64 bg-slate-900/50">
                          <div className="text-center mb-6">
                               <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-aetheria-gold/30 mx-auto mb-3">
                                   {selectedProfile.profileImage ? <img src={selectedProfile.profileImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-800 text-2xl font-bold">{selectedProfile.name.charAt(0)}</div>}
                               </div>
                               <h3 className="font-bold text-white text-lg">{selectedProfile.name}</h3>
                               <p className="text-xs text-slate-500">{selectedProfile.email}</p>
                          </div>
                          <nav className="space-y-1">
                              {['PROFILE', 'BOOKINGS', 'LOYALTY', 'NOTES'].map(tab => (
                                  <button 
                                    key={tab} 
                                    onClick={() => setGuestModalTab(tab)}
                                    className={`w-full text-left px-4 py-2 rounded text-sm font-bold transition-colors ${guestModalTab === tab ? 'bg-aetheria-gold text-aetheria-navy' : 'text-slate-400 hover:bg-slate-800'}`}
                                  >
                                      {tab}
                                  </button>
                              ))}
                          </nav>
                      </div>
                      <div className="flex-1 p-8 overflow-y-auto glass-scroll bg-[#0B1120]">
                          <div className="flex justify-between mb-6">
                              <h2 className="text-2xl font-bold text-white capitalize">{guestModalTab.toLowerCase()}</h2>
                              <button onClick={() => setSelectedProfile(null)}><X className="w-6 h-6 text-slate-500 hover:text-white" /></button>
                          </div>
                          
                          {guestModalTab === 'PROFILE' && (
                              <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                      <div><label className="text-xs text-slate-500 uppercase">Phone</label><div className="text-white">{selectedProfile.phone || 'N/A'}</div></div>
                                      <div><label className="text-xs text-slate-500 uppercase">Address</label><div className="text-white">{selectedProfile.address || 'N/A'}</div></div>
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-white mb-3">Identity Documents</h4>
                                      <div className="space-y-2">
                                          {(selectedProfile.documents || []).length === 0 ? <p className="text-slate-500 text-sm">No documents uploaded.</p> : (
                                              selectedProfile.documents.map(doc => (
                                                  <div key={doc.id} className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-800">
                                                      <div className="flex items-center gap-3">
                                                          <FileText className="w-5 h-5 text-aetheria-gold" />
                                                          <div>
                                                              <div className="text-sm font-bold text-white">{doc.type}</div>
                                                              <div className="text-xs text-slate-500">{doc.fileName}</div>
                                                          </div>
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${doc.status === 'Verified' ? 'bg-green-500/20 text-green-400' : doc.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>{doc.status}</span>
                                                          <button onClick={() => setDocumentToView(doc)} className="p-1 hover:bg-blue-500/20 text-blue-400 rounded" title="View Document"><Eye className="w-4 h-4" /></button>
                                                          {doc.status === 'Pending' && (
                                                              <div className="flex gap-1">
                                                                  <button onClick={() => handleDocumentAction(selectedProfile.id, doc.id, 'Verified')} className="p-1 hover:bg-green-500/20 text-green-400 rounded" title="Verify Document"><CheckCircle2 className="w-4 h-4" /></button>
                                                                  <button onClick={() => handleDocumentAction(selectedProfile.id, doc.id, 'Rejected')} className="p-1 hover:bg-red-500/20 text-red-400 rounded" title="Reject Document"><XCircle className="w-4 h-4" /></button>
                                                              </div>
                                                          )}
                                                      </div>
                                                  </div>
                                              ))
                                          )}
                                      </div>
                                  </div>
                              </div>
                          )}

                          {guestModalTab === 'LOYALTY' && (
                              <div className="space-y-6">
                                  <div className="flex gap-4 mb-6">
                                      {['Silver', 'Gold', 'Platinum', 'Diamond'].map(tier => (
                                          <button 
                                            key={tier}
                                            onClick={() => handleTierUpdate(tier)}
                                            className={`flex-1 py-3 rounded-lg border font-bold text-sm transition-all ${selectedProfile.loyaltyTier === tier ? 'bg-aetheria-gold text-aetheria-navy border-aetheria-gold' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                          >
                                              {tier}
                                          </button>
                                      ))}
                                  </div>
                                  <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center">
                                      <div className="text-slate-500 text-sm uppercase mb-2">Current Points</div>
                                      <div className="text-4xl font-bold text-white mb-6">{selectedProfile.loyaltyPoints}</div>
                                      <div className="flex gap-2 max-w-xs mx-auto">
                                          <input 
                                            type="number" 
                                            value={loyaltyInput} 
                                            onChange={(e) => setLoyaltyInput(Number(e.target.value))}
                                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 text-white" 
                                          />
                                          <button onClick={() => handleUpdateLoyalty('ADD')} className="bg-emerald-600 text-white px-3 py-2 rounded font-bold"><Plus className="w-4 h-4" /></button>
                                          <button onClick={() => handleUpdateLoyalty('SUBTRACT')} className="bg-red-600 text-white px-3 py-2 rounded font-bold"><X className="w-4 h-4" /></button>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {guestModalTab === 'NOTES' && (
                              <div className="space-y-4">
                                  <textarea 
                                    rows={10} 
                                    value={notesInput} 
                                    onChange={(e) => setNotesInput(e.target.value)}
                                    placeholder="Internal staff notes about this guest..." 
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 text-white resize-none focus:border-aetheria-gold outline-none" 
                                  />
                                  <div className="flex justify-end">
                                      <button onClick={handleSaveGuestNotes} className="bg-aetheria-gold text-aetheria-navy font-bold py-2 px-6 rounded hover:bg-white transition-colors flex items-center gap-2"><Save className="w-4 h-4" /> Save Notes</button>
                                  </div>
                              </div>
                          )}

                          {guestModalTab === 'BOOKINGS' && (
                              <div className="space-y-4">
                                  {bookings.filter(b => b.guestEmail === selectedProfile.email).length === 0 ? <p className="text-slate-500">No booking history.</p> : (
                                      bookings.filter(b => b.guestEmail === selectedProfile.email).map(b => (
                                          <div key={b.id} className="bg-slate-900 border border-slate-800 p-4 rounded flex justify-between items-center">
                                              <div>
                                                  <div className="font-bold text-white">{b.roomType}</div>
                                                  <div className="text-xs text-slate-500">{new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}</div>
                                              </div>
                                              <span className={`text-[10px] font-bold px-2 py-1 rounded border ${getStatusColor(b.status)}`}>{b.status}</span>
                                          </div>
                                      ))
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
      
      {isRoomModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsRoomModalOpen(false)}></div>
              <div className="relative bg-[#0B1120] border border-aetheria-gold/30 rounded-xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto max-h-[90vh] glass-scroll">
                  <h3 className="text-xl font-bold text-white mb-6">{isEditingRoom ? 'Edit Suite' : 'Add New Suite'}</h3>
                  <form onSubmit={submitRoom} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs uppercase text-slate-500 mb-1">Room Number</label>
                              <input type="text" value={newRoom.number} onChange={e => setNewRoom({...newRoom, number: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                           </div>
                           <div>
                              <label className="block text-xs uppercase text-slate-500 mb-1">Price (INR)</label>
                              <input type="number" value={newRoom.price} onChange={e => setNewRoom({...newRoom, price: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                           </div>
                      </div>
                      <div>
                          <label className="block text-xs uppercase text-slate-500 mb-1">Suite Type</label>
                          <input type="text" value={newRoom.type} onChange={e => setNewRoom({...newRoom, type: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                      </div>
                      <div>
                          <label className="block text-xs uppercase text-slate-500 mb-1">Description</label>
                          <textarea rows={3} value={newRoom.description} onChange={e => setNewRoom({...newRoom, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs uppercase text-slate-500 mb-1">Capacity</label>
                              <input type="number" value={newRoom.maxCapacity} onChange={e => setNewRoom({...newRoom, maxCapacity: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                           </div>
                           <div>
                              <label className="block text-xs uppercase text-slate-500 mb-1">Status</label>
                              <select value={newRoom.status} onChange={e => setNewRoom({...newRoom, status: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white">
                                  {['Clean', 'Dirty', 'Occupied', 'Maintenance'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                           </div>
                      </div>
                      <div>
                          <label className="block text-xs uppercase text-slate-500 mb-1">Amenities (comma separated)</label>
                          <input type="text" value={amenitiesInput} onChange={e => setAmenitiesInput(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase text-slate-500 mb-1">Images</label>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="file" 
                                multiple
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'ROOM')} 
                                className="text-slate-500 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-aetheria-gold/10 file:text-aetheria-gold hover:file:bg-aetheria-gold/20" 
                            />
                            <div className="flex gap-2 overflow-x-auto py-2">
                                {(newRoom.images || []).map((img, i) => (
                                    <div key={i} className="relative w-16 h-16 flex-shrink-0 group">
                                        <img src={img} alt="" className="w-full h-full object-cover rounded" />
                                        <button type="button" onClick={() => removeImage(i, 'ROOM')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><X className="w-4 h-4"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsRoomModalOpen(false)} className="px-6 py-2 border border-slate-700 text-slate-300 rounded">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-aetheria-gold text-aetheria-navy font-bold rounded">{isEditingRoom ? 'Save Changes' : 'Add Suite'}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {isHallModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsHallModalOpen(false)}></div>
              <div className="relative bg-[#0B1120] border border-aetheria-gold/30 rounded-xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto max-h-[90vh] glass-scroll">
                  <h3 className="text-xl font-bold text-white mb-6">{isEditingHall ? 'Edit Hall' : 'Add New Hall'}</h3>
                  <form onSubmit={submitHall} className="space-y-4">
                      <div><label className="block text-xs uppercase text-slate-500 mb-1">Hall Name</label><input type="text" value={newHall.name} onChange={e => setNewHall({...newHall, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" /></div>
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs uppercase text-slate-500 mb-1">Type</label>
                              <select value={newHall.type} onChange={e => setNewHall({...newHall, type: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white">
                                  {['Wedding', 'Conference', 'Banquet', 'General'].map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                           </div>
                           <div>
                              <label className="block text-xs uppercase text-slate-500 mb-1">Price / Hour</label>
                              <input type="number" value={newHall.pricePerHour} onChange={e => setNewHall({...newHall, pricePerHour: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                           </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs uppercase text-slate-500 mb-1">Capacity</label>
                              <input type="number" value={newHall.capacity} onChange={e => setNewHall({...newHall, capacity: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                           </div>
                           <div>
                              <label className="block text-xs uppercase text-slate-500 mb-1">Status</label>
                              <select value={newHall.status} onChange={e => setNewHall({...newHall, status: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white">
                                  {['Available', 'Booked', 'Maintenance'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                           </div>
                      </div>
                      <div><label className="block text-xs uppercase text-slate-500 mb-1">Description</label><textarea rows={3} value={newHall.description} onChange={e => setNewHall({...newHall, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" /></div>
                      <div><label className="block text-xs uppercase text-slate-500 mb-1">Features (comma separated)</label><input type="text" value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" /></div>
                      <div>
                        <label className="block text-xs uppercase text-slate-500 mb-1">Images</label>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="file" 
                                multiple
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'HALL')} 
                                className="text-slate-500 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-aetheria-gold/10 file:text-aetheria-gold hover:file:bg-aetheria-gold/20" 
                            />
                            <div className="flex gap-2 overflow-x-auto py-2">
                                {(newHall.images || []).map((img, i) => (
                                    <div key={i} className="relative w-16 h-16 flex-shrink-0 group">
                                        <img src={img} alt="" className="w-full h-full object-cover rounded" />
                                        <button type="button" onClick={() => removeImage(i, 'HALL')} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><X className="w-4 h-4"/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsHallModalOpen(false)} className="px-6 py-2 border border-slate-700 text-slate-300 rounded">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-aetheria-gold text-aetheria-navy font-bold rounded">{isEditingHall ? 'Save Changes' : 'Add Hall'}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
      
      {/* Add/Edit Menu Item Modal */}
      {isMenuModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMenuModalOpen(false)}></div>
              <div className="relative bg-[#0B1120] border border-aetheria-gold/30 rounded-xl shadow-2xl w-full max-w-lg p-8 overflow-y-auto max-h-[90vh] glass-scroll">
                  <h3 className="text-xl font-bold text-white mb-6">{isEditingMenu ? 'Edit Dish' : 'Add New Dish'}</h3>
                  <form onSubmit={submitMenu} className="space-y-4">
                      {/* ... Menu Form fields ... */}
                      <div><label className="block text-xs uppercase text-slate-500 mb-1">Dish Name</label><input type="text" value={newMenuItem.name} onChange={e => setNewMenuItem({...newMenuItem, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" /></div>
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs uppercase text-slate-500 mb-1">Price (INR)</label>
                              <input type="number" value={newMenuItem.price} onChange={e => setNewMenuItem({...newMenuItem, price: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                           </div>
                           <div>
                              <label className="block text-xs uppercase text-slate-500 mb-1">Calories (kcal)</label>
                              <input type="number" value={newMenuItem.calories} onChange={e => setNewMenuItem({...newMenuItem, calories: Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" />
                           </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs uppercase text-slate-500 mb-1">Category</label>
                            <select value={newMenuItem.category} onChange={e => setNewMenuItem({...newMenuItem, category: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white">
                                <option>Western</option>
                                <option>Indian</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs uppercase text-slate-500 mb-1">Type</label>
                            <select value={newMenuItem.type} onChange={e => setNewMenuItem({...newMenuItem, type: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white">
                                <option>Veg</option>
                                <option>Non-Veg</option>
                            </select>
                          </div>
                      </div>
                      <div><label className="block text-xs uppercase text-slate-500 mb-1">Description</label><textarea rows={3} value={newMenuItem.description} onChange={e => setNewMenuItem({...newMenuItem, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white" /></div>
                      <div>
                        <label className="block text-xs uppercase text-slate-500 mb-1">Images</label>
                        <div className="flex flex-col gap-2">
                            <input 
                                type="file" 
                                multiple
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'MENU')} 
                                className="text-slate-500 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-aetheria-gold/10 file:text-aetheria-gold hover:file:bg-aetheria-gold/20" 
                            />
                            {/* ... Image preview ... */}
                        </div>
                      </div>
                      <div className="pt-4 flex justify-end gap-3">
                          <button type="button" onClick={() => setIsMenuModalOpen(false)} className="px-6 py-2 border border-slate-700 text-slate-300 rounded">Cancel</button>
                          <button type="submit" className="px-6 py-2 bg-aetheria-gold text-aetheria-navy font-bold rounded">{isEditingMenu ? 'Save Changes' : 'Add Dish'}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Document View Modal */}
      {documentToView && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDocumentToView(null)}></div>
              <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="text-xl font-serif text-white">Document Verification</h3>
                      <button onClick={() => setDocumentToView(null)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-6">
                      <div className="mb-4">
                          <h4 className="text-lg font-bold text-white mb-2">{documentToView.fileName}</h4>
                          <div className="flex gap-4 text-sm text-slate-400">
                              <span>Type: {documentToView.type}</span>
                              <span>Status: <span className={`font-bold ${documentToView.status === 'Verified' ? 'text-green-400' : documentToView.status === 'Rejected' ? 'text-red-400' : 'text-amber-400'}`}>{documentToView.status}</span></span>
                              <span>Uploaded: {documentToView.uploadDate}</span>
                          </div>
                      </div>

                      <div className="bg-black/50 rounded-lg p-4 mb-6">
                          {documentToView.fileData ? (
                              documentToView.fileType?.startsWith('image/') ? (
                                  <img
                                      src={documentToView.fileData}
                                      alt={documentToView.fileName}
                                      className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                                  />
                              ) : documentToView.fileType === 'application/pdf' ? (
                                  <iframe
                                      src={documentToView.fileData}
                                      className="w-full h-96 border rounded-lg"
                                      title={documentToView.fileName}
                                  />
                              ) : (
                                  <div className="text-center py-8">
                                      <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                                      <p className="text-slate-400">Document preview not available for this file type.</p>
                                      <p className="text-xs text-slate-500 mt-2">File type: {documentToView.fileType}</p>
                                  </div>
                              )
                          ) : (
                              <div className="text-center py-8">
                                  <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                                  <p className="text-slate-400">Document data not available.</p>
                              </div>
                          )}
                      </div>

                      {documentToView.status === 'Pending' && (
                          <div className="flex justify-center gap-4">
                              <button
                                  onClick={() => {
                                      handleDocumentAction(selectedProfile.id, documentToView.id, 'Verified');
                                      setDocumentToView(null);
                                  }}
                                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold"
                              >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Mark as Verified
                              </button>
                              <button
                                  onClick={() => {
                                      handleDocumentAction(selectedProfile.id, documentToView.id, 'Rejected');
                                      setDocumentToView(null);
                                  }}
                                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold"
                              >
                                  <XCircle className="w-4 h-4" />
                                  Mark as Rejected
                              </button>
                          </div>
                      )}

                      {documentToView.status !== 'Pending' && (
                          <div className="text-center">
                              <p className={`text-sm font-bold ${documentToView.status === 'Verified' ? 'text-green-400' : 'text-red-400'}`}>
                                  This document has been {documentToView.status.toLowerCase()}.
                              </p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default AdminPortal;