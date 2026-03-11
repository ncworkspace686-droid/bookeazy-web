import Head from 'next/head';

const FONT = "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif";
const C = { primary:'#4338CA', ink:'#18181B', inkMuted:'#71717A', border:'#E4E4E7', bg:'#F4F4F8', surface:'#FFFFFF' };

export default function PrivacyPage() {
  const sections = [
    { title:'Information We Collect', body:`When you book an appointment through a Bokify-powered booking page, we collect your name, phone number, and any optional details you provide (such as email, preferred service, or notes). This information is submitted directly to the business you are booking with.` },
    { title:'How Your Information Is Used', body:`Your details are used solely for the purpose of managing your appointment. The business you book with uses your name and phone number to confirm your booking, send reminders via WhatsApp, and contact you if there are any changes. Bokify facilitates this service but does not independently use your data for any other purpose.` },
    { title:'Data Storage', body:`Your booking information is stored securely in Supabase, a GDPR-compliant cloud database. Data is associated with the specific business you booked with and is not shared across businesses or with any third parties.` },
    { title:'WhatsApp Communications', body:`By booking, you consent to receive WhatsApp messages from the business regarding your appointment (e.g., confirmation, reminders, or rescheduling notices). You may opt out by replying "STOP" to any message.` },
    { title:'Data Retention', body:`Your information is retained for as long as you have a booking history with a business. If you wish to have your data deleted, please contact us at privacy@bokify.in with the subject line "Delete my data" and include the phone number used during booking.` },
    { title:'No Data Selling', body:`We do not sell, rent, or trade your personal data to any third parties under any circumstances.` },
    { title:'Contact', body:`For any privacy-related queries, please reach out to us at privacy@bokify.in. We aim to respond within 48 hours.` },
  ];

  return (
    <>
      <Head>
        <title>Privacy Policy — Bokify</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <style>{`*, *::before, *::after{box-sizing:border-box;margin:0;padding:0} body{margin:0;background:${C.bg};font-family:${FONT};color:${C.ink}}`}</style>
      </Head>
      <div style={{ minHeight:'100vh', background:C.bg, fontFamily:FONT, display:'flex', flexDirection:'column' }}>
        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,#312E81,#4338CA,#6366F1)`, padding:'40px 24px 32px', textAlign:'center' }}>
          <div style={{ maxWidth:640, margin:'0 auto' }}>
            <span style={{ display:'inline-block', background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.2)', borderRadius:20, padding:'4px 14px', fontSize:11, fontWeight:800, color:'rgba(255,255,255,.85)', letterSpacing:'0.5px', marginBottom:14, textTransform:'uppercase' }}>Legal</span>
            <h1 style={{ fontSize:32, fontWeight:800, color:'#fff', letterSpacing:'-0.6px', margin:'0 0 10px', lineHeight:1.15 }}>Privacy Policy</h1>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.7)', fontWeight:500 }}>Last updated: March 2026</p>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, maxWidth:680, margin:'0 auto', width:'100%', padding:'32px 20px 64px' }}>
          <div style={{ background:C.surface, borderRadius:20, border:`1px solid ${C.border}`, boxShadow:'0 4px 24px rgba(67,56,202,.07)', padding:'32px 32px' }}>
            <p style={{ fontSize:14, color:C.inkMuted, lineHeight:1.7, marginBottom:28, paddingBottom:24, borderBottom:`1px solid ${C.border}` }}>
              Bokify provides an online appointment booking platform for small businesses. This policy explains how we handle personal data collected through Bokify-powered booking pages.
            </p>
            {sections.map((s, i) => (
              <div key={i} style={{ marginBottom: i < sections.length-1 ? 28 : 0, paddingBottom: i < sections.length-1 ? 28 : 0, borderBottom: i < sections.length-1 ? `1px solid ${C.border}` : 'none' }}>
                <h2 style={{ fontSize:15, fontWeight:800, color:C.ink, margin:'0 0 10px', letterSpacing:'-0.2px' }}>
                  <span style={{ color:C.primary, marginRight:8 }}>{String(i+1).padStart(2,'0')}.</span>{s.title}
                </h2>
                <p style={{ fontSize:13.5, color:C.inkMuted, lineHeight:1.75, margin:0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ background:`linear-gradient(135deg,#312E81,#4338CA)`, padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'center', gap:12 }}>
          <span style={{ fontSize:13, fontWeight:700, color:'#fff' }}>Bokify ✦</span>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>·</span>
          <a href="/" style={{ fontSize:12, color:'rgba(255,255,255,.7)', fontWeight:600, textDecoration:'none' }}>← Back</a>
          <span style={{ fontSize:11, color:'rgba(255,255,255,.4)' }}>·</span>
          <a href="mailto:privacy@bokify.in" style={{ fontSize:12, color:'rgba(255,255,255,.7)', fontWeight:600, textDecoration:'none' }}>privacy@bokify.in</a>
        </div>
      </div>
    </>
  );
}
