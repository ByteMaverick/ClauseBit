import { Container } from "src/components/shared/Container.tsx";
import { Paragraph } from "src/components/shared/Paragraph.tsx";

const TermsAndConditions = () => {
  return (
    <main className="bg-body">
      {/* Header Section */}
      <section className="relative pt-32 pb-16">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-heading-1 text-4xl md:text-5xl font-bold mb-6">
              Terms and Conditions
            </h1>
            <Paragraph className="text-lg text-gray-600">
              Last updated: August 2, 2025
            </Paragraph>
            <Paragraph className="text-sm text-gray-500 mt-2">
              ClauseBit is an independent project by Mohammed Ansari
            </Paragraph>
          </div>
        </Container>
      </section>

      {/* Terms Content */}
      <section className="pb-24">
        <Container>
          <div className="max-w-4xl mx-auto">

            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-heading-2 text-2xl font-semibold mb-4">1. What is ClauseBit?</h2>
              <Paragraph className="mb-4">
                Hey there! ClauseBit is a personal project I (Mohammed Ansari) built to help people understand those crazy long privacy policies and terms of service that nobody actually reads.
              </Paragraph>
              <Paragraph className="mb-4">
                It's an AI-powered browser extension and web app that summarizes legal documents, flags potentially risky stuff, and explains everything in plain English. Think of it as your friendly legal translator!
              </Paragraph>
            </div>

            {/* How it works */}
            <div className="mb-12">
              <h2 className="text-heading-2 text-2xl font-semibold mb-4">2. How ClauseBit Works</h2>
              <Paragraph className="mb-4">
                ClauseBit uses AI to:
              </Paragraph>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Read through Terms of Service and Privacy Policies</li>
                <li>Highlight things like data sharing and location tracking</li>
                <li>Give you simple summaries of the important bits</li>
                <li>Answer your questions about what policies actually mean</li>
              </ul>
              <Paragraph className="mb-4">
                It's built with some pretty cool tech (Adaptive RAG, vector search, all that jazz) but you don't need to worry about the technical stuff - it just works!
              </Paragraph>
            </div>

            {/* Using the service */}
            <div className="mb-12">
              <h2 className="text-heading-2 text-2xl font-semibold mb-4">3. Using ClauseBit</h2>
              <Paragraph className="mb-4">
                By using ClauseBit, you're agreeing to these terms. Pretty standard stuff:
              </Paragraph>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Don't try to break the service or hack into it</li>
                <li>Don't use it for anything illegal or harmful</li>
                <li>Be nice to other users</li>
                <li>Keep your account info secure if you create one</li>
              </ul>
            </div>

            {/* Important disclaimer */}
            <div className="mb-12 bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h2 className="text-heading-2 text-2xl font-semibold mb-4 text-yellow-800">4. Important: This Isn't Legal Advice!</h2>
              <Paragraph className="mb-4 text-yellow-700">
                ClauseBit is a helpful tool, but it's <strong>not</strong> a replacement for actual legal advice. Here's the deal:
              </Paragraph>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-yellow-700">
                <li>The AI might miss important stuff or make mistakes</li>
                <li>It's not a lawyer and neither am I (I'm a developer!)</li>
                <li>For serious legal decisions, talk to a real lawyer</li>
                <li>Always read the original documents for important agreements</li>
              </ul>
              <Paragraph className="text-yellow-700">
                I've built in controls to make it as accurate as possible, but AI isn't perfect. Use your judgment!
              </Paragraph>
            </div>

            {/* Privacy */}
            <div className="mb-12">
              <h2 className="text-heading-2 text-2xl font-semibold mb-4">5. Your Privacy</h2>
              <Paragraph className="mb-4">
                Since this is literally a privacy tool, I take your privacy seriously:
              </Paragraph>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>I only process the documents you choose to analyze</li>
                <li>Your privacy preferences are stored securely</li>
                <li>I use Google Cloud Platform for hosting and data storage</li>
                <li>No selling your data to third parties (that would be pretty ironic)</li>
              </ul>
              <Paragraph className="mb-4">
                The browser extension needs some permissions to work (reading tabs, storing your preferences, etc.) but it only activates when you want to analyze something.
              </Paragraph>
            </div>

            {/* Limitations */}
            <div className="mb-12">
              <h2 className="text-heading-2 text-2xl font-semibold mb-4">6. What I Can't Promise</h2>
              <Paragraph className="mb-4">
                I'm working hard to make ClauseBit awesome, but I can't guarantee:
              </Paragraph>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>100% uptime (servers sometimes hiccup)</li>
                <li>Perfect AI analysis every single time</li>
                <li>That it'll work on every website or browser</li>
                <li>That I won't need to update or change things</li>
              </ul>
              <Paragraph className="mb-4">
                I aim for sub-3 second response times and high accuracy, but technology isn't magic!
              </Paragraph>
            </div>

            {/* Intellectual property */}
            <div className="mb-12">
              <h2 className="text-heading-2 text-2xl font-semibold mb-4">7. Ownership and Rights</h2>
              <Paragraph className="mb-4">
                I built ClauseBit and own the code, AI models, and all that technical stuff. You can use it, but please don't:
              </Paragraph>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Copy or steal the code</li>
                <li>Try to reverse engineer how it works</li>
                <li>Create competing services using my work</li>
              </ul>
              <Paragraph className="mb-4">
                Fair use for personal projects or research is totally fine though!
              </Paragraph>
            </div>

            {/* Changes */}
            <div className="mb-12">
              <h2 className="text-heading-2 text-2xl font-semibold mb-4">8. Updates and Changes</h2>
              <Paragraph className="mb-4">
                Since this is an independent project, I might need to update these terms or the service itself. I'll let you know about major changes, but continued use means you're cool with the updates.
              </Paragraph>
              <Paragraph className="mb-4">
                If you're not happy with changes, you can always stop using ClauseBit (though I hope you won't!).
              </Paragraph>
            </div>

            {/* Problems */}
            <div className="mb-12">
              <h2 className="text-heading-2 text-2xl font-semibold mb-4">9. If Something Goes Wrong</h2>
              <Paragraph className="mb-4">
                Look, I'm doing my best to make this service reliable and helpful, but I'm just one person running an independent project. I can't be held responsible for:
              </Paragraph>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>Decisions you make based on AI analysis</li>
                <li>Any loss of data or missed opportunities</li>
                <li>Technical issues or service interruptions</li>
              </ul>
              <Paragraph className="mb-4">
                If you have issues, reach out and I'll do my best to help!
              </Paragraph>
            </div>

            {/* Contact */}
            <div className="mb-12 bg-purple-50 p-8 rounded-xl border border-purple-200">
              <h2 className="text-heading-2 text-2xl font-semibold mb-4 text-purple-800">10. Get in Touch</h2>
              <Paragraph className="mb-4 text-purple-700">
                Got questions, feedback, or just want to say hi? I'd love to hear from you!
              </Paragraph>
              <div className="bg-white p-4 rounded-lg border">
                <p className="mb-2"><strong>Mohammed Ansari</strong></p>
                <p className="mb-2">Creator of ClauseBit</p>
                <p className="mb-2">San Jose, California</p>
                <p className="mb-2">Email: mohammed@clausebit.com</p>
                <p>Website: https://clausebit.com</p>
              </div>
            </div>

            {/* Final note */}
            <div className="mb-12 bg-gray-50 p-6 rounded-xl">
              <h2 className="text-heading-2 text-xl font-semibold mb-3">The Bottom Line</h2>
              <Paragraph className="mb-3">
                ClauseBit exists to help you understand privacy policies and terms of service without drowning in legal jargon. It's a tool I built because I think everyone deserves to know what they're agreeing to online.
              </Paragraph>
              <Paragraph>
                Use it wisely, don't rely on it for major legal decisions, and remember - when in doubt, ask a real lawyer! Thanks for trying out my project. 🚀
              </Paragraph>
            </div>

          </div>
        </Container>
      </section>
    </main>
  );
};

export default TermsAndConditions;