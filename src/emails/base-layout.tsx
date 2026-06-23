import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

type BaseEmailLayoutProps = {
  preview: string;
  title: string;
  children: ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
};

export function BaseEmailLayout({
  preview,
  title,
  children,
  ctaHref,
  ctaLabel,
}: BaseEmailLayoutProps) {
  return (
    <Html lang="th">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>{title}</Heading>
          {children}
          {ctaHref && ctaLabel ? (
            <Link href={ctaHref} style={linkStyle}>
              {ctaLabel}
            </Link>
          ) : null}
          <Text style={footerStyle}>WP ALL — ศูนย์กลางผ้าม่าน</Text>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle = {
  backgroundColor: "#f6f6f6",
  fontFamily: "Inter, Arial, sans-serif",
};

const containerStyle = {
  backgroundColor: "#ffffff",
  margin: "24px auto",
  padding: "24px",
  borderRadius: "8px",
  maxWidth: "560px",
};

const headingStyle = {
  color: "#111827",
  fontSize: "22px",
  marginBottom: "16px",
};

const linkStyle = {
  display: "inline-block",
  marginTop: "16px",
  color: "#2563eb",
};

const footerStyle = {
  color: "#6b7280",
  fontSize: "12px",
  marginTop: "24px",
};

export const emailTextStyle = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
};
