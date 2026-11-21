// Demo profile data. Nothing here is real — no payment details are stored.

export const demoUser = {
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  phone: '+1 555 0134',
};

export const addresses = [
  { id: 'home', label: 'Home', line1: '24 Elm Street, Apt 3B', line2: 'Riverside', note: 'Ring twice, 3rd floor' },
  { id: 'work', label: 'Work', line1: '88 Harbour Road, Floor 4', line2: 'Downtown', note: 'Leave at reception' },
  { id: 'sam', label: "Sam's place", line1: '5 Linden Court', line2: 'Northgate', note: '' },
];

export const paymentMethods = [
  { id: 'cash', label: 'Cash', detail: 'Pay the courier on delivery', icon: 'cash' },
  { id: 'card', label: 'Card', detail: 'Visa •••• 4242 · demo card', icon: 'card' },
  { id: 'wallet', label: 'BITE Wallet', detail: 'Balance $24.50 · demo', icon: 'wallet' },
];

export const languages = [
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
  { id: 'fr', label: 'Français' },
  { id: 'de', label: 'Deutsch' },
  { id: 'ar', label: 'العربية' },
];

export const recentSearchSeed = ['ramen', 'Ember & Bun', 'tiramisu'];
export const popularSearches = ['Burgers', 'Pizza', 'Sushi', 'Pad thai', 'Healthy bowls', 'Wings', 'Pancakes', 'Coffee'];

export const faqs = [
  { q: 'Where is my order?', a: 'Open Orders → Active to see live status, your courier and estimated arrival time.' },
  { q: 'Can I change my order after placing it?', a: 'Restaurants start preparing quickly. In this demo, orders cannot be edited once placed.' },
  { q: 'How do promo codes work?', a: 'Enter a code in your cart. Try BITE20 for 20% off (up to $10) or WELCOME5 for $5 off.' },
  { q: 'Is my payment information safe?', a: 'BITE is a design demo. No real payment details are ever requested, collected or transmitted.' },
];
