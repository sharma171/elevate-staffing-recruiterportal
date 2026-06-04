const CookiesData = [
  {
    title: "1. What Are Cookies",
    content: [
      "Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.",
      "Cookies allow websites to recognize your device and remember certain information about your visit, such as your preferences and actions on the site.",
      "Each cookie typically contains a unique string of characters that allows the website to recognize your browser when you return to the site. Cookies may be set by the website you are visiting (first-party cookies) or by other services or entities (third-party cookies).",
    ],
  },
  {
    title: "2. How We Use Cookies",
    content: [
      'TB Soft Solutions LLC, doing business as ElevateStaffing AI ("we", "our", or "us"), uses cookies for the following purposes:',
    ],
    list: [
      "Essential cookies: Necessary for the website to function properly. These cookies enable core functionality such as security, network management, and account access.",
      "Preference cookies: Remember your settings and preferences to enhance your experience (e.g., language preference, display settings, accessibility options).",
      "Analytics cookies: Help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      "Marketing cookies: Used to track visitors across websites to display relevant advertisements that may be of interest to you.",
      "Authentication cookies: Maintain your logged-in status and remember your account information when you return to our site.",
      "Security cookies: Help detect and prevent fraudulent activity and security risks to protect both our platform and your data.",
    ],
  },
  {
    title: "3. Types of Cookies We Use",
    content: [
      "Session Cookies: Temporary cookies that are deleted when you close your browser. These cookies do not collect information from your device.",
      "Persistent Cookies: Remain on your device for a predetermined period or until manually deleted.",
      "First-Party Cookies: Set by our website domain directly.",
      "Third-Party Cookies: Placed by third-party services used on our website, such as Google Analytics, advertising networks, and social media platforms.",
    ],
  },
  {
    title: "3.1 Specific Cookies We Use",
    table: {
      headers: ["Cookie Name", "Purpose", "Expiry", "Type"],
      rows: [
        ["session_id", "Authentication and session management", "Session", "Essential"],
        ["user_preferences", "Stores user interface preferences", "1 year", "Preference"],
        ["_ga", "Google Analytics - Distinguishes users", "2 years", "Analytics"],
        ["_gid", "Google Analytics - Distinguishes users", "24 hours", "Analytics"],
        ["_gat", "Google Analytics - Throttles request rate", "1 minute", "Analytics"],
        ["ads_optimization", "Used for ad personalization", "90 days", "Marketing"],
        ["_fbp", "Facebook Pixel - Identifies browsers for ad delivery", "90 days", "Marketing"],
        ["auth_token", "Maintains authenticated user sessions", "Expiry", "Essential"],
        ["csrf_token", "Protects against Cross-Site Request Forgery attacks", "30 days", "Security"],
      ],
    },
  },
  {
    title: "4. Third-Party Technology Partners",
    content: [
      "We partner with several third-party services that may use cookies or similar technologies on our website:",
    ],
    list: [
      "Google Analytics: Used to analyze website traffic and user behavior.",
      "Google Ads: Used for retargeting and advertising purposes.",
      "Facebook Pixel: Used for conversion tracking and advertising.",
      "HubSpot: Used for marketing automation and CRM.",
      "Intercom: Used for customer support and messaging.",
    ],
  },
  {
    title: "5. Managing Cookies",
    content: ["Most web browsers allow you to control cookies through their settings. You can:"],
    list: [
      "Delete existing cookies through your browser settings",
      "Block cookies from being set by adjusting the settings in your browser",
      "Set your browser to notify you when cookies are being placed",
      "Browse in private or incognito mode, which does not store cookies after your session",
    ],
    content2: [
      "Please note that restricting cookies may impact your experience on our website and limit certain functionalities. In particular, disabling essential cookies may prevent you from using certain features of our platform, such as logging in to your account.",
    ],
  },
  {
    title: "5.1 Do Not Track Signals",
    content: [
      'Some browsers have a "Do Not Track" feature that allows you to tell websites that you do not want to have your online activities tracked.',
      'At this time, we do not respond to browser "Do Not Track" signals, but we do provide you the option to opt out of certain types of cookies through your browser settings.',
    ],
  },
  {
    title: "5.2 Mobile Device Settings",
    content: ["On mobile devices, you can limit advertising tracking in your device settings:"],
    list: [
      'iOS devices: Settings → Privacy & Security → Tracking → Toggle "Allow Apps to Request to Track"',
      "Android devices: Settings → Google → Ads → Opt out of Ads Personalization",
    ],
  },
  {
    title: "6. Cookie Consent",
    content: [
      "When you first visit our website, you will be presented with a cookie consent banner that allows you to accept or decline non-essential cookies.",
      "By continuing to use our website after accepting cookies, you consent to our use of cookies as described in this Cookie Policy.",
    ],
  },
  {
    title: "7. Legal Basis for Cookie Usage",
    content: ["We use cookies based on the following legal grounds:"],
    list: [
      "Legitimate interest: For analytics, security, and certain functional cookies that improve our services.",
      "Consent: For marketing and advertising cookies, we rely on your explicit consent.",
      "Contractual necessity: For essential cookies that enable core platform functionality.",
    ],
  },
  {
    title: "8. Cross-Border Data Transfers",
    content: [
      "Cookies may involve the transfer of your information to countries outside your jurisdiction, including the United States. When such transfers occur, we ensure appropriate safeguards are in place in accordance with applicable data protection laws.",
    ],
  },
  {
    title: "9. Changes to This Cookie Policy",
    content: [
      'We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last Updated" date.',
    ],
  },
  {
    title: "10. Contact Us",
    content: ["If you have any questions about our Cookie Policy, please contact us at:"],
    list: ["TB Soft Solutions LLC (DBA ElevateStaffing AI)", "Email: privacy@tbsoftsolutions.com"],
  },
];

export default CookiesData;
