import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aetheria_heights';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
// Increase JSON body limit so we can store small document previews (base64)
app.use(express.json({ limit: '10mb' }));

// Auth middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// ====== Mongoose Schemas & Models ======
const roomSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    type: { type: String, required: true },
    category: { type: String, default: 'General' },
    price: { type: Number, required: true },
    maxCapacity: { type: Number, default: 2 },
    status: { type: String, default: 'Clean' },
    description: { type: String },
    amenities: [{ type: String }],
    images: [{ type: String }]
  },
  { timestamps: true }
);

const hallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: 'Wedding' },
    pricePerHour: { type: Number, required: true },
    capacity: { type: Number, required: true },
    status: { type: String, default: 'Available' },
    description: { type: String },
    features: [{ type: String }],
    images: [{ type: String }]
  },
  { timestamps: true }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, default: 'Western' },
    type: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
    images: [{ type: String }],
    calories: { type: Number }
  },
  { timestamps: true }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingCategory: { type: String, enum: ['ROOM', 'HALL'], required: true },
    roomId: { type: String, required: true },
    roomType: { type: String },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, default: 1 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Confirmed', 'Checked In', 'Checked Out', 'Cancelled'],
      default: 'Confirmed'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded'],
      default: 'Pending'
    },
    bookingDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['GUEST', 'ADMIN'], default: 'GUEST' },
    phone: { type: String },
    address: { type: String },
    location: { type: String },
    hotelName: { type: String },
    paymentMethods: [{ type: mongoose.Schema.Types.Mixed }],
    // Store documents as flexible objects so uploads don't fail on schema mismatch
    documents: [{ type: mongoose.Schema.Types.Mixed }],
    preferences: {
      preferredFloor: String,
      pillowType: String,
      dietaryRestrictions: [String],
      newsletter: Boolean
    },
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyTier: { type: String, default: 'Silver' },
    adminNotes: { type: String },
    profileImage: { type: String }
  },
  { timestamps: true }
);

const diningOrderSchema = new mongoose.Schema(
  {
    guestEmail: { type: String, required: true },
    guestName: { type: String },
    items: [
      {
        menuItemId: String,
        name: String,
        quantity: Number,
        price: Number
      }
    ],
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Served', 'Cancelled'],
      default: 'Pending'
    },
    orderTime: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['GUEST', 'ADMIN'], default: 'GUEST' }
  },
  { timestamps: true }
);

const feedbackSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Feedback', 'Complaint'], default: 'Feedback' },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Room = mongoose.model('Room', roomSchema);
const Hall = mongoose.model('Hall', hallSchema);
const MenuItem = mongoose.model('MenuItem', menuItemSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Profile = mongoose.model('Profile', profileSchema);
const DiningOrder = mongoose.model('DiningOrder', diningOrderSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

// ====== EMAIL CONFIGURATION ======
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Test email configuration
emailTransporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
    console.log('📧 Please check your EMAIL_USER and EMAIL_PASS in .env.local');
    console.log('🔑 Make sure to use Gmail App Password (not regular password)');
  } else {
    console.log('✅ Email service is ready to send newsletters!');
  }
});

// Email template for newsletter subscription
const sendNewsletterEmail = async (subscriberEmail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: subscriberEmail,
    subject: 'Welcome to Aetheria Heights - Discover Luxury Like Never Before!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 20px;">
        <div style="text-align: center; padding: 40px 0;">
          <h1 style="color: #ffd700; font-size: 32px; margin: 0; font-family: serif;">✦ Aetheria Heights ✦</h1>
          <p style="color: #b8c5d6; font-size: 18px; margin: 10px 0;">Where Luxury Meets Digital Innovation</p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); padding: 30px; border-radius: 15px; margin: 20px 0;">
          <h2 style="color: #ffd700; text-align: center; margin-bottom: 30px;">Welcome to Your Digital Luxury Experience</h2>

          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for subscribing to our newsletter! You're now part of an exclusive community that experiences the pinnacle of luxury hospitality through our state-of-the-art digital platform.
          </p>

          <div style="background: rgba(255, 215, 0, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffd700;">
            <h3 style="color: #ffd700; margin: 0 0 15px 0;">Discover Aetheria Heights - Your Complete Luxury Resort Experience:</h3>
            <ul style="color: #e0e6ed; line-height: 1.8;">
              <li><strong>🏨 Ocean View Suites:</strong> Panoramic ocean views from every room with premium amenities</li>
              <li><strong>🍽️ World-Class Dining:</strong> Michelin-star inspired cuisine with fresh, local ingredients and room service</li>
              <li><strong>🎪 Event Halls:</strong> Perfect venues for weddings, corporate events, and celebrations with full catering</li>
              <li><strong>💆 Spa & Wellness:</strong> Rejuvenate with signature treatments and wellness programs</li>
              <li><strong>🤖 AI-Powered Concierge:</strong> 24/7 intelligent assistance through our chatbot</li>
              <li><strong>📱 Digital Experience:</strong> Seamless booking, real-time updates, and personalized recommendations</li>
              <li><strong>🎯 Smart Features:</strong> QR code check-in, digital receipts, and integrated payment systems</li>
            </ul>
          </div>

          <h3 style="color: #ffd700; margin: 30px 0 20px 0;">Exclusive Digital Benefits for Subscribers:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
            <div style="background: rgba(255, 255, 255, 0.08); padding: 15px; border-radius: 8px;">
              <strong style="color: #ffd700;">15% Off</strong><br>
              <span style="color: #b8c5d6;">All room bookings</span>
            </div>
            <div style="background: rgba(255, 255, 255, 0.08); padding: 15px; border-radius: 8px;">
              <strong style="color: #ffd700;">Free Upgrade</strong><br>
              <span style="color: #b8c5d6;">Suite availability</span>
            </div>
            <div style="background: rgba(255, 255, 255, 0.08); padding: 15px; border-radius: 8px;">
              <strong style="color: #ffd700;">Complimentary</strong><br>
              <span style="color: #b8c5d6;">Spa treatment</span>
            </div>
            <div style="background: rgba(255, 255, 255, 0.08); padding: 15px; border-radius: 8px;">
              <strong style="color: #ffd700;">Priority</strong><br>
              <span style="color: #b8c5d6;">Digital reservations</span>
            </div>
          </div>

          <div style="background: rgba(255, 255, 255, 0.08); padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h4 style="color: #ffd700; margin: 0 0 15px 0;">🌟 What Makes Our Website Special:</h4>
            <ul style="color: #e0e6ed; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Interactive room selection with real-time availability</li>
              <li>AI-powered chatbot for instant assistance</li>
              <li>Secure payment processing with multiple options</li>
              <li>Personalized user profiles and booking history</li>
              <li>Mobile-responsive design for on-the-go booking</li>
              <li>Integrated dining and event management</li>
              <li>Real-time notifications and updates</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000" style="background: #ffd700; color: #1a1a2e; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Explore Our Digital Experience</a>
          </div>

          <p style="font-size: 14px; color: #b8c5d6; text-align: center; margin-top: 30px;">
            Stay connected for exclusive updates, special events, and limited-time offers.<br>
            Experience luxury redefined through our innovative digital platform!
          </p>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 30px;">
          <p style="color: #b8c5d6; font-size: 14px;">
            Aetheria Heights | Luxury Resort & Digital Experience<br>
            Contact: concierge@aetheriaheights.com | +1 (555) 123-4567
          </p>
          <div style="margin: 15px 0;">
            <a href="#" style="color: #ffd700; text-decoration: none; margin: 0 10px;">Facebook</a> |
            <a href="#" style="color: #ffd700; text-decoration: none; margin: 0 10px;">Instagram</a> |
            <a href="#" style="color: #ffd700; text-decoration: none; margin: 0 10px;">LinkedIn</a>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 15px;">
            This email was sent to you because you subscribed to our newsletter.<br>
            You can unsubscribe at any time by contacting our concierge.
          </p>
        </div>
      </div>
    `
  };

  try {
    await emailTransporter.sendMail(mailOptions);
    console.log('Newsletter email sent successfully to:', subscriberEmail);
    return true;
  } catch (error) {
    console.error('Error sending newsletter email:', error);
    return false;
  }
};

// ====== Basic health check ======
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running' });
});

// ====== AUTH (Register / Login) ======
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role === 'ADMIN' ? 'ADMIN' : 'GUEST'
    });

    // Ensure a Profile exists for this user
    const existingProfile = await Profile.findOne({ email });
    if (!existingProfile) {
      await Profile.create({
        name,
        email,
        role: user.role,
        phone: '',
        address: '',
        hotelName: user.role === 'ADMIN' ? 'Aetheria Heights' : undefined,
        paymentMethods: [],
        documents: [],
        preferences: {
          preferredFloor: 'No Preference',
          pillowType: 'Hypoallergenic',
          dietaryRestrictions: [],
          newsletter: false
        },
        loyaltyPoints: 0,
        loyaltyTier: 'Silver',
        adminNotes: ''
      });
    }

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to register user', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to login', details: err.message });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({ error: 'Test email address is required' });
    }

    const testMailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: 'Aetheria Heights - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #ffd700;">✦ Aetheria Heights Email Test ✦</h2>
          <p>Great! Your email configuration is working perfectly.</p>
          <p>This is a test email to verify that newsletter subscriptions will work.</p>
          <p>Newsletter emails will include detailed information about our luxury resort and digital platform.</p>
          <br>
          <p>Best regards,<br>Aetheria Heights Team</p>
        </div>
      `
    };

    await emailTransporter.sendMail(testMailOptions);
    res.json({ success: true, message: 'Test email sent successfully!' });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
});
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Send the newsletter email
    const emailSent = await sendNewsletterEmail(email);

    if (emailSent) {
      res.json({
        success: true,
        message: 'Newsletter subscription successful! A detailed welcome brochure has been sent to your email.',
        details: {
          email: email,
          sentAt: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to send newsletter email. Please try again later.' });
    }

  } catch (err) {
    console.error('Newsletter subscription error:', err);
    res.status(500).json({ error: 'Failed to process newsletter subscription', details: err.message });
  }
});

// ====== ROOMS ======
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const room = new Room(req.body);
    const saved = await room.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create room', details: err.message });
  }
});

app.put('/api/rooms/:id', async (req, res) => {
  try {
    const updated = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updated) return res.status(404).json({ error: 'Room not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update room', details: err.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const deleted = await Room.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Room not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to delete room', details: err.message });
  }
});

// ====== HALLS ======
app.get('/api/halls', async (req, res) => {
  try {
    const halls = await Hall.find();
    res.json(halls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch halls' });
  }
});

app.post('/api/halls', async (req, res) => {
  try {
    const hall = new Hall(req.body);
    const saved = await hall.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create hall', details: err.message });
  }
});

app.put('/api/halls/:id', async (req, res) => {
  try {
    const updated = await Hall.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updated) return res.status(404).json({ error: 'Hall not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update hall', details: err.message });
  }
});

app.delete('/api/halls/:id', async (req, res) => {
  try {
    const deleted = await Hall.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Hall not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to delete hall', details: err.message });
  }
});

// ====== MENU ITEMS ======
app.get('/api/menu-items', async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

app.post('/api/menu-items', async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create menu item', details: err.message });
  }
});

app.put('/api/menu-items/:id', async (req, res) => {
  try {
    const updated = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updated) return res.status(404).json({ error: 'Menu item not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update menu item', details: err.message });
  }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Menu item not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to delete menu item', details: err.message });
  }
});

// ====== BOOKINGS ======
app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'GUEST') {
      filter.guestEmail = req.user.email;
    }
    // Admin can see all
    const bookings = await Booking.find(filter);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.post('/api/bookings', authenticate, async (req, res) => {
  try {
    const booking = new Booking(req.body);
    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create booking', details: err.message });
  }
});

app.put('/api/bookings/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updated) return res.status(404).json({ error: 'Booking not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update booking', details: err.message });
  }
});

app.delete('/api/bookings/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Booking not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to delete booking', details: err.message });
  }
});

// ====== PROFILES ======
app.get('/api/profiles', async (req, res) => {
  try {
    const { email } = req.query;
    const filter = email ? { email } : {};
    const profiles = await Profile.find(filter);
    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// Optional: get a single profile by Mongo _id (debugging)
app.get('/api/profiles/id/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to fetch profile', details: err.message });
  }
});

app.post('/api/profiles', async (req, res) => {
  try {
    const profile = new Profile(req.body);
    const saved = await profile.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create profile', details: err.message });
  }
});

// Update (or create) profile by email in URL param
app.put('/api/profiles/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to update profile' });
    }

    const updated = await Profile.findOneAndUpdate(
      { email },
      { ...req.body, email }, // ensure email stays consistent
      {
        new: true,
        upsert: true,
        runValidators: false,
        setDefaultsOnInsert: true
      }
    );

    if (!updated) return res.status(404).json({ error: 'Profile not found' });
    res.json(updated);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(400).json({ error: 'Failed to update profile', details: err.message });
  }
});

// ====== DINING ORDERS ======
app.get('/api/dining-orders', authenticate, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'GUEST') {
      filter.guestEmail = req.user.email;
    }
    // Admin can see all
    const orders = await DiningOrder.find(filter);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dining orders' });
  }
});

app.post('/api/dining-orders', authenticate, async (req, res) => {
  try {
    const order = new DiningOrder(req.body);
    const saved = await order.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create dining order', details: err.message });
  }
});

app.put('/api/dining-orders/:id', async (req, res) => {
  try {
    const updated = await DiningOrder.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updated) return res.status(404).json({ error: 'Dining order not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update dining order', details: err.message });
  }
});

// ====== FEEDBACK ======
app.get('/api/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

app.post('/api/feedbacks', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    const saved = await feedback.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create feedback', details: err.message });
  }
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI, { dbName: undefined })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;


