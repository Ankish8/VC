import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface WelcomeCredentialsEmailProps {
  name: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
}

export const WelcomeCredentialsEmail = ({
  name,
  email,
  tempPassword,
  loginUrl,
}: WelcomeCredentialsEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to VectorCraft - Your Lifetime Access is Ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to VectorCraft! 🎉</Heading>

          <Text style={text}>
            Hi {name},
          </Text>

          <Text style={text}>
            Thank you for purchasing the VectorCraft Lifetime Deal! We're
            excited to have you on board. Your account has been created and
            you now have unlimited access to our AI-powered vector conversion
            tool.
          </Text>

          <Section style={credentialsBox}>
            <Heading as="h2" style={h2}>
              Your Login Credentials
            </Heading>
            <Text style={credentialText}>
              <strong>Email:</strong> {email}
            </Text>
            <Text style={credentialText}>
              <strong>Temporary Password:</strong>{" "}
              <code style={codeStyle}>{tempPassword}</code>
            </Text>
          </Section>

          <Section style={warningBox}>
            <Text style={warningText}>
              ⚠️ <strong>Important:</strong> For security reasons, you'll be
              required to change your password when you log in for the first
              time.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Log In to VectorCraft
            </Button>
          </Section>

          <Hr style={hr} />

          <Heading as="h2" style={h2}>
            What You Get with Lifetime Access
          </Heading>

          <Text style={featureText}>✅ Unlimited vector conversions</Text>
          <Text style={featureText}>✅ SVG & EPS export formats</Text>
          <Text style={featureText}>✅ Priority support</Text>
          <Text style={featureText}>✅ Batch processing</Text>
          <Text style={featureText}>✅ Lifetime updates & new features</Text>

          <Hr style={hr} />

          <Text style={text}>
            If you have any questions or need assistance, our support team is
            here to help. Just reply to this email!
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The VectorCraft Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeCredentialsEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0 40px",
  textAlign: "center" as const,
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "16px 0",
};

const text = {
  color: "#525252",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  padding: "0 40px",
};

const credentialsBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 40px",
  border: "1px solid #e5e7eb",
};

const credentialText = {
  color: "#1a1a1a",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "8px 0",
};

const codeStyle = {
  backgroundColor: "#fee2e2",
  color: "#991b1b",
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "14px",
  fontFamily: "monospace",
  fontWeight: "bold" as const,
};

const warningBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "16px 24px",
  margin: "24px 40px",
  border: "1px solid #fbbf24",
};

const warningText = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const buttonContainer = {
  padding: "24px 40px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 40px",
};

const featureText = {
  color: "#525252",
  fontSize: "16px",
  lineHeight: "28px",
  margin: "4px 0",
  padding: "0 40px",
};

const footer = {
  color: "#737373",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "32px 0",
  padding: "0 40px",
};
