export const userSidebarConfig = {
  brand: { name: 'Clurst Review', short: 'C', to: '/dashboard' },
  sections: [
    {
      title: null,
      items: [
        { label: 'Reviews', to: '/dashboard', icon: '💬' },
        { label: 'Get Reviews', to: '/get-reviews', icon: '📨' },
        { label: 'Audit', to: '/audit', icon: '🧠' },
        { label: 'Review Link', to: '/review-link', icon: '🔗' },
        { label: 'Widgets', to: '/widgets', icon: '🧩' },
        { label: 'Integrations', to: '/integrations', icon: '⚙️' },
        { label: 'Social Sharing', to: '/social-sharing', icon: '📣' },
        { label: 'Home', to: '/', icon: '🏠' },
        { label: 'Logout', to: '/logout', icon: '🚪' },
      ],
    },
  ],
  user: { name: 'User', email: 'user@example.com' },
};

export const adminSidebarConfig = {
  brand: { name: 'Clurst Admin', short: 'A', to: '/dashboard' },
  sections: [
    {
      title: null,
      items: [
        { label: 'Dashboard', to: '/dashboard', icon: '📊' },
        { label: 'Users', to: '/admin/users', icon: '👥' },
        { label: 'Businesses', to: '/admin/businesses', icon: '🏪' },
        { label: 'Reviews', to: '/reviews', icon: '💬' },
        { label: 'Integrations', to: '/integrations', icon: '⚙️' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Settings', to: '/admin/settings', icon: '🛠️' },
        { label: 'Logs', to: '/admin/logs', icon: '📜' },
      ],
    },
    {
      title: 'OTHERS',
      items: [
        { label: 'Home', to: '/', icon: '🏠' },
        { label: 'Logout', to: '/logout', icon: '🚪' },
      ],
    },
  ],
  user: { name: 'Admin', email: 'admin@example.com' },
};
        