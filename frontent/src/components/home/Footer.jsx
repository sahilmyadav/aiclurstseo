import { motion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Demo", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden
        bg-gradient-to-b from-white via-indigo-50/40 to-white
        border-t border-border/50"
    >
      {/* Soft background glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-300/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-3xl" />

      <div className="container-tight relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <a href="#" className="flex items-center gap-2 mb-4">
              <div
                className="w-10 h-10 rounded-xl
                  bg-gradient-to-br from-clurst-indigo via-clurst-purple to-clurst-blue
                  flex items-center justify-center
                  shadow-[0_12px_30px_-10px_rgba(99,102,241,0.6)]"
              >
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl text-foreground">
                Clurst
              </span>
            </a>

            <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
              Automate everything Google loves — reviews, replies, posts, and
              keywords — so your business ranks higher and grows faster.
            </p>

            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-clurst-purple" />
                <span>support@clurst.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-clurst-blue" />
                <span>USA & UK</span>
              </div>
            </div>
          </motion.div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <h4 className="font-semibold text-foreground mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-muted-foreground
                        hover:text-foreground
                        transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 pt-8
            border-t border-border/50
            flex flex-col md:flex-row
            justify-between items-center gap-4"
        >
          <p className="text-sm text-muted-foreground">
            © 2024 Clurst. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Designed for Google Growth
            </span>
            <div className="flex gap-1 text-lg">
              <span>🇺🇸</span>
              <span>🇬🇧</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
