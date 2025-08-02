import { Container } from "../shared/Container";

export const Footer = () => {
  return (
    <footer className="relative pt-16 pb-8 rounded-t-3xl bg-box-bg">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo + Brand */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-lg font-semibold text-heading-1">ClauseBit</span>
          </a>

          {/* Footer Nav Links */}
          <ul className="flex gap-6 text-heading-1 text-sm font-medium">
            <li><a href="/">Home</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/terms">Terms</a></li>
              {/*<li><a href="mailto:support@clausebit.com">Contact</a></li>*/}
          </ul>
        </div>
      </Container>
    </footer>
  );
};
