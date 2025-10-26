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

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export const PasswordResetEmail = ({
  name,
  resetUrl,
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your VectorCraft password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Password Reset Request</Heading>

          <Text style={text}>Hi {name},</Text>

          <Text style={text}>
            We received a request to reset your password for your VectorCraft
            account. If you didn&apos;t make this request, you can safely ignore
            this email.
          </Text>

          <Section style={warningBox}>
            <Text style={warningText}>
              ⏱️ <strong>Important:</strong> This link will expire in 15
              minutes for security reasons.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Your Password
            </Button>
          </Section>

          <Text style={text}>
            Or copy and paste this URL into your browser:
          </Text>
          <Text style={linkText}>{resetUrl}</Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you didn&apos;t request a password reset, please ignore this email or
            contact support if you have concerns.
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

export default PasswordResetEmail;

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

const text = {
  color: "#525252",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
  padding: "0 40px",
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

const linkText = {
  color: "#667eea",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
  padding: "0 40px",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 40px",
};

const footer = {
  color: "#737373",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
  padding: "0 40px",
};
