import { Container } from "src/components/shared/Container.tsx";
import { Paragraph } from "src/components/shared/Paragraph.tsx";

const TermsAndConditions = () => {
  return (
    <main className="bg-body">
      <section className="pt-32 pb-16">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms and Conditions
            </h1>
            <Paragraph className="text-gray-600">
              Last updated: August 2, 2025
            </Paragraph>
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">

            <div>
              <h2 className="text-2xl font-semibold mb-3">About ClauseBit</h2>
              <Paragraph>
                ClauseBit is an AI-powered tool that summarizes privacy policies and terms of service.
                It helps you understand legal documents in plain English, but it's not a substitute for legal advice.
              </Paragraph>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Acceptable Use</h2>
              <Paragraph>
                By using ClauseBit, you agree to use it responsibly and not engage in harmful,
                illegal, or abusive activities. Keep your account secure if you create one.
              </Paragraph>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h2 className="text-2xl font-semibold mb-3 text-yellow-800">Important Disclaimer</h2>
              <Paragraph className="text-yellow-700">
                ClauseBit provides summaries and analysis for informational purposes only.
                It is not legal advice and may contain errors. Always consult a qualified
                attorney for legal decisions and read original documents carefully.
              </Paragraph>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Privacy</h2>
              <Paragraph>
                We only process documents you choose to analyze and store your preferences securely.
                Your data is hosted on Google Cloud Platform and is not sold to third parties.
              </Paragraph>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Limitations</h2>
              <Paragraph>
                ClauseBit is provided "as is" without warranties. We cannot guarantee 100% uptime,
                perfect accuracy, or compatibility with all websites. The service may be updated
                or modified at any time.
              </Paragraph>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Contact</h2>
              <Paragraph>
                Questions or concerns? Contact Mohammed Ansari at mohammed.ansari@sjsu.edu
              </Paragraph>
            </div>

          </div>
        </Container>
      </section>
    </main>
  );
};

export default TermsAndConditions;