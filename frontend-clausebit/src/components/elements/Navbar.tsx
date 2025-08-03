import { Container } from "../shared/Container";


export const navItems = [
  { href: "#", text: "Home" },
  { href: "#services", text: "Services" },
  { href: "#about-us", text: "About Us" },
];

export const Navbar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 py-4">
      {/* Glassmorphism background with blur */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border-b border-white/20"></div>

      <Container>
        <nav className="w-full flex justify-between items-center gap-6 relative">
          {/* Enhanced Logo with glow effect */}
            {/* Logo */}
          <div className="min-w-max inline-flex relative">
  <a href="/" className="relative flex items-center gap-3">
    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
  <span className="text-white font-bold text-lg">C</span>
</div>
              <div className="inline-flex text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ClauseBit
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 px-6 py-3 shadow-lg">
              <ul className="flex gap-8 items-center">
                {navItems.map((item, key) => (
                  <li key={key}>
                    <a
                      href={item.href}
                      className="relative text-gray-700 hover:text-purple-600 font-medium transition-all duration-300 px-4 py-2 rounded-xl hover:bg-white/20 group"
                    >
                      {item.text}
                      <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 group-hover:w-[calc(100%-2rem)]"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enhanced CTA Button */}
          <div className="hidden lg:flex items-center">
            <a
              href="/sign-in"
              className="relative px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 group overflow-hidden"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
          </div>


          {/* Mobile Menu (you'll need to add state management for toggle) */}
          <div className="flex flex-col lg:hidden w-full lg:justify-between lg:items-center absolute top-full left-0 lg:static lg:top-0 bg-white/95 backdrop-blur-xl lg:bg-transparent border border-white/20 lg:border-0 rounded-2xl mt-4 shadow-2xl h-0 lg:h-auto overflow-hidden transition-all duration-300">
            <ul className="flex flex-col gap-2 p-6">
              {navItems.map((item, key) => (
                <li key={key}>
                  <a
                    href={item.href}
                    className="block px-4 py-3 text-gray-700 hover:text-purple-600 font-medium rounded-xl hover:bg-purple-50 transition-colors duration-300"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
              <li className="pt-4 border-t border-gray-200">
                <a
                  href="/sign-in"
                  className="block w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  Login
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </Container>
    </header>
  );
};