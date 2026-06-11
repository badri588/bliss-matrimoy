export const VENDOR_SERVICE_CATEGORIES = [
  {id: 1, label: 'Church Wedding Hall', icon: 'church'},
  {id: 2, label: 'Wedding Photography', icon: 'camera-retro'},
  {id: 3, label: 'Church Decoration', icon: 'spa'},
  {id: 4, label: 'Christian Catering', icon: 'utensils'},
  {id: 5, label: 'Bridal Makeup', icon: 'female'},
  {id: 6, label: 'Wedding Orchestra', icon: 'music'},
  {id: 7, label: 'Pastor Booking', icon: 'bible'},
  {id: 8, label: 'Wedding Cars', icon: 'car'},
  {id: 9, label: 'Honeymoon Planning', icon: 'plane'},
  {id: 10, label: 'Wedding Invitation Design', icon: 'envelope-open-text'},
  {id: 11, label: 'Cleaning Services', icon: 'broom'},
  {id: 12, label: 'Sound & Lighting', icon: 'lightbulb'},
  {id: 13, label: 'Wedding Cake', icon: 'birthday-cake'},
];

export const VENDOR_SERVICE_ICONS = VENDOR_SERVICE_CATEGORIES.reduce(
  (icons, service) => ({
    ...icons,
    [service.label]: service.icon,
  }),
  {}
);
