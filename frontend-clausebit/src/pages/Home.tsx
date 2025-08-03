import { Container } from "src/components/shared/Container.tsx";
import { Paragraph } from "src/components/shared/Paragraph.tsx";
import { Title } from "src/components/shared/Title.tsx";
import {
  Zap,
  FileText,
  AlertTriangle,
  Search,
  BookOpenCheck,
  Chrome,
} from "lucide-react";

const Home = () => {
  const features = [
    {
      title: "Summarize Policies",
      description: "Get simplified summaries of Terms of Service and privacy policies.",
      icon: <FileText className="w-6 h-6 text-emerald-600" />,
    },
    {
      title: "Flag Risky Clauses",
      description: "Identify data sharing, location tracking, and other risky practices.",
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
    },
    {
      title: "Query Explanations",
      description: "Receive clear and concise explanations of policy clauses when needed.",
      icon: <Search className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Dynamic Knowledge Base",
      description: "Retrieve relevant company information on demand using AI agents.",
      icon: <BookOpenCheck className="w-6 h-6 text-purple-600" />,
    },
  ];

  const extensionFeatures = [
    "Instantly flags data sharing and location tracking clauses",
    "Adds a simple summary button to websites with policies",
    "Seamless integration with your personal privacy preferences",
  ];

  return (
    <main className="bg-body">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <Container>
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left space-y-8">
              <h1 className="text-heading-1 text-4xl md:text-5xl xl:text-6xl font-bold leading-tight">
                Take Control of{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Your Privacy
                </span>
              </h1>

              <Paragraph className="text-lg max-w-2xl">
                ClauseBit is your AI-powered legal assistant that scans Terms of Service,
                Privacy Policies, and Cookie Banners — flagging risky clauses and explaining
                them in plain English.
              </Paragraph>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Try Now for Free
                </a>
                <a
                  href="#about-us"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-purple-600 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-colors duration-200"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Demo Video */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20" />
              <video
                autoPlay
                loop
                muted
                playsInline
                className="relative w-full max-h-[500px] rounded-2xl shadow-2xl object-cover"
              >
                <source src="/assets/main-demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </Container>
      </section>

        {/* Browser Extension Section */}
      <section id="extension" className="py-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div>
                <Title>Browser Extension</Title>
                <Paragraph className="mt-4 text-lg">
                  The ClauseBit extension works directly in your browser — scanning privacy policies,
                  cookie banners, and Terms of Service in real time.
                </Paragraph>
              </div>

              <div className="space-y-4">
                {extensionFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                      <Zap className="w-3 h-3 text-purple-600" />
                    </div>
                    <p className="text-gray-600">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="/sign-up"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Chrome className="w-5 h-5" />
                  Add to Chrome(Coming Soon!)
                </a>
              </div>
            </div>

            {/* Video */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20" />
              <video
                autoPlay
                loop
                muted
                playsInline
                className="relative w-full max-h-[500px] rounded-2xl shadow-xl object-cover"
              >
                <source src="/assets/demo-webextension.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </Container>
      </section>

      {/* About Section */}
      <section id="about-us" className="py-24 bg-gradient-to-br from-gray-50 to-purple-50/30">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image with Background Effect */}
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-20 -z-10" />
              <img
                src="/assets/chatinterface.png"
                alt="Demo Preview"
                className="relative w-full max-h-[500px] rounded-2xl shadow-xl object-cover"
              />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <Title>About ClauseBit</Title>
                <Paragraph className="mt-4 text-lg">
                  Most people don't read terms and policies — and honestly, we don't blame them.
                  ClauseBit reads through all the legal jargon for you, flags anything sketchy,
                  and explains it in plain language.
                </Paragraph>
              </div>

              <div className="grid gap-6">
                <div className="bg-box-bg border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-heading-2 font-semibold text-lg mb-2">Why We Built It</h3>
                      <p className="text-gray-600">
                        Everyone clicks 'Agree' — we just want to make sure you know what you're agreeing to.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-box-bg border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpenCheck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-heading-2 font-semibold text-lg mb-2">How It Works</h3>
                      <p className="text-gray-600">
                        We use AI to summarize long policies, highlight risky stuff, and give you clear answers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>



      {/* Features Section */}
      <section id="services" className="py-24 bg-gradient-to-br from-gray-50 to-purple-50/30">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Title>What ClauseBit Can Do</Title>
            <Paragraph className="mt-4 text-lg">
              ClauseBit uses cutting-edge AI to help you understand and control your digital agreements.
            </Paragraph>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-box-bg border border-gray-200 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-heading-2 font-semibold text-xl mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
};

export default Home;
