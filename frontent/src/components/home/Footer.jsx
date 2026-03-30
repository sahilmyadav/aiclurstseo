import { Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features", scroll: true },
    { label: "Pricing", href: "#pricing", scroll: true },
    { label: "Reviews", href: "#reviews", scroll: true },
    { label: "FAQ", href: "#faq", scroll: true },
  ],
  Company: [
    { label: "About", to: "/about" },
    { label: "Home", to: "/" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms of Service", to: "/terms-of-service" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-1">
              <img src="/clurst transparent logo 2 for white baground.png" alt="Clurst" className="h-32 w-auto" />
            </a>
            <p className="text-gray-500 mb-6 max-w-sm leading-relaxed text-sm">
              Automate everything Google loves — reviews, replies, posts, and
              keywords — so your business ranks higher and grows faster.
            </p>
            <div className="flex flex-col gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-500" />
                <span>support@clurst.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-500" />
                <span>USA & UK</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <div key={category}>
              <h4 className="font-semibold text-gray-800 mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link, i) => (
                  <li key={i}>
                    {link.scroll ? (
                      <a href={link.href}
                        onClick={e => { e.preventDefault(); document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="text-gray-500 hover:text-gray-900 transition-colors duration-200 cursor-pointer text-sm">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.to} className="text-gray-500 hover:text-gray-900 transition-colors duration-200 text-sm">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2024 Clurst. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">Designed for Google Growth</span>
            <div className="flex gap-1 text-lg"><span>🇺🇸</span><span>🇬🇧</span></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
