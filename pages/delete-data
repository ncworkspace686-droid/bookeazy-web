import Head from 'next/head';

const FONT = "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif";
const C = {
  primary: '#4338CA',
  primaryLight: '#6366F1',
  ink: '#18181B',
  inkMuted: '#71717A',
  border: '#E4E4E7',
  bg: '#F4F4F8',
  surface: '#FFFFFF',
  success: '#16A34A',
  successBg: '#F0FDF4',
  successBorder: '#BBF7D0',
  warn: '#D97706',
  warnBg: '#FFFBEB',
  warnBorder: '#FDE68A',
};

function Step({ number, title, detail }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
      <div style={{
        flexShrink: 0,
        width: 36, height: 36,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryLight})`,
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800,
      }}>{number}</div>
      <div style={{ paddingTop: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 3 }}>{title}</div>
        {detail && <div style={{ fontSize: 13, color: C.inkMuted, lineHeight: 1.65 }}>{detail}</div>}
      </div>
    </div>
  );
}

function DataRow({ label, action, retention, kept }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 12,
      padding: '12px 16px',
      borderBottom: `1px solid ${C.border}`,
      fontSize: 12.5,
      alignItems: 'start',
    }}>
      <div style={{ fontWeight: 600, color: C.ink }}>{label}</div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        color: action === 'Deleted' ? C.success : C.warn,
        fontWeight: 700,
      }}>
        <span style={{ fontSize: 10 }}>{action === 'Deleted' ? '✓' : '!'}</span>
        {action}
      </div>
      <div style={{ color: C.inkMuted, lineHeight: 1.5 }}>{retention}{kept && <span style={{ display: 'block', color: C.warn, fontWeight: 600, fontSize: 11.5, marginTop: 2 }}>{kept}</span>}</div>
    </div>
  );
}

export default function DeleteDataPage() {
  return (
    <>
      <Head>
        <title>Delete My Data — BookEazy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style>{`*, *::before, *::after{box-sizing:border-box;margin:0;padding:0} body{margin:0;background:${C.bg};font-family:${FONT};color:${C.ink}}`}</style>
      </Head>

      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg,#312E81,#4338CA,#6366F1)`, padding: '40px 24px 32px', textAlign: 'center' }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <span style={{
              display: 'inline-block', background: 'rgba(255,255,255,.12)',
              border: '1px solid rgba(255,255,255,.2)', borderRadius: 20,
              padding: '4px 14px', fontSize: 11, fontWeight: 800,
              color: 'rgba(255,255,255,.85)', letterSpacing: '0.5px', marginBottom: 14, textTransform: 'uppercase'
            }}>BookEazy · Data Rights</span>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-0.6px', margin: '0 0 10px', lineHeight: 1.2 }}>
              Delete My Account &amp; Data
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', fontWeight: 500 }}>
              You have the right to request deletion of your account or personal data at any time.
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, maxWidth: 680, margin: '0 auto', width: '100%', padding: '32px 20px 64px' }}>

          {/* Who this applies to */}
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(67,56,202,.05)' }}>
            <h2 style={{ fontSize: 13, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Who This Page Is For</h2>
            <p style={{ fontSize: 13.5, color: C.inkMuted, lineHeight: 1.7 }}>
              This page serves <strong style={{ color: C.ink }}>two types of users</strong> of the BookEazy app and booking pages:
            </p>
            <ul style={{ marginTop: 10, paddingLeft: 20, fontSize: 13.5, color: C.inkMuted, lineHeight: 1.8 }}>
              <li><strong style={{ color: C.ink }}>Business owners</strong> — who have a BookEazy account (sign-in via Google)</li>
              <li><strong style={{ color: C.ink }}>Customers</strong> — who booked an appointment through a BookEazy-powered booking page</li>
            </ul>
          </div>

          {/* Section A: Business owners */}
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(67,56,202,.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                background: `linear-gradient(135deg,${C.primary},${C.primaryLight})`,
                color: '#fff', borderRadius: 10, padding: '4px 12px',
                fontSize: 11, fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase'
              }}>Business Owner</div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>Delete My Account</h2>
            </div>

            <Step
              number="1"
              title="Open the BookEazy app"
              detail="Launch BookEazy on your Android device and sign in if prompted."
            />
            <Step
              number="2"
              title="Go to Settings → Profile"
              detail="Tap the menu icon, then navigate to Settings and open your Profile section."
            />
            <Step
              number="3"
              title='Tap "Delete Account"'
              detail="Scroll to the bottom and tap Delete Account. You will be asked to confirm."
            />
            <Step
              number="4"
              title="Confirm deletion"
              detail="Tap Confirm Delete. Your account will be scheduled for deletion immediately."
            />

            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginTop: 4 }}>
              <p style={{ fontSize: 12.5, color: '#991B1B', fontWeight: 600, lineHeight: 1.6 }}>
                ⚠️ Alternatively, email <a href="mailto:teambookeazy@gmail.com" style={{ color: '#991B1B' }}>teambookeazy@gmail.com</a> with subject line <em>"Delete My Account"</em> and include your registered email address. We will action within 48 hours.
              </p>
            </div>
          </div>

          {/* Section B: Customers */}
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, padding: '24px', marginBottom: 20, boxShadow: '0 2px 12px rgba(67,56,202,.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                background: `linear-gradient(135deg,#0F766E,#0D9488)`,
                color: '#fff', borderRadius: 10, padding: '4px 12px',
                fontSize: 11, fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase'
              }}>Customer</div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>Delete My Booking Data</h2>
            </div>

            <Step
              number="1"
              title="Send a deletion request email"
              detail={<>Email <a href="mailto:teambookeazy@gmail.com" style={{ color: C.primary, fontWeight: 700 }}>teambookeazy@gmail.com</a> with the subject line <strong>"Delete my data"</strong>.</>}
            />
            <Step
              number="2"
              title="Include your phone number"
              detail="Include the phone number you used when booking your appointment. This allows us to locate and delete your records."
            />
            <Step
              number="3"
              title="Receive confirmation"
              detail="We will confirm deletion via email within 48 hours of receiving your request."
            />
          </div>

          {/* Data table */}
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', marginBottom: 20, boxShadow: '0 2px 12px rgba(67,56,202,.05)' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>What Data Is Deleted vs. Kept</h2>
              <p style={{ fontSize: 12.5, color: C.inkMuted, marginTop: 4 }}>This applies to both account deletion and data deletion requests.</p>
            </div>

            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12, padding: '10px 16px',
              background: C.bg, fontSize: 11, fontWeight: 800,
              color: C.inkMuted, textTransform: 'uppercase', letterSpacing: '0.4px',
            }}>
              <div>Data Type</div>
              <div>Action on Request</div>
              <div>Retention / Notes</div>
            </div>

            <DataRow
              label="Name & phone number (customer)"
              action="Deleted"
              retention="Deleted within 48 hours of request"
            />
            <DataRow
              label="Appointment history (customer)"
              action="Deleted"
              retention="Deleted within 48 hours of request"
            />
            <DataRow
              label="Email address (if provided)"
              action="Deleted"
              retention="Deleted within 48 hours of request"
            />
            <DataRow
              label="Business owner account (Google sign-in)"
              action="Deleted"
              retention="Account and associated business data deleted within 48 hours"
            />
            <DataRow
              label="Business profile, services, slots"
              action="Deleted"
              retention="Deleted with account; no independent copy retained"
            />
            <DataRow
              label="Crash / analytics logs (Firebase)"
              action="Retained"
              retention="Anonymised technical data retained up to 90 days per Firebase policy"
              kept="Does not contain personal or appointment data"
            />
            <DataRow
              label="Auto-deletion (no request needed)"
              action="Deleted"
              retention="All customer booking data auto-deleted 12 months after last appointment"
            />
          </div>

          {/* Contact */}
          <div style={{ background: `linear-gradient(135deg, #EEF2FF, #F5F3FF)`, borderRadius: 16, border: `1px solid #C7D2FE`, padding: '20px 24px' }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: C.primary, marginBottom: 8 }}>Need Help?</h2>
            <p style={{ fontSize: 13.5, color: C.inkMuted, lineHeight: 1.7 }}>
              For any data deletion or privacy request, contact us at:<br />
              <a href="mailto:teambookeazy@gmail.com" style={{ color: C.primary, fontWeight: 700 }}>teambookeazy@gmail.com</a><br />
              <span style={{ fontSize: 12.5 }}>Grievance Officer: SK Chopra · Response within 48 hours</span>
            </p>
            <p style={{ fontSize: 12, color: C.inkMuted, marginTop: 10 }}>
              BookEazy complies with India's DPDPA 2023 and the IT Act 2000. EU/UK users may also raise a complaint with their local data protection authority.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ background: `linear-gradient(135deg,#312E81,#4338CA)`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>BookEazy ✦</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>·</span>
          <a href="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</a>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>·</span>
          <a href="mailto:teambookeazy@gmail.com" style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', fontWeight: 600, textDecoration: 'none' }}>teambookeazy@gmail.com</a>
        </div>
      </div>
    </>
  );
}
