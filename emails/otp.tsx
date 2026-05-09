import { Body, Container, Head, Heading, Html, Section, Text } from '@react-email/components'
import type { ReactElement } from 'react'

interface OTPEmailProps {
  otpCode: string
  title: string
}

export const OTPEmail = ({ otpCode, title }: OTPEmailProps): ReactElement => (
  <Html>
    <Head>
      <title>{title}</title>
    </Head>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>CARTLY</Heading>
        <Text style={tertiary}>Verification code</Text>
        <Heading style={secondary}>Enter the code below to complete verification</Heading>
        <Section style={codeContainer}>
          <Text style={code}>{otpCode}</Text>
        </Section>
        <Text style={paragraph}>
          This code is valid for a few minutes. If you did not request this, please ignore this email.
        </Text>
      </Container>
      <Text style={footer}>© Cartly · Ecommerce</Text>
    </Body>
  </Html>
)

OTPEmail.PreviewProps = {
  otpCode: '144833',
  title: 'OTP - Cartly',
} as OTPEmailProps

export default OTPEmail

const main = {
  backgroundColor: '#f6f8fb',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '12px',
  boxShadow: '0 5px 10px rgba(20,50,70,.08)',
  marginTop: '32px',
  maxWidth: '420px',
  margin: '0 auto',
  padding: '48px 24px 56px',
}

const brand = {
  color: '#111827',
  fontSize: '22px',
  fontWeight: 800,
  letterSpacing: '4px',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
  fontFamily: 'HelveticaNeue-Bold,Helvetica,Arial,sans-serif',
}

const tertiary = {
  color: '#0a85ea',
  fontSize: '11px',
  fontWeight: 700,
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  height: '16px',
  letterSpacing: '0',
  lineHeight: '16px',
  margin: '16px 8px 8px 8px',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
}

const secondary = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
  fontSize: '20px',
  fontWeight: 500,
  lineHeight: '24px',
  marginBottom: '0',
  marginTop: '0',
  textAlign: 'center' as const,
}

const codeContainer = {
  background: 'rgba(0,0,0,.05)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '280px',
}

const code = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Bold',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  paddingBottom: '8px',
  paddingTop: '8px',
  margin: '0 auto',
  width: '100%',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#444',
  fontSize: '15px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 24px',
  margin: '0',
  textAlign: 'center' as const,
}

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0',
  lineHeight: '23px',
  margin: '0',
  marginTop: '20px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  textAlign: 'center' as const,
}
