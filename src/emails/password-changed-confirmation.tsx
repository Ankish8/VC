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

interface PasswordChangedConfirmationEmailProps {
  name: string;
  loginUrl: string;
}

export const PasswordChangedConfirmationEmail = ({
  name,
  loginUrl,
}: PasswordChangedConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your VectorCraft password has been changed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Password Changed Successfully ✓</Heading>

          <Text style={text}>Hi {name},</Text>

          <Text style={text}>
            This is a confirmation that the password for your VectorCraft
            account has been changed successfully.
          </Text>

          <Section style={successBox}>
            <Text style={successText}>
              ✓ Your password was updated at{" "}
              {new Date().toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Text>
          </Section>

          <Text style={text}>
            You can now sign in to your account using your new password.
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Sign In to VectorCraft
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>Didn&apos;t change your password?</strong>
            </Text>
            <Text style={warningText}>
              If you didn&apos;t make this change, please contact our support team
              immediately at support@vectorcraft.com or reply to this email.
            </Text>
          </Section>

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

export default PasswordChangedConfirmationEmail;

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

const successBox = {
  backgroundColor: "#d1fae5",
  borderRadius: "8px",
  padding: "16px 24px",
  margin: "24px 40px",
  border: "1px solid #34d399",
};

const successText = {
  color: "#065f46",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const warningBox = {
  backgroundColor: "#fee2e2",
  borderRadius: "8px",
  padding: "16px 24px",
  margin: "24px 40px",
  border: "1px solid #fca5a5",
};

const warningText = {
  color: "#991b1b",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "4px 0",
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

const footer = {
  color: "#737373",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "16px 0",
  padding: "0 40px",
};
