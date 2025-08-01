import { Container } from "src/components/shared/Container.tsx";
import { Paragraph } from "src/components/shared/Paragraph.tsx";
import { Title } from "src/components/shared/Title.tsx";
import {
  Zap,
  FileText,
  AlertTriangle,
  Search,
  BookOpenCheck,
} from "lucide-react";

const Home = () => {
  const features = [
    {
      title: "Summarize Policies",
      description:
        "Get simplified summaries of Terms of Service and privacy policies.",
      icon: <FileText className="w-6 h-6 text-green-600" />,
    },
    {
      title: "Flag Risky Clauses",
      description:
        "Identify data sharing, location tracking, and other risky practices.",
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
    },
    {
      title: "Query Explanations",
      description:
        "Receive clear and concise explanations of policy clauses when needed.",
      icon: <Search className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Dynamic Knowledge Base",
      description:
        "Retrieve relevant company information on demand using AI agents.",
      icon: <BookOpenCheck className="w-6 h-6 text-emerald-600" />,
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-36">
        <Container className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          {/* Gradient Blobs */}
          <div className="absolute w-full lg:w-1/2 inset-y-0 lg:right-0">
            <span className="absolute -left-6 md:left-4 top-24 lg:top-28 w-24 h-24 rotate-90 skew-x-12 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-60 lg:opacity-95 lg:block hidden" />
            <span className="absolute right-4 bottom-12 w-24 h-24 rounded-3xl bg-primary blur-xl opacity-80" />
          </div>

          {/* Text */}
          <div className="relative flex flex-col items-center text-center lg:text-left lg:py-8 lg:items-start lg:max-w-none max-w-3xl mx-auto lg:mx-0 lg:flex-1 lg:w-1/2">
            <h1 className="text-heading-1 text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold">
              Take Control of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 ml-2">
                Your Privacy
              </span>
            </h1>
            <Paragraph className="mt-8">
              ClauseBit is your AI-powered legal assistant that scans Terms of
              Service, Privacy Policies, and Cookie Banners — flagging risky
              clauses and explaining them in plain English. Personalized to your
              privacy preferences.
            </Paragraph>
            <div className="mt-10">
              <a
                href="/sign-up"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                Try Now!
              </a>
            </div>
          </div>

          {/* Demo Video */}
       <div className="flex-1 lg:w-[600px] relative max-w-xl mx-auto lg:mx-0">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-auto max-h-[520px] rounded-2xl object-contain shadow-2xl"
  >
    <source src="/assets/demo.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
  <span className="absolute -top-8 -left-10 w-40 h-40 bg-purple-500 blur-2xl opacity-40 rounded-full z-[-1]" />
</div>

        </Container>
      </section>

      {/* About Us Section */}
      <section id="about-us" className="pt-32">
        <Container className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center pt-20">
          {/* Left Image */}
          <div className="w-full lg:w-1/2">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="w-full object-contain rounded-3xl shadow-xl max-h-[560px]"
  >
    <source src="/assets/demo.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>


          {/* Right Text */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <Title>About ClauseBit Web App</Title>
            <Paragraph className="mt-4">
              Most people don’t read terms and policies — and honestly, we don’t
              blame them. ClauseBit is here to help. It’s a browser extension and
              web app that reads through all the legal jargon for you, flags
              anything sketchy like data sharing or tracking, and explains it in
              plain language. You get the facts, without the fluff.
            </Paragraph>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 shadow-sm">
                <Zap className="w-5 h-5 text-purple-600 mb-2" />
                <h3 className="font-semibold text-sm">Why We Built It</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Everyone clicks 'Agree' — we just want to make sure you know
                  what you’re agreeing to.
                </p>
              </div>
              <div className="border rounded-xl p-4 shadow-sm">
                <Zap className="w-5 h-5 text-purple-600 mb-2" />
                <h3 className="font-semibold text-sm">How It Works</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We use AI to summarize long policies, highlight risky stuff,
                  and give you clear answers when you have questions.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
      {/* Extension Section */}
<section id="extension" className="py-20 bg-gradient-to-br from-white via-purple-50 to-pink-50">
  <Container className="flex flex-col lg:flex-row items-center gap-10">
    {/* Left: Extension Preview Video */}
    <div className="w-full lg:w-1/2">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full object-contain rounded-3xl shadow-xl max-h-[540px]"
      >
        <source src="/assets/demo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>

    {/* Right: Description */}
    <div className="w-full lg:w-1/2">
      <Title>ClauseBit Browser Extension</Title>
      <Paragraph className="mt-4">
        The ClauseBit extension works directly in your browser — scanning privacy policies, cookie banners, and Terms of Service in real time. It flags risky language, auto-summarizes key clauses, and explains what you're agreeing to before you click "Accept."
      </Paragraph>

      <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
        <li className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-purple-600 mt-1" />
          Instantly flags data sharing and location tracking clauses.
        </li>
        <li className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-purple-600 mt-1" />
          Adds a simple summary button to websites with policies.
        </li>
        <li className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-purple-600 mt-1" />
          Seamless integration with your personal privacy preferences.
        </li>
      </ul>

      <div className="mt-8">
        <a
          href="/sign-up"
          className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-md hover:scale-105 transition-transform"
        >
          Add to Chrome
        </a>
      </div>
    </div>
  </Container>
</section>


      {/* Services Section */}
      <section id="services" className="py-20">
        <Container className="space-y-10 md:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <Title>What ClauseBit Can Do</Title>
            <Paragraph>
              ClauseBit uses cutting-edge AI to help you understand and control
              your digital agreements — faster and smarter.
            </Paragraph>
          </div>

          <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center max-w-xs px-4"
              >
                <div className="mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
};

export default Home;



