// Fictional menu items. `image` maps to /public/images/food/<image>.webp
// (+ "-sm" thumbnail). `menu` is the restaurant menu section, `tags` map to
// browse categories used by search filters.

export const MENU_SECTIONS = ['Burgers', 'Pizza', 'Mains', 'Sides', 'Drinks', 'Desserts'];

// Reusable option sets — sizes are single-choice, extras are multi-choice.
export const OPTION_SETS = {
  burger: {
    sizeLabel: 'Patty',
    sizes: [
      { id: 'single', label: 'Single patty', price: 0 },
      { id: 'double', label: 'Double patty', price: 3 },
    ],
    extras: [
      { id: 'cheese', label: 'Extra cheddar', price: 1 },
      { id: 'bacon', label: 'Smoked bacon', price: 1.5 },
      { id: 'avocado', label: 'Smashed avocado', price: 1.5 },
      { id: 'jalapenos', label: 'Pickled jalapeños', price: 0.5 },
      { id: 'gf-bun', label: 'Gluten-free bun', price: 1 },
    ],
  },
  pizza: {
    sizeLabel: 'Size',
    sizes: [
      { id: 'r10', label: '10" Regular', price: 0 },
      { id: 'l12', label: '12" Large', price: 3 },
      { id: 'f14', label: '14" Family', price: 5 },
    ],
    extras: [
      { id: 'mozz', label: 'Extra mozzarella', price: 1.5 },
      { id: 'mushroom', label: 'Roasted mushrooms', price: 1 },
      { id: 'olives', label: 'Kalamata olives', price: 1 },
      { id: 'chilli-honey', label: 'Chilli honey drizzle', price: 0.5 },
    ],
  },
  bowl: {
    sizeLabel: 'Portion',
    sizes: [
      { id: 'regular', label: 'Regular', price: 0 },
      { id: 'large', label: 'Large', price: 3 },
    ],
    extras: [
      { id: 'protein', label: 'Extra protein', price: 3 },
      { id: 'avocado', label: 'Avocado', price: 1.5 },
      { id: 'egg', label: 'Soft-boiled egg', price: 1 },
      { id: 'spicy', label: 'Spicy dressing', price: 0 },
    ],
  },
  asian: {
    sizeLabel: 'Portion',
    sizes: [
      { id: 'regular', label: 'Regular', price: 0 },
      { id: 'large', label: 'Large', price: 2.5 },
    ],
    extras: [
      { id: 'egg', label: 'Marinated egg', price: 1 },
      { id: 'noodles', label: 'Extra noodles / rice', price: 2 },
      { id: 'chilli-oil', label: 'Chilli crisp oil', price: 0.5 },
      { id: 'prawns', label: 'Add prawns', price: 3 },
    ],
  },
  sushi: {
    sizeLabel: 'Pieces',
    sizes: [
      { id: 'p8', label: '8 pieces', price: 0 },
      { id: 'p12', label: '12 pieces', price: 5 },
    ],
    extras: [
      { id: 'spicy-mayo', label: 'Spicy mayo', price: 0.5 },
      { id: 'eel-sauce', label: 'Sweet soy glaze', price: 0.5 },
      { id: 'extra-ginger', label: 'Extra pickled ginger', price: 0 },
    ],
  },
  curry: {
    sizeLabel: 'Portion',
    sizes: [
      { id: 'regular', label: 'Regular', price: 0 },
      { id: 'large', label: 'Large', price: 3 },
    ],
    extras: [
      { id: 'naan', label: 'Garlic naan', price: 2.5 },
      { id: 'rice', label: 'Pilau rice', price: 2.5 },
      { id: 'raita', label: 'Cucumber raita', price: 1 },
      { id: 'hot', label: 'Make it extra hot', price: 0 },
    ],
  },
  grill: {
    sizeLabel: 'Cooked',
    sizes: [
      { id: 'medium-rare', label: 'Medium rare', price: 0 },
      { id: 'medium', label: 'Medium', price: 0 },
      { id: 'well', label: 'Well done', price: 0 },
    ],
    extras: [
      { id: 'pepper', label: 'Peppercorn sauce', price: 1.5 },
      { id: 'chimichurri', label: 'Chimichurri', price: 1 },
      { id: 'slaw', label: 'House slaw', price: 2 },
    ],
  },
  mains: {
    sizeLabel: 'Portion',
    sizes: [
      { id: 'regular', label: 'Regular', price: 0 },
      { id: 'large', label: 'Large', price: 2.5 },
    ],
    extras: [
      { id: 'sauce', label: 'Extra sauce', price: 0.5 },
      { id: 'cheese', label: 'Add cheese', price: 1 },
      { id: 'side-salad', label: 'Side salad', price: 2 },
    ],
  },
  sides: {
    sizeLabel: 'Size',
    sizes: [
      { id: 'regular', label: 'Regular', price: 0 },
      { id: 'large', label: 'Large', price: 1.5 },
    ],
    extras: [
      { id: 'garlic-mayo', label: 'Garlic mayo dip', price: 0.8 },
      { id: 'cheese-sauce', label: 'Cheese sauce', price: 1 },
    ],
  },
  drinks: {
    sizeLabel: 'Size',
    sizes: [
      { id: 'regular', label: 'Regular', price: 0 },
      { id: 'large', label: 'Large', price: 1 },
    ],
    extras: [{ id: 'less-ice', label: 'Less ice', price: 0 }],
  },
  coffee: {
    sizeLabel: 'Size',
    sizes: [
      { id: 'small', label: 'Small', price: 0 },
      { id: 'large', label: 'Large', price: 0.8 },
    ],
    extras: [
      { id: 'oat', label: 'Oat milk', price: 0.5 },
      { id: 'shot', label: 'Extra shot', price: 0.6 },
      { id: 'vanilla', label: 'Vanilla syrup', price: 0.5 },
    ],
  },
  dessert: {
    sizes: [],
    extras: [
      { id: 'ice-cream', label: 'Scoop of vanilla ice cream', price: 1.5 },
      { id: 'sauce', label: 'Extra sauce', price: 0.5 },
    ],
  },
};

const d = (id, restaurantId, name, menu, price, description, options, extra = {}) => ({
  id,
  restaurantId,
  name,
  menu,
  price,
  description,
  options,
  image: id,
  popular: false,
  tags: [],
  dietary: [],
  ...extra,
});

export const dishes = [
  // Ember & Bun
  d(
    'classic-ember-burger',
    'ember-bun',
    'Classic Ember Burger',
    'Burgers',
    11.5,
    'Smashed beef patty, aged cheddar, pickles, white onion and our smoky ember sauce on toasted brioche.',
    'burger',
    { popular: true, tags: ['burgers'], kcal: 720 },
  ),
  d(
    'double-smash',
    'ember-bun',
    'Double Smash',
    'Burgers',
    14,
    'Two crispy-edged patties, double American cheese, caramelised onions and house pickles.',
    'burger',
    { popular: true, tags: ['burgers'], kcal: 980 },
  ),
  d('ranch-crunch-burger', 'ember-bun', 'Ranch Crunch', 'Burgers', 12.5, 'Beef patty, crisp iceberg, tomato, red onion and herby buttermilk ranch.', 'burger', {
    tags: ['burgers'],
    kcal: 760,
  }),
  d('bacon-blaze', 'ember-bun', 'Bacon Blaze', 'Burgers', 13.5, 'Smoked streaky bacon, pepper jack, charred jalapeños and chipotle mayo.', 'burger', {
    tags: ['burgers'],
    dietary: ['spicy'],
    kcal: 910,
  }),
  d('shoestring-fries', 'ember-bun', 'Shoestring Fries', 'Sides', 4, 'Skinny, extra-crispy fries finished with flaky sea salt.', 'sides', {
    popular: true,
    dietary: ['vegan'],
    kcal: 380,
  }),
  d('onion-rings', 'ember-bun', 'Beer-battered Onion Rings', 'Sides', 4.5, 'Thick-cut onion rings in a light, crunchy batter with smoky dip.', 'sides', {
    dietary: ['veg'],
    kcal: 420,
  }),
  d(
    'salted-caramel-shake',
    'ember-bun',
    'Cookies & Cream Shake',
    'Drinks',
    5.5,
    'Thick vanilla soft-serve blended with chocolate cookie crumb and fudge.',
    'drinks',
    { dietary: ['veg'], kcal: 640 },
  ),

  // Forno Nove
  d('margherita', 'forno-nove', 'Margherita', 'Pizza', 12, 'San Marzano tomato, fior di latte, fresh basil and extra-virgin olive oil.', 'pizza', {
    popular: true,
    tags: ['pizza'],
    dietary: ['veg'],
    kcal: 820,
  }),
  d('hot-pepperoni', 'forno-nove', 'Hot Pepperoni', 'Pizza', 14, 'Spicy cupped pepperoni, mozzarella, oregano and a chilli honey finish.', 'pizza', {
    popular: true,
    tags: ['pizza'],
    dietary: ['spicy'],
    kcal: 980,
  }),
  d('rustic-veggie-pizza', 'forno-nove', 'Rustic Garden', 'Pizza', 13, 'Red onion, roasted peppers, olives, sweetcorn and wild oregano.', 'pizza', {
    tags: ['pizza'],
    dietary: ['veg'],
    kcal: 860,
  }),
  d('penne-arrabbiata', 'forno-nove', 'Penne Arrabbiata', 'Mains', 11.5, 'Penne in a garlicky, chilli-spiked tomato sauce with shaved parmesan.', 'mains', {
    dietary: ['veg', 'spicy'],
    kcal: 640,
  }),
  d('tagliatelle-ragu', 'forno-nove', 'Tagliatelle al Ragù', 'Mains', 13.5, 'Fresh egg pasta with slow-cooked beef and pork ragù and parmesan.', 'mains', {
    kcal: 780,
  }),
  d('garlic-focaccia', 'forno-nove', 'Garlic Focaccia', 'Sides', 5, 'Warm focaccia brushed with garlic butter and parsley, with two dips.', 'sides', {
    dietary: ['veg'],
    kcal: 450,
  }),
  d('tiramisu', 'forno-nove', 'Tiramisù', 'Desserts', 6.5, 'Espresso-soaked savoiardi layered with mascarpone cream and cocoa.', 'dessert', {
    popular: true,
    tags: ['desserts'],
    dietary: ['veg'],
    kcal: 490,
  }),

  // Kumo Sushi Bar
  d('salmon-aburi-roll', 'kumo', 'Salmon Aburi Roll', 'Mains', 13, 'Flame-seared salmon over crab and avocado, finished with spicy mayo.', 'sushi', {
    popular: true,
    tags: ['sushi'],
    kcal: 520,
  }),
  d('omakase-platter', 'kumo', "Chef's Sushi Boat", 'Mains', 26, 'A chef-selected mix of maki, uramaki and nigiri for two to share.', 'sushi', {
    tags: ['sushi'],
    kcal: 1100,
  }),
  d('tonkotsu-ramen', 'kumo', 'Tonkotsu Ramen', 'Mains', 14.5, 'Rich pork bone broth, chashu, marinated egg, nori and spring onion.', 'asian', {
    popular: true,
    tags: ['asian'],
    kcal: 880,
  }),
  d('pan-fried-gyoza', 'kumo', 'Pan-fried Gyoza', 'Sides', 6.5, 'Crispy-bottomed pork and cabbage dumplings with ponzu, 6 pieces.', 'sides', {
    tags: ['asian'],
    kcal: 340,
  }),

  // Noodle Theory
  d(
    'spicy-miso-ramen',
    'noodle-theory',
    'Spicy Miso Ramen',
    'Mains',
    13.5,
    'Miso-chilli broth, soft egg, prawns, springy noodles and toasted sesame.',
    'asian',
    { popular: true, tags: ['asian'], dietary: ['spicy'], kcal: 760 },
  ),
  d('prawn-pad-thai', 'noodle-theory', 'Prawn Pad Thai', 'Mains', 13, 'Rice noodles, tiger prawns, tamarind, crushed peanuts and bean sprouts.', 'asian', {
    popular: true,
    tags: ['asian'],
    kcal: 690,
  }),
  d('bibimbap', 'noodle-theory', 'Bibimbap', 'Mains', 12.5, 'Steamed rice, seasoned vegetables, bulgogi beef, fried egg and gochujang.', 'asian', {
    tags: ['asian'],
    dietary: ['spicy'],
    kcal: 710,
  }),
  d('egg-fried-rice', 'noodle-theory', 'Egg Fried Rice', 'Sides', 5.5, 'Wok-fried jasmine rice with egg, peas and spring onion.', 'sides', {
    tags: ['asian'],
    dietary: ['veg'],
    kcal: 420,
  }),
  d('pork-dumplings', 'noodle-theory', 'Steamed Dumplings', 'Sides', 7, 'Pork and chive dumplings with black vinegar and chilli dip, 6 pieces.', 'sides', {
    tags: ['asian'],
    kcal: 360,
  }),

  // Green Fork
  d(
    'salmon-power-bowl',
    'green-fork',
    'Salmon Power Bowl',
    'Mains',
    13.5,
    'Roast salmon, brown rice, edamame, cucumber, sweetcorn and miso dressing.',
    'bowl',
    { popular: true, tags: ['healthy'], kcal: 610 },
  ),
  d(
    'rainbow-buddha-bowl',
    'green-fork',
    'Rainbow Buddha Bowl',
    'Mains',
    12,
    'Chickpeas, roast sweet potato, avocado, red cabbage, greens and tahini.',
    'bowl',
    { tags: ['healthy'], dietary: ['vegan'], kcal: 540 },
  ),
  d('tofu-poke', 'green-fork', 'Crispy Tofu Poke', 'Mains', 12.5, 'Crispy tofu, sushi rice, pickled cabbage, cucumber and sesame-soy.', 'bowl', {
    tags: ['healthy'],
    dietary: ['vegan'],
    kcal: 560,
  }),
  d('garden-crunch-salad', 'green-fork', 'Garden Crunch Salad', 'Sides', 7.5, 'Leaves, radish, carrot ribbons, cherry tomato and lemon vinaigrette.', 'bowl', {
    tags: ['healthy'],
    dietary: ['vegan'],
    kcal: 220,
  }),
  d('berry-smoothie', 'green-fork', 'Berry Banana Smoothie', 'Drinks', 5.5, 'Strawberry, banana, oat milk and a spoon of almond butter.', 'drinks', {
    popular: true,
    tags: ['healthy'],
    dietary: ['vegan'],
    kcal: 310,
  }),

  // Masala House
  d('butter-chicken', 'masala-house', 'Butter Chicken', 'Mains', 13.5, 'Tandoori chicken in a silky tomato, butter and fenugreek sauce.', 'curry', {
    popular: true,
    tags: ['indian'],
    kcal: 740,
  }),
  d('paneer-makhani', 'masala-house', 'Paneer Makhani', 'Mains', 12.5, 'Soft paneer simmered in a mildly spiced makhani gravy.', 'curry', {
    tags: ['indian'],
    dietary: ['veg'],
    kcal: 680,
  }),
  d('vegetable-samosas', 'masala-house', 'Vegetable Samosas', 'Sides', 5.5, 'Crisp pastry filled with spiced potato and peas, with mint chutney.', 'sides', {
    popular: true,
    tags: ['indian'],
    dietary: ['vegan'],
    kcal: 380,
  }),
  d('mint-lemonade', 'masala-house', 'Mint Lemonade', 'Drinks', 3.5, 'Fresh lemon, mint and a pinch of black salt over ice.', 'drinks', {
    dietary: ['vegan'],
    kcal: 120,
  }),

  // Taquería Sol
  d('street-tacos', 'taqueria-sol', 'Street Tacos Trio', 'Mains', 11, 'Three corn tortillas with chicken tinga, pico de gallo, avocado and lime.', 'mains', {
    popular: true,
    tags: ['mexican'],
    kcal: 620,
  }),
  d(
    'chicken-burrito',
    'taqueria-sol',
    'Chicken Burrito',
    'Mains',
    10.5,
    'Grilled chicken, rice, black beans, slaw and chipotle crema in a warm flour tortilla.',
    'mains',
    { tags: ['mexican'], kcal: 840 },
  ),
  d('cinnamon-churros', 'taqueria-sol', 'Cinnamon Churros', 'Desserts', 5.5, 'Crisp churros rolled in cinnamon sugar with warm chocolate dip.', 'dessert', {
    popular: true,
    tags: ['mexican', 'desserts'],
    dietary: ['veg'],
    kcal: 430,
  }),

  // Cluck Club
  d(
    'buttermilk-chicken',
    'cluck-club',
    'Buttermilk Fried Chicken',
    'Mains',
    12,
    'Three pieces of 24-hour buttermilk-brined chicken with a crunchy crust.',
    'mains',
    { popular: true, tags: ['chicken'], kcal: 890 },
  ),
  d('buffalo-wings', 'cluck-club', 'Buffalo Wings', 'Mains', 10, 'Eight crispy wings tossed in tangy buffalo sauce with blue cheese dip.', 'mains', {
    popular: true,
    tags: ['chicken'],
    dietary: ['spicy'],
    kcal: 760,
  }),
  d('crispy-tenders', 'cluck-club', 'Crispy Tenders', 'Mains', 9.5, 'Hand-breaded chicken tenders with honey mustard and a fresh leaf salad.', 'mains', {
    tags: ['chicken'],
    kcal: 640,
  }),
  d('loaded-fries', 'cluck-club', 'Parmesan Fries', 'Sides', 5.5, 'Crispy fries tossed with parmesan, garlic and parsley.', 'sides', {
    dietary: ['veg'],
    kcal: 520,
  }),
  d(
    'cookie-freakshake',
    'cluck-club',
    'Chocolate Freakshake',
    'Drinks',
    6.5,
    'Chocolate shake piled with whipped cream, brownie bits and fudge sauce.',
    'drinks',
    { tags: ['desserts'], dietary: ['veg'], kcal: 820 },
  ),

  // Smoke & Salt
  d('smoked-ribs', 'smoke-salt', 'Smoked BBQ Ribs', 'Mains', 19.5, 'Half rack of pork ribs, smoked for 8 hours and glazed with house BBQ.', 'mains', {
    popular: true,
    tags: ['grill'],
    kcal: 1050,
  }),
  d('steak-frites', 'smoke-salt', 'Steak Frites', 'Mains', 22, '250g flat-iron steak, rosemary fries and herb butter.', 'grill', {
    popular: true,
    tags: ['grill'],
    kcal: 990,
  }),
  d(
    'grill-skewers',
    'smoke-salt',
    'Mixed Grill Skewers',
    'Mains',
    17,
    'Chicken, beef and vegetable skewers with charred potatoes and garlic yoghurt.',
    'mains',
    { tags: ['grill'], kcal: 820 },
  ),
  d('tomato-soup', 'smoke-salt', 'Roasted Tomato Soup', 'Sides', 6, 'Slow-roasted tomato soup with pumpkin seeds and a swirl of cream.', 'sides', {
    dietary: ['veg'],
    kcal: 260,
  }),

  // Daybreak Café
  d('sunrise-plate', 'daybreak', 'Sunrise Toast Plate', 'Mains', 9.5, 'Thick-cut sourdough, fried egg, grilled tomato and herbed mushrooms.', 'mains', {
    popular: true,
    tags: ['breakfast'],
    dietary: ['veg'],
    kcal: 580,
  }),
  d('stacked-pancakes', 'daybreak', 'Stacked Pancakes', 'Mains', 9, 'Fluffy buttermilk pancakes with banana, berries and maple syrup.', 'mains', {
    popular: true,
    tags: ['breakfast', 'desserts'],
    dietary: ['veg'],
    kcal: 690,
  }),
  d('flat-white', 'daybreak', 'Flat White', 'Drinks', 3.5, 'Double ristretto with velvety steamed milk.', 'coffee', {
    popular: true,
    tags: ['coffee'],
    dietary: ['veg'],
    kcal: 120,
  }),
  d('iced-latte', 'daybreak', 'Iced Latte', 'Drinks', 4.2, 'Espresso over ice with cold milk — add a syrup if you like it sweet.', 'coffee', {
    tags: ['coffee'],
    dietary: ['veg'],
    kcal: 140,
  }),
  d('raspberry-sponge', 'daybreak', 'Raspberry Sponge', 'Desserts', 5.5, 'Light vanilla sponge layered with raspberry jam and fresh cream.', 'dessert', {
    tags: ['desserts'],
    dietary: ['veg'],
    kcal: 410,
  }),
  d(
    'blueberry-cheesecake',
    'daybreak',
    'Blueberry Cheesecake',
    'Desserts',
    6,
    'Baked vanilla cheesecake on a buttery biscuit base with blueberry compote.',
    'dessert',
    { popular: true, tags: ['desserts'], dietary: ['veg'], kcal: 470 },
  ),
];

const byId = Object.fromEntries(dishes.map((x) => [x.id, x]));
export const getDish = (id) => byId[id];
export const getOptions = (dish) => OPTION_SETS[dish?.options] || { sizes: [], extras: [] };
export const dishesFor = (restaurantId) => dishes.filter((x) => x.restaurantId === restaurantId);
export const popularDishes = dishes.filter((x) => x.popular);
