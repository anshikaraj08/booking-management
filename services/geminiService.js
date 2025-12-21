import { GoogleGenerativeAI } from "@google/generative-ai";



// Initialize Gemini Client

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



const SYSTEM_INSTRUCTION = `

You are the AI Concierge for Aetheria Heights, a luxury hotel and event center.

Your tone should be sophisticated, polite, helpful, and concise.

You embody the philosophy of "Minimalist Luxury."



Your capabilities:

1. Assist guests with booking information (rooms: Deluxe Suite, Ocean View, Penthouse).

2. Handle requests for amenities (towels, room service, romance packages).

3. Provide information about hotel events and catering.

4. Answer questions about "Aetheria Heights" policies (Check-in 3PM, Check-out 11AM).



Do not make up reservation numbers. If a user asks to book, guide them to the booking engine on the screen.

`;



let chatSession = null;



export const initializeChat = () => {
  chatSession = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_INSTRUCTION,
  });
};



export const sendMessageToGemini = async (message) => {
  if (!chatSession) {
    initializeChat();
  }

  try {
    if (!chatSession) throw new Error("Chat session failed to initialize");

    const result = await chatSession.generateContent(message);
    const response = await result.response;
    const text = response.text();

    return text || "I apologize, I am unable to process your request at this moment.";

  } catch (error) {
    console.error("Gemini API Error:", error);

    // Fallback responses for common hotel inquiries
    const lowerMessage = message.toLowerCase();

    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening')) {
      return "Welcome to Aetheria Heights! I'm your AI concierge, here to assist you with any questions about our luxury hotel experience. How may I help you today?";
    }

    // Help and assistance
    if (lowerMessage.includes('help') || lowerMessage.includes('assist') || lowerMessage.includes('support') || lowerMessage.includes('can you')) {
      return "I'd be delighted to assist you! I can help with information about our rooms, dining options, facilities, booking procedures, and hotel policies. What specific information are you looking for?";
    }

    // Room information
    if (lowerMessage.includes('room') || lowerMessage.includes('suite') || lowerMessage.includes('accommodation')) {
      return "Aetheria Heights offers luxurious accommodations including Deluxe Suites, Ocean View Suites, and Penthouse suites. All rooms feature premium amenities, ocean views, and personalized service. Would you like me to help you check availability or learn more about our room options?";
    }

    // Check-in/out times
    if (lowerMessage.includes('check-in') || lowerMessage.includes('checkin') || lowerMessage.includes('arrive') || lowerMessage.includes('arrival')) {
      return "Check-in time at Aetheria Heights is from 3:00 PM onwards. Early check-in may be available subject to room availability. Please contact the front desk for arrangements.";
    }

    if (lowerMessage.includes('check-out') || lowerMessage.includes('checkout') || lowerMessage.includes('depart') || lowerMessage.includes('departure')) {
      return "Check-out time is until 11:00 AM. Late check-out may be arranged for an additional fee, subject to availability.";
    }

    // Dining and food
    if (lowerMessage.includes('breakfast') || lowerMessage.includes('dining') || lowerMessage.includes('restaurant') || lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('meal')) {
      return "Complimentary gourmet breakfast is included for all VIP suites (Ocean View, Penthouse). For other rooms, breakfast can be added during booking or upon arrival. Our restaurant serves international cuisine throughout the day.";
    }

    // Facilities and amenities
    if (lowerMessage.includes('parking') || lowerMessage.includes('car') || lowerMessage.includes('vehicle')) {
      return "Complimentary valet parking is available for all guests. Self-parking is also available in our underground garage.";
    }

    if (lowerMessage.includes('wifi') || lowerMessage.includes('internet') || lowerMessage.includes('connection')) {
      return "High-speed Wi-Fi is complimentary throughout the property. Connect to 'Aetheria_Guest' network and log in with your room number and last name.";
    }

    if (lowerMessage.includes('pool') || lowerMessage.includes('spa') || lowerMessage.includes('wellness') || lowerMessage.includes('gym') || lowerMessage.includes('fitness')) {
      return "Our infinity pool and spa facilities are available from 6:00 AM to 10:00 PM. Spa treatments can be booked through the concierge or our mobile app.";
    }

    // Booking and reservations
    if (lowerMessage.includes('booking') || lowerMessage.includes('reserve') || lowerMessage.includes('book') || lowerMessage.includes('reservation')) {
      return "I'd be happy to help you with your booking! Please use the booking section on our website to select your dates and room preferences. For immediate assistance, please call our reservations team at +1 (555) 123-4567.";
    }

    if (lowerMessage.includes('cancel') || lowerMessage.includes('cancellation') || lowerMessage.includes('change')) {
      return "Cancellations made 48 hours prior to arrival are fully refundable. Late cancellations may incur a one-night charge. Please contact reservations for specific policy details.";
    }

    // Price and rates
    if (lowerMessage.includes('price') || lowerMessage.includes('rate') || lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('charge')) {
      return "Our room rates vary by season and room type. Deluxe Suites start from $299/night, Ocean View Suites from $499/night, and Penthouse suites from $899/night. Please check our website for current rates and availability.";
    }

    // Pets
    if (lowerMessage.includes('pets') || lowerMessage.includes('pet') || lowerMessage.includes('dog') || lowerMessage.includes('animal')) {
      return "Aetheria Heights is a pet-friendly establishment. A small cleaning fee applies for furry companions. Please inform us in advance of your pet's arrival.";
    }

    // Location and transportation
    if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where') || lowerMessage.includes('airport') || lowerMessage.includes('transport')) {
      return "Aetheria Heights is located at the prestigious Oceanfront Drive, Malibu, CA. We offer complimentary airport transfers and can arrange luxury chauffeur services. Please contact concierge for transportation arrangements.";
    }

    // Events and meetings
    if (lowerMessage.includes('event') || lowerMessage.includes('meeting') || lowerMessage.includes('conference') || lowerMessage.includes('wedding') || lowerMessage.includes('party')) {
      return "Our event halls are perfect for weddings, corporate events, and celebrations. We offer full catering services and event planning assistance. Contact our events team for more information.";
    }

    // General questions
    if (lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('when') || lowerMessage.includes('why')) {
      return "I'd be happy to help answer your questions about Aetheria Heights. Could you please provide more specific details about what you'd like to know? I can assist with rooms, dining, facilities, bookings, and hotel policies.";
    }

    // Thank you responses
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're most welcome! It was my pleasure to assist you. If you have any other questions about your stay at Aetheria Heights, please don't hesitate to ask. We look forward to welcoming you!";
    }

    // Default response for unrecognized queries
    return "Thank you for reaching out to Aetheria Heights. While I'm currently optimizing my services, I can help with information about our rooms, dining, facilities, and booking procedures. For immediate assistance, please contact our front desk at concierge@aetheriaheights.com or call +1 (555) 123-4567.";
  }
};