/**
 * Category scaffolding.
 *
 * Each entry supplies the structure a site of that type needs: theme, section
 * copy, and the services a business in that category typically offers. These
 * are starting points to edit, not claims about any particular business.
 *
 * Identity facts — legal name, address, phone, email, hours, prices, reviews —
 * are deliberately left blank. They must be filled in from the owner before a
 * site is shown to anyone.
 */

const CATEGORIES = {
  coffee: {
    theme: 'coffee',
    schemaType: 'CafeOrCoffeeShop',
    tagline: 'Small-batch espresso, pulled to order.',
    aboutHeading: 'Our Story',
    about:
      'REPLACE: two or three sentences on how the shop started, who runs it, and what regulars come back for.\n\nREPLACE: a second paragraph on sourcing, the roast, or the neighborhood.',
    galleryTiles: 6,
    services: [
      { title: 'Espresso Bar', desc: 'Lattes, cappuccinos, macchiatos, americanos, and straight shots.' },
      { title: 'Drip & Pour-Over', desc: 'Fresh pots through the day, plus single-cup pour-overs on request.' },
      { title: 'Cold Brew & Iced', desc: 'Slow-steeped cold brew, iced lattes, and blended drinks.' },
      { title: 'Tea & Non-Coffee', desc: 'Loose-leaf teas, chai, steamers, and kid-friendly options.' },
      { title: 'Fresh Pastries', desc: 'Baked goods delivered each morning.' },
      { title: 'Drive-Thru', desc: 'Order from the window — most drinks out in under three minutes.' },
    ],
  },

  petgrooming: {
    theme: 'pets',
    schemaType: 'PetStore',
    tagline: 'Gentle, unhurried grooming for dogs and cats.',
    aboutHeading: 'About the Shop',
    about:
      'REPLACE: who the groomer is, how long they have been doing this, and their approach to nervous animals.\n\nREPLACE: certifications, handling philosophy, or what makes the shop different.',
    galleryTiles: 6,
    services: [
      { title: 'Full Groom', desc: 'Bath, blow-out, haircut, nails, ears, and a finishing brush.' },
      { title: 'Bath & Brush', desc: 'Wash, dry, deshed, and tidy-up without a full cut.' },
      { title: 'Nail Trim & Grind', desc: 'Quick walk-in service, no appointment needed.' },
      { title: 'De-Shedding Treatment', desc: 'Undercoat removal for double-coated breeds.' },
      { title: 'Puppy First Groom', desc: 'A short, low-stress introduction to the grooming table.' },
      { title: 'Cat Grooming', desc: 'Baths, lion cuts, and nail caps by appointment.' },
    ],
  },

  antiques: {
    theme: 'vintage',
    schemaType: 'Store',
    tagline: 'Curated antiques, oddities, and honest old things.',
    aboutHeading: 'About the Shop',
    about:
      'REPLACE: how long the shop has been open, what the owner collects, and what walking in feels like.\n\nREPLACE: whether dealers rent booths, and how stock turns over.',
    galleryTiles: 8,
    services: [
      { title: 'Furniture', desc: 'Solid-wood pieces, mid-century through Victorian.' },
      { title: 'Glassware & China', desc: 'Depression glass, pottery, and full sets.' },
      { title: 'Vintage Decor', desc: 'Signs, lighting, mirrors, and wall art.' },
      { title: 'Jewelry & Smalls', desc: 'Costume and estate jewelry, watches, and curiosities.' },
      { title: 'Estate Buying', desc: 'REPLACE: describe how the shop buys, or remove this card.' },
      { title: 'Booth Rental', desc: 'REPLACE: booth sizes and monthly rates, or remove this card.' },
    ],
  },

  thrift: {
    theme: 'thrift',
    schemaType: 'Store',
    tagline: 'New stock on the floor every single day.',
    aboutHeading: 'About Us',
    about:
      'REPLACE: who runs the store, what it supports, and how long it has been open.\n\nREPLACE: donation policy and what happens to items that do not sell.',
    galleryTiles: 6,
    services: [
      { title: 'Clothing', desc: "Men's, women's, and kids' — sorted by size, restocked daily." },
      { title: 'Housewares', desc: 'Kitchen, glassware, small appliances, and linens.' },
      { title: 'Furniture', desc: 'Couches, tables, dressers, and shelving.' },
      { title: 'Books, Media & Toys', desc: 'Paperbacks, records, games, and puzzles.' },
      { title: 'Donations Welcome', desc: 'REPLACE: donation hours and what you can and cannot accept.' },
      { title: 'Weekly Deals', desc: 'REPLACE: color-tag sales, senior day, or student discounts.' },
    ],
  },

  autorepair: {
    theme: 'auto',
    schemaType: 'AutoRepair',
    tagline: 'Straight answers and work that holds up.',
    aboutHeading: 'About the Shop',
    about:
      'REPLACE: who the mechanics are, years in the trade, and certifications.\n\nREPLACE: warranty terms and how estimates are handled.',
    galleryTiles: 4,
    services: [
      { title: 'Diagnostics', desc: 'Check-engine codes read and traced to the actual cause.' },
      { title: 'Brakes & Suspension', desc: 'Pads, rotors, shocks, struts, and alignment.' },
      { title: 'Engine & Transmission', desc: 'Timing, cooling, leaks, and driveline work.' },
      { title: 'Scheduled Maintenance', desc: 'Oil, filters, fluids, and factory-interval service.' },
      { title: 'Tires & Wheels', desc: 'Mount, balance, rotate, and repair.' },
      { title: 'Off-Road & Lift Kits', desc: 'REPLACE: suspension lifts, armor, and build work — or remove.' },
    ],
  },

  nails: {
    theme: 'salon',
    schemaType: 'NailSalon',
    tagline: 'Clean work, careful prep, and colors that last.',
    aboutHeading: 'About the Salon',
    about:
      'REPLACE: who the technicians are, their training, and the salon atmosphere.\n\nREPLACE: sanitation practices and booking policy.',
    galleryTiles: 8,
    services: [
      { title: 'Manicure', desc: 'Shape, cuticle care, buff, and polish.' },
      { title: 'Pedicure', desc: 'Soak, exfoliation, callus care, massage, and polish.' },
      { title: 'Gel & Dip', desc: 'Long-wear color with proper prep and removal.' },
      { title: 'Acrylic & Extensions', desc: 'Full sets, fills, and repairs.' },
      { title: 'Nail Art', desc: 'Freehand designs, chrome, ombré, and hand-set stones.' },
      { title: 'Waxing', desc: 'REPLACE: list the waxing services offered, or remove this card.' },
    ],
  },

  boutique: {
    theme: 'boutique',
    schemaType: 'ClothingStore',
    tagline: 'A small shop with a point of view.',
    aboutHeading: 'About the Shop',
    about:
      'REPLACE: who the owner is, how they buy, and what the shop is known for.\n\nREPLACE: local makers carried, or the story behind the name.',
    galleryTiles: 6,
    services: [
      { title: 'Apparel', desc: 'REPLACE: the categories and sizes carried.' },
      { title: 'Accessories', desc: 'Bags, scarves, hats, and jewelry.' },
      { title: 'Gifts', desc: 'Cards, candles, and small-batch goods.' },
      { title: 'Local Makers', desc: 'REPLACE: name the local artists and brands carried.' },
      { title: 'Gift Wrapping', desc: 'REPLACE: free with purchase? seasonal only? — or remove.' },
      { title: 'Personal Shopping', desc: 'REPLACE: describe or remove this card.' },
    ],
  },

  market: {
    theme: 'market',
    schemaType: 'GroceryStore',
    tagline: 'Your neighborhood grocery and deli.',
    aboutHeading: 'About the Market',
    about:
      'REPLACE: how long the market has served the area and who runs it.\n\nREPLACE: local suppliers, house-made items, or the deli specialty.',
    galleryTiles: 6,
    services: [
      { title: 'Deli Counter', desc: 'Sandwiches, salads, and sliced-to-order meats and cheeses.' },
      { title: 'Fresh Produce', desc: 'REPLACE: note local growers or seasonal highlights.' },
      { title: 'Meat & Seafood', desc: 'REPLACE: butcher counter details, or remove this card.' },
      { title: 'Pantry & Staples', desc: 'Everything for the week without the drive to a big store.' },
      { title: 'Beer & Wine', desc: 'REPLACE: selection notes, or remove this card.' },
      { title: 'Catering Trays', desc: 'REPLACE: lead time and tray sizes, or remove this card.' },
    ],
  },

  homeservices: {
    theme: 'trade',
    schemaType: 'HomeAndConstructionBusiness',
    tagline: 'Licensed, bonded, and on time.',
    aboutHeading: 'About the Crew',
    about:
      'REPLACE: who owns the business, years in the trade, and the service area.\n\nREPLACE: license number, insurance, and how estimates work.',
    galleryTiles: 6,
    services: [
      { title: 'Free Estimates', desc: 'REPLACE: how to book and what an estimate covers.' },
      { title: 'Residential Work', desc: 'REPLACE: the core residential service offered.' },
      { title: 'Commercial Work', desc: 'REPLACE: the core commercial service, or remove this card.' },
      { title: 'Emergency Service', desc: 'REPLACE: hours and response time, or remove this card.' },
      { title: 'Maintenance Plans', desc: 'REPLACE: describe recurring service, or remove this card.' },
      { title: 'Warranty', desc: 'REPLACE: what is covered and for how long.' },
    ],
  },

  restaurant: {
    theme: 'market',
    schemaType: 'Restaurant',
    tagline: 'Honest food, made from scratch.',
    aboutHeading: 'About the Kitchen',
    about:
      'REPLACE: who runs the kitchen, how long the place has been open, and what regulars order.\n\nREPLACE: house specialties, local suppliers, or the story behind the building.',
    galleryTiles: 6,
    services: [
      { title: 'Breakfast', desc: 'REPLACE: what is served and until when.' },
      { title: 'Lunch', desc: 'REPLACE: sandwiches, burgers, soups — name the ones people come back for.' },
      { title: 'Dinner', desc: 'REPLACE: the dinner menu, or remove this card if breakfast and lunch only.' },
      { title: 'Homemade Daily', desc: 'REPLACE: soups, pies, gravy — whatever is genuinely made in house.' },
      { title: 'Bar', desc: 'REPLACE: beer, wine, cocktails — or remove this card.' },
      { title: 'Takeout & Catering', desc: 'REPLACE: how to order ahead, or remove this card.' },
    ],
  },

  professional: {
    theme: 'professional',
    schemaType: 'ProfessionalService',
    tagline: 'Clear advice, plainly explained.',
    aboutHeading: 'About the Practice',
    about:
      'REPLACE: background, credentials, and years of practice.\n\nREPLACE: who the practice serves and how the first meeting works.',
    galleryTiles: 0,
    services: [
      { title: 'Consultation', desc: 'REPLACE: what an initial consultation covers and its cost.' },
      { title: 'Core Service', desc: 'REPLACE: the primary service offered.' },
      { title: 'Secondary Service', desc: 'REPLACE: or remove this card.' },
      { title: 'Fees', desc: 'REPLACE: fee structure, or remove this card.' },
    ],
  },
};

/** Hours scaffolding — real hours must be confirmed with the owner. */
const HOURS_PRESETS = {
  retail: [
    { days: 'Mon – Fri', open: 'REPLACE', close: 'REPLACE' },
    { days: 'Saturday', open: 'REPLACE', close: 'REPLACE' },
    { days: 'Sunday', closed: true },
  ],
  earlyservice: [
    { days: 'Mon – Fri', open: 'REPLACE', close: 'REPLACE' },
    { days: 'Saturday', open: 'REPLACE', close: 'REPLACE' },
    { days: 'Sunday', closed: true },
  ],
  appointment: [
    { days: 'Tue – Sat', open: 'REPLACE', close: 'REPLACE' },
    { days: 'Sun – Mon', closed: true },
  ],
};

module.exports = { CATEGORIES, HOURS_PRESETS };
