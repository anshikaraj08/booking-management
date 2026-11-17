// Type definitions as JSDoc comments for JavaScript
// These are not enforced but serve as documentation

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'GUEST' | 'ADMIN'} role
 */

/**
 * @typedef {Object} Room
 * @property {string} id
 * @property {string} number
 * @property {string} type
 * @property {'VIP' | 'General'} category
 * @property {number} price
 * @property {number} maxCapacity
 * @property {'Clean' | 'Dirty' | 'Occupied' | 'Inspecting' | 'Maintenance'} status
 * @property {string[]} images
 * @property {string} description
 * @property {string[]} amenities
 */

/**
 * @typedef {Object} Hall
 * @property {string} id
 * @property {string} name
 * @property {'Wedding' | 'Conference' | 'Banquet' | 'General'} type
 * @property {number} pricePerHour
 * @property {number} capacity
 * @property {'Available' | 'Booked' | 'Maintenance'} status
 * @property {string[]} images
 * @property {string} description
 * @property {string[]} features
 */

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} roomId
 * @property {string} roomType
 * @property {'ROOM' | 'HALL'} bookingCategory
 * @property {string} guestName
 * @property {string} guestEmail
 * @property {string} checkIn
 * @property {string} checkOut
 * @property {number} guests
 * @property {number} totalPrice
 * @property {'Confirmed' | 'Checked In' | 'Pending' | 'Checked Out' | 'Cancelled'} status
 * @property {'Paid' | 'Pending' | 'Refunded'} paymentStatus
 * @property {string} bookingDate
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {'Western' | 'Indian'} category
 * @property {'Veg' | 'Non-Veg'} type
 * @property {string[]} images
 * @property {number} [calories]
 */

/**
 * @typedef {Object} CartItem
 * @extends {MenuItem}
 * @property {number} quantity
 */

/**
 * @typedef {Object} DiningOrder
 * @property {string} id
 * @property {string} guestName
 * @property {string} guestEmail
 * @property {string} roomNumber
 * @property {CartItem[]} items
 * @property {number} totalPrice
 * @property {'Preparing' | 'Delivered' | 'Completed'} status
 * @property {string} orderTime
 * @property {string} paymentMethod
 */

/**
 * @typedef {Object} Feedback
 * @property {string} id
 * @property {string} userId
 * @property {string} userName
 * @property {string} email
 * @property {'Complaint' | 'Feedback'} type
 * @property {string} subject
 * @property {string} message
 * @property {string} date
 * @property {'New' | 'Read' | 'Resolved'} status
 */

/**
 * @typedef {Object} UserProfile
 * @extends {User}
 * @property {string} [phone]
 * @property {string} [address]
 * @property {string} [profileImage]
 * @property {string} [hotelName]
 * @property {PaymentMethod[]} paymentMethods
 * @property {UserDocument[]} documents
 * @property {UserPreferences} preferences
 * @property {number} loyaltyPoints
 * @property {'Silver' | 'Gold' | 'Platinum' | 'Diamond'} loyaltyTier
 * @property {string} [adminNotes]
 */

/**
 * @typedef {Object} PaymentMethod
 * @property {string} id
 * @property {'Visa' | 'MasterCard' | 'Amex'} brand
 * @property {string} last4
 * @property {string} expiry
 * @property {string} cardHolder
 */

/**
 * @typedef {Object} UserDocument
 * @property {string} id
 * @property {'Passport' | 'National ID' | 'Driving License'} type
 * @property {string} fileName
 * @property {string} [fileUrl]
 * @property {string} uploadDate
 * @property {'Verified' | 'Pending' | 'Rejected'} status
 */

/**
 * @typedef {Object} UserPreferences
 * @property {'High' | 'Low' | 'Ground' | 'No Preference'} preferredFloor
 * @property {'Feather' | 'Memory Foam' | 'Hypoallergenic'} pillowType
 * @property {string[]} dietaryRestrictions
 * @property {boolean} newsletter
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {'user' | 'model'} role
 * @property {string} text
 * @property {Date} timestamp
 */

