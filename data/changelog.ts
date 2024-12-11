import changelogListElips from './changelogList';

export default [
  {
    version: '1.5.0',
    title: 'Auxo',
    publishDate: '23 Septembor, 2024',
    logs: {
      new: [
        '<b>Vite Starter Versiton</b> (Contact <a href="mailto:support@themewagon.com">support</a> with the purchase id)',
        'PAGE : <code>travel-agency/hotel/admin/add-property</code>',
        'PAGE : <code>travel-agency/hotel/admin/add-room</code>',
        'PAGE : <code>travel-agency/hotel/admin/room-listing</code>',
        'PAGE : <code>travel-agency/hotel/admin/search-room</code>',
        'PAGE : <code>travel-agency/hotel/customer/homepage</code>',
        'PAGE : <code>travel-agency/hotel/customer/gallery</code>',
        'PACKAGE : <code>react-range</code>',
        'DOC : <code>React Range Documentation</code>'
      ],
      update: ['PACKAGE: React Bootstrap to 2.10.4'],
      fix: ['Minor Bugs']
    }
  },
  {
    version: '1.4.0',
    title: 'Apollo',
    publishDate: '23 Jun, 2024',
    logs: {
      new: [
        'DASHBOARD : <code>TravelAgency</code>',
        'PAGE : <code>travel-agency/landing</code>',
        'PACKAGE : <code>@turf/turf</code>',
        'PACKAGE : <code>tinymce</code>',
        'PACKAGE : Hosted <strong>Tinymce</strong> to the public directory'
      ],
      update: [
        'PACKAGE: Bootstrap to 5.3.3',
        'PACKAGE: React Bootstrap to 2.10.2',
        'DOC: Tinymce documentation'
      ],
      fix: ['Minor Bugs']
    }
  },
  {
    version: '1.3.0',
    title: 'Elpis',
    publishDate: '21 March, 2024',
    alertText:
      'This is a major update. Please backup your project before upgrading to the latest version',
    logs: {
      new: [
        'New theme color shades.',
        'DOC : Color page',
        `Utility Classes ${changelogListElips}`
      ],
      update: [
        'Bootstrap to 5.3.2',
        'All SCSS files are updated',
        'DOC: Styling documentation',
        'DOC: Dark mode documentation',
        'HTML: <code>bg-soft-{color}</code> to <code>bg-{color}-subtle</code>',
        'HTML: <code>z-index-{values}</code> to <code>z-{values}</code>',
        'HTML: <code>text-none</code> to <code>text-transform-none</code>',
        'HTML: <code>{text/bg}-gray-{100 to 1100}</code> classes replaced with <code>{text/bg}-body-{color}</code>',
        'HTML: <code>text-{themeColor}-{variant}</code> classes replaced with <code>text-{themeColor}-light/lighter/dark/darker</code>',
        'HTML: <code>z-index-bg-{themeColor}-{variant}</code> classes replaced with <code>bg-{themeColor}-light/lighter/dark/darker</code>'
      ],
      fix: ['Minor Bugs']
    }
  },
  {
    version: '1.2.0',
    title: 'Demetra',
    publishDate: '22 Nov, 2023',
    logs: {
      new: [
        'PAGE : <code>Apps/CRM/Deals</code>',
        'PAGE : <code>Apps/Kanban/Kanban</code>',
        'PAGE : <code>Apps/Kanban/Boards</code>',
        'PAGE : <code>Apps/Kanban/Create-Board</code>',
        'PAGE : <code>Apps/Calendar</code>',
        'PAGE : <code>Pages/Faq/Faq-Tab</code>',
        'PAGE : <code>Pages/Landing/Alternate</code>',
        'PAGE : <code>Pages/Timeline</code>',
        'PAGE : <code>Pages/Coming-Soon</code>',
        'PAGE : <code>Modules/Forms/Wizard</code>',
        'PAGE : <code>Modules/Components/Calendar</code>',
        'PAGE : <code>Modules/Components/Draggable</code>',
        'PAGE : <code>Modules/Widgets</code>',
        'COMPONENT : <code>FullCalendar</code>',
        'COMPONENT : <code>PhoenixDroppable</code>',
        'COMPONENT : <code>PhoenixFloatingLabel</code>',
        'COMPONENT : <code>ScrollSpy</code>',
        'FEATURE : <code>Chat Demo (floating widget)</code>',
        'FEATURE : <code>Chat file and image attachments</code>'
      ],
      update: [
        'PACKAGE: typescript to v5.2.2',
        'PACKAGE: swiper to v11.0.3',
        'PACKAGE: @iconscout/react-unicons to v2.0.2',
        'PACKAGE: eslint-config-prettier to v9.0.0',
        'PACKAGE: eslint-plugin-prettier to v5.0.1',
        'PACKAGE: prettier to v3.0.3'
      ],
      fix: ['Minor Bugs']
    }
  },
  {
    version: '1.1.0',
    title: 'Theseus',
    publishDate: '12 October, 2023',
    logs: {
      new: [
        'Dashboard : <code>CRM</code>',
        'PAGE : <code>CRM/Analytics</code>',
        'PAGE : <code>CRM/Deal-Details</code>',
        'PAGE : <code>CRM/Lead</code>',
        'PAGE : <code>CRM/Lead-Details</code>',
        'PAGE : <code>CRM/Reports</code>',
        'PAGE : <code>CRM/Report-Details</code>',
        'PAGE : <code>CRM/Add-Contact</code>',
        'PAGE : <code>pricing/pricing-grid</code>',
        'PAGE : <code>authentication/split/sign-in</code>',
        'PAGE : <code>authentication/split/sign-up</code>',
        'PAGE : <code>authentication/split/sign-out</code>',
        'PAGE : <code>authentication/split/forgot-password</code>',
        'PAGE : <code>authentication/split/reset-password</code>',
        'PAGE : <code>authentication/split/lock-screen</code>',
        'PAGE : <code>authentication/split/2FA</code>',
        'PAGE : <code>authentication/card/sign-in</code>',
        'PAGE : <code>authentication/card/sign-up</code>',
        'PAGE : <code>authentication/card/sign-out</code>',
        'PAGE : <code>authentication/card/forgot-password</code>',
        'PAGE : <code>authentication/card/reset-password</code>',
        'PAGE : <code>authentication/card/lock-screen</code>',
        'PAGE : <code>authentication/card/2FA</code>',
        'PAGE : <code>migrations</code>',
        'COMPONENT : <code>Unicon</code>',
        'COMPONENT : <code>PhoenixLoader</code>'
      ],
      update: [
        'Migrated from Font Awesome React  <code>Global Use</code> to <code>Individual Use</code> for improved icon management.',
        'Added <code>footerProps</code> in <code>AdvanceTable</code> columns definition.',
        'Example added for all <code>Icon</code> sets.'
      ],
      fix: ['Minor Bugs']
    }
  }
];
