export const getShareNoteEmailTemplate = (
  receiverName: string,
  senderName: string,
  noteTitle: string,
  noteContent: string,
  noteColor: string = "#FEC700"
) => {
  const preview =
    noteContent.length > 180
      ? noteContent.substring(0, 180) + "..."
      : noteContent;

  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <style>

    body{
      margin:0;
      padding:30px 15px;
      background:#f8fafc;
      font-family:'Segoe UI',sans-serif;
      color:#0f172a;
    }

    .wrapper{
      max-width:640px;
      margin:auto;
      background:#ffffff;
      border-radius:28px;
      overflow:hidden;

      border:1px solid #e2e8f0;

      box-shadow:
        0 20px 50px rgba(0,0,0,0.08),
        0 8px 20px rgba(0,0,0,0.05);
    }

    /* ================= HEADER ================= */

    .header{
      position:relative;
      overflow:hidden;
      padding:55px 30px 120px;
      text-align:center;

      background:
        linear-gradient(
          135deg,
          #02462E 0%,
          #013220 100%
        );
    }

    .header::before{
      content:'';
      position:absolute;
      width:300px;
      height:300px;
      background:rgba(255,255,255,0.05);
      border-radius:50%;
      top:-120px;
      left:-100px;
    }

    .header::after{
      content:'';
      position:absolute;
      width:240px;
      height:240px;
      background:rgba(254,199,0,0.08);
      border-radius:50%;
      bottom:-120px;
      right:-80px;
    }

    .logo{
      width:90px;
      height:90px;
      margin:auto;

      border-radius:24px;

      background:
        linear-gradient(
          135deg,
          #FEC700,
          #ffdf5d
        );

      display:flex;
      align-items:center;
      justify-content:center;

      font-size:42px;

      box-shadow:
        0 15px 30px rgba(0,0,0,0.25);

      animation:float 4s ease-in-out infinite;
    }

    @keyframes float{
      0%{
        transform:translateY(0px);
      }

      50%{
        transform:translateY(-8px);
      }

      100%{
        transform:translateY(0px);
      }
    }

    .header h1{
      color:white;
      margin-top:20px;
      margin-bottom:10px;

      font-size:36px;
      font-weight:700;
      letter-spacing:0.5px;
    }

    .header p{
      color:rgba(255,255,255,0.85);
      margin:0;
      font-size:15px;
      line-height:1.7;
    }

    /* ================= ILLUSTRATION ================= */

    .illustration-wrapper{
      position:relative;
      margin-top:-80px;
      padding:0 25px;
    }

    .illustration{
      background:#ffffff;
      border-radius:28px;
      padding:35px;
      text-align:center;

      box-shadow:
        0 20px 40px rgba(0,0,0,0.08);
    }

    .sticky-stack{
      position:relative;
      width:220px;
      height:160px;
      margin:auto;
    }

    .sticky{
      position:absolute;
      width:160px;
      height:120px;
      border-radius:18px;

      box-shadow:
        0 12px 25px rgba(0,0,0,0.12);
    }

    .sticky.one{
      background:#fca5a5;
      transform:rotate(-10deg);
      top:20px;
      left:0;
    }

    .sticky.two{
      background:#93c5fd;
      transform:rotate(8deg);
      top:10px;
      right:0;
    }

    .sticky.three{
      background:${noteColor};
      transform:rotate(-2deg);
      top:35px;
      left:30px;
      z-index:2;
      padding:20px;
      box-sizing:border-box;
    }

    .line{
      height:8px;
      background:rgba(0,0,0,0.12);
      border-radius:999px;
      margin-bottom:12px;
    }

    /* ================= CONTENT ================= */

    .content{
      padding:45px 38px;
    }

    .badge{
      display:inline-block;

      padding:8px 18px;
      border-radius:999px;

      background:rgba(254,199,0,0.15);

      color:#02462E;

      font-size:13px;
      font-weight:700;

      margin-bottom:24px;
    }

    .content h2{
      margin-top:0;
      color:#02462E;
      font-size:28px;
      margin-bottom:20px;
    }

    .content p{
      font-size:16px;
      line-height:1.8;
      color:#475569;
    }

    /* ================= NOTE CARD ================= */

    .note-card{
      margin:35px 0;

      background:${noteColor};

      border-radius:24px;
      padding:30px;

      position:relative;
      overflow:hidden;

      transform:rotate(-1deg);

      box-shadow:
        0 15px 35px rgba(0,0,0,0.12);
    }

    .note-card::before{
      content:'';

      position:absolute;

      width:80px;
      height:18px;

      background:rgba(255,255,255,0.45);

      top:15px;
      right:20px;

      border-radius:10px;

      transform:rotate(10deg);
    }

    .note-title{
      margin:0 0 15px;

      font-size:24px;
      font-weight:700;

      color:#111827;
    }

    .note-preview{
      white-space:pre-wrap;

      font-size:15px;
      line-height:1.9;

      color:#1e293b;
    }

    /* ================= URGENCY BOX ================= */

    .info-box{
      margin-top:30px;

      padding:24px;

      border-radius:22px;

      background:
        linear-gradient(
          135deg,
          rgba(254,199,0,0.12),
          rgba(2,70,46,0.06)
        );

      border:1px solid rgba(2,70,46,0.08);
    }

    .info-box h3{
      margin-top:0;
      margin-bottom:12px;

      font-size:22px;

      color:#02462E;
    }

    .info-box p{
      margin:0;

      font-size:16px;
      line-height:1.9;

      color:#334155;
    }

    .features{
      margin-top:18px;

      font-size:14px;
      color:#475569;

      line-height:2;
    }

    /* ================= BUTTON ================= */

    .cta-wrapper{
      text-align:center;
      margin-top:40px;
    }

    .btn{
      display:inline-block;

      padding:18px 34px;

      border-radius:18px;

      text-decoration:none;

      color:white !important;

      font-weight:700;
      font-size:16px;

      background:
        linear-gradient(
          135deg,
          #02462E,
          #046c48
        );

      box-shadow:
        0 15px 30px rgba(2,70,46,0.25);

      transition:all .3s ease;
    }

    .btn:hover{
      transform:translateY(-3px);
    }

    /* ================= FOOTER ================= */

    .footer{
      padding:28px;

      text-align:center;

      background:#f8fafc;

      border-top:1px solid #e2e8f0;
    }

    .footer p{
      margin:5px 0;

      color:#64748b;

      font-size:13px;
    }

    /* ================= MOBILE ================= */

    @media only screen and (max-width:600px){

      .content{
        padding:35px 22px;
      }

      .header{
        padding:45px 20px 110px;
      }

      .header h1{
        font-size:28px;
      }

      .illustration{
        padding:20px;
      }

      .sticky-stack{
        transform:scale(.85);
      }

      .content h2{
        font-size:24px;
      }

      .note-title{
        font-size:20px;
      }

    }

  </style>
</head>

<body>

<div class="wrapper">

  <!-- HEADER -->

  <div class="header">

    <div class="logo">
      📝
    </div>

    <h1>Sticky Notes</h1>

    <p>
      Collaborate beautifully, organize instantly,
      and never lose an important idea.
    </p>

  </div>

  <!-- ILLUSTRATION -->

  <div class="illustration-wrapper">

    <div class="illustration">

      <div class="sticky-stack">

        <div class="sticky one"></div>

        <div class="sticky two"></div>

        <div class="sticky three">

          <div class="line"></div>
          <div class="line" style="width:70%"></div>
          <div class="line" style="width:90%"></div>

        </div>

      </div>

    </div>

  </div>

  <!-- CONTENT -->

  <div class="content">

    <div class="badge">
      ✨ New Shared Note
    </div>

    <h2>
      Hi ${receiverName} 👋
    </h2>

    <p>
      <strong>${senderName}</strong> shared a beautiful sticky note
      with you on <strong>Sticky Notes</strong>.
    </p>

    <!-- NOTE -->

    <div class="note-card">

      <h3 class="note-title">
        ${noteTitle}
      </h3>

      <div class="note-preview">
        ${preview}
      </div>

    </div>

    <!-- URGENCY SECTION -->

    <div class="info-box">

      <h3>
        🚀 Your note is waiting...
      </h3>

      <p>
        This shared note may contain important ideas,
        updates, tasks, or collaboration details from
        <strong>${senderName}</strong>.
        <br /><br />

        Open it now to collaborate in real-time,
        reply instantly, and never miss an important update.
      </p>

      <div class="features">
        ⚡ Instant access <br/>
        🤝 Real-time collaboration <br/>
        🔒 Secure workspace
      </div>

    </div>

    <!-- BUTTON -->

    <div class="cta-wrapper">

      <a
        href="${process.env.CLIENT_URL}/board/shared"
        class="btn"
      >
        See What ${senderName} Shared 👀
      </a>

    </div>

  </div>

  <!-- FOOTER -->

  <div class="footer">

    <p>
      This is an automated email from Sticky Notes. Developed by ❤️ Ratnesh
    </p>

    <p>
      © 2026 Sticky Notes — Designed for productivity.
    </p>

  </div>

</div>

</body>
</html>
`;
};

export const getForgotPasswordEmailTemplate = (
  receiverName: string,
  resetUrl: string
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body {
      margin: 0;
      padding: 30px 15px;
      background: #f8fafc;
      font-family: 'Segoe UI', sans-serif;
      color: #0f172a;
    }
    .wrapper {
      max-width: 640px;
      margin: auto;
      background: #ffffff;
      border-radius: 28px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 20px 50px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.05);
    }
    .header {
      position: relative;
      overflow: hidden;
      padding: 55px 30px 80px;
      text-align: center;
      background: linear-gradient(135deg, #02462E 0%, #013220 100%);
    }
    .header::before {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      background: rgba(255,255,255,0.05);
      border-radius: 50%;
      top: -120px;
      left: -100px;
    }
    .header::after {
      content: '';
      position: absolute;
      width: 240px;
      height: 240px;
      background: rgba(254,199,0,0.08);
      border-radius: 50%;
      bottom: -120px;
      right: -80px;
    }
    .logo {
      width: 90px;
      height: 90px;
      margin: auto;
      border-radius: 24px;
      background: linear-gradient(135deg, #FEC700, #ffdf5d);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 42px;
      box-shadow: 0 15px 30px rgba(0,0,0,0.25);
      animation: float 4s ease-in-out infinite;
    }
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
      100% { transform: translateY(0px); }
    }
    .header h1 {
      color: white;
      margin-top: 20px;
      margin-bottom: 10px;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 45px 38px;
    }
    .badge {
      display: inline-block;
      padding: 8px 18px;
      border-radius: 999px;
      background: rgba(254,199,0,0.15);
      color: #02462E;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 24px;
    }
    .content h2 {
      margin-top: 0;
      color: #02462E;
      font-size: 28px;
      margin-bottom: 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.8;
      color: #475569;
    }
    .info-box {
      margin-top: 30px;
      padding: 24px;
      border-radius: 22px;
      background: linear-gradient(135deg, rgba(254,199,0,0.12), rgba(2,70,46,0.06));
      border: 1px solid rgba(2,70,46,0.08);
    }
    .info-box h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 22px;
      color: #02462E;
    }
    .info-box p {
      margin: 0;
      font-size: 16px;
      line-height: 1.9;
      color: #334155;
    }
    .cta-wrapper {
      text-align: center;
      margin-top: 40px;
    }
    .btn {
      display: inline-block;
      padding: 18px 34px;
      border-radius: 18px;
      text-decoration: none;
      color: white !important;
      font-weight: 700;
      font-size: 16px;
      background: linear-gradient(135deg, #02462E, #046c48);
      box-shadow: 0 15px 30px rgba(2,70,46,0.25);
      transition: all .3s ease;
    }
    .btn:hover {
      transform: translateY(-3px);
    }
    .footer {
      padding: 28px;
      text-align: center;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 5px 0;
      color: #64748b;
      font-size: 13px;
    }
    .warning-text {
      font-size: 13px;
      color: #6b7280;
      margin-top: 30px;
      text-align: center;
    }
    @media only screen and (max-width: 600px) {
      .content { padding: 35px 22px; }
      .header { padding: 45px 20px 80px; }
      .header h1 { font-size: 28px; }
      .content h2 { font-size: 24px; }
    }
  </style>
</head>
<body>
<div class="wrapper">
  <!-- HEADER -->
  <div class="header">
    <div class="logo">🔐</div>
    <h1>Password Reset</h1>
  </div>
  <!-- CONTENT -->
  <div class="content">
    <div class="badge">⚠️ Security Alert</div>
    <h2>Hi ${receiverName} 👋</h2>
    <p>We received a request to reset the password for your Sticky Notes account.</p>
    
    <div class="info-box">
      <h3>Need a new password?</h3>
      <p>No problem! Click the button below to securely reset your password. Please note that this link is only valid for <strong>10 minutes</strong>.</p>
    </div>
    
    <div class="cta-wrapper">
      <a href="${resetUrl}" class="btn">Reset My Password</a>
    </div>
    
    <p class="warning-text">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  </div>
  <!-- FOOTER -->
  <div class="footer">
    <p>This is an automated email from Sticky Notes. Developed by ❤️ Ratnesh</p>
    <p>© 2026 Sticky Notes — Designed for productivity.</p>
  </div>
</div>
</body>
</html>
  `;
};

export const getShareBoardEmailTemplate = (
  receiverName: string,
  senderName: string,
  boardName: string,
  boardEmoji: string,
  boardId: string
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin: 0; padding: 30px 15px; background: #f8fafc; font-family: 'Segoe UI', sans-serif; color: #0f172a; }
    .wrapper { max-width: 640px; margin: auto; background: #ffffff; border-radius: 28px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 50px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.05); }
    .header { position: relative; overflow: hidden; padding: 55px 30px 120px; text-align: center; background: linear-gradient(135deg, #02462E 0%, #013220 100%); }
    .header::before { content: ''; position: absolute; width: 300px; height: 300px; background: rgba(255,255,255,0.05); border-radius: 50%; top: -120px; left: -100px; }
    .header::after { content: ''; position: absolute; width: 240px; height: 240px; background: rgba(254,199,0,0.08); border-radius: 50%; bottom: -120px; right: -80px; }
    .logo { width: 90px; height: 90px; margin: auto; border-radius: 24px; background: linear-gradient(135deg, #FEC700, #ffdf5d); display: flex; align-items: center; justify-content: center; font-size: 42px; box-shadow: 0 15px 30px rgba(0,0,0,0.25); animation: float 4s ease-in-out infinite; }
    @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
    .header h1 { color: white; margin-top: 20px; margin-bottom: 10px; font-size: 36px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: white; font-size: 18px; }
    .content { padding: 45px 38px; }
    .badge { display: inline-block; padding: 8px 18px; border-radius: 999px; background: rgba(254,199,0,0.15); color: #02462E; font-size: 13px; font-weight: 700; margin-bottom: 24px; }
    .content h2 { margin-top: 0; color: #02462E; font-size: 28px; margin-bottom: 20px; }
    .content p { font-size: 16px; line-height: 1.8; color: #475569; }
    .board-card { margin: 35px 0; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 24px; padding: 30px; text-align: center; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .board-emoji { font-size: 48px; margin-bottom: 15px; }
    .board-name { font-size: 24px; font-weight: 700; color: #111827; margin: 0; }
    .info-box { margin-top: 30px; padding: 24px; border-radius: 22px; background: linear-gradient(135deg, rgba(254,199,0,0.12), rgba(2,70,46,0.06)); border: 1px solid rgba(2,70,46,0.08); }
    .info-box h3 { margin-top: 0; margin-bottom: 12px; font-size: 22px; color: #02462E; }
    .info-box p { margin: 0; font-size: 16px; line-height: 1.9; color: #334155; }
    .cta-wrapper { text-align: center; margin-top: 40px; }
    .btn { display: inline-block; padding: 18px 34px; border-radius: 18px; text-decoration: none; color: white !important; font-weight: 700; font-size: 16px; background: linear-gradient(135deg, #02462E, #046c48); box-shadow: 0 15px 30px rgba(2,70,46,0.25); transition: all .3s ease; }
    .btn:hover { transform: translateY(-3px); }
    .footer { padding: 28px; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 5px 0; color: #64748b; font-size: 13px; }
    @media only screen and (max-width: 600px) { .content { padding: 35px 22px; } .header { padding: 45px 20px 110px; } .header h1 { font-size: 28px; } .content h2 { font-size: 24px; } }
  </style>
</head>
<body>
<div class="wrapper">
  <!-- HEADER -->
  <div class="header">
    <div class="logo">📋</div>
    <h1>Sticky Notes</h1>
    <p>Collaborate beautifully, organize instantly.</p>
  </div>
  <!-- CONTENT -->
  <div class="content">
    <div class="badge">✨ New Shared Board</div>
    <h2>Hi ${receiverName} 👋</h2>
    <p><strong>${senderName}</strong> invited you to collaborate on a board in <strong>Sticky Notes</strong>.</p>
    
    <!-- BOARD CARD -->
    <div class="board-card">
      <div class="board-emoji">${boardEmoji}</div>
      <h3 class="board-name">${boardName}</h3>
    </div>
    <!-- URGENCY SECTION -->
    <div class="info-box">
      <h3>🚀 You have full access!</h3>
      <p>By joining this board, you'll be able to view all notes, add new ones, and collaborate in real-time with <strong>${senderName}</strong>.</p>
    </div>
    <!-- BUTTON -->
    <div class="cta-wrapper">
      <a href="${process.env.CLIENT_URL}/board?boardId=${boardId}" class="btn">Open Shared Board 👀</a>
    </div>
  </div>
  <!-- FOOTER -->
  <div class="footer">
    <p>This is an automated email from Sticky Notes. Developed by ❤️ Ratnesh</p>
    <p>© 2026 Sticky Notes — Designed for productivity.</p>
  </div>
</div>
</body>
</html>
  `;
};