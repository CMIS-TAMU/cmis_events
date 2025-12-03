/**
 * Email template for perfect score achievement
 */

interface PerfectScoreEmailProps {
  studentName: string;
  mission: {
    id: string;
    title: string;
  };
  bonusPoints: number;
  totalPoints: number;
  rank: number | null;
  appUrl?: string;
}

export function perfectScoreEmail({
  studentName,
  mission,
  bonusPoints,
  totalPoints,
  rank,
  appUrl = 'http://localhost:3000',
}: PerfectScoreEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Perfect Score Achievement</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Perfect Score! 🎉</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #333; margin-top: 0; text-align: center;">Congratulations ${studentName}!</h2>
    
    <p style="text-align: center; font-size: 18px; color: #059669;">
      You achieved a <strong>perfect score</strong> on <strong>"${mission.title}"</strong>!
    </p>
    
    <div style="background: white; padding: 30px; border-radius: 8px; border: 2px solid #10b981; margin: 20px 0; text-align: center;">
      <div style="font-size: 64px; margin: 20px 0;">🏆</div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 30px 0;">
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px;">
          <div style="font-size: 32px; font-weight: bold; color: #92400e;">+${bonusPoints}</div>
          <p style="margin: 5px 0; color: #92400e; font-size: 14px;">Bonus Points</p>
        </div>
        <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 8px;">
          <div style="font-size: 32px; font-weight: bold; color: #1e40af;">${totalPoints}</div>
          <p style="margin: 5px 0; color: #1e40af; font-size: 14px;">Total Points</p>
        </div>
      </div>
      
      ${rank ? `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin-top: 15px;">
        <div style="font-size: 28px; font-weight: bold; color: white;">Rank #${rank}</div>
        <p style="margin: 5px 0; color: white; font-size: 14px;">Leaderboard Position</p>
      </div>
      ` : ''}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/profile/missions" 
         style="background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
        View My Submissions
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 16px; margin-top: 30px; text-align: center; font-weight: bold;">
      Keep up the excellent work! 🚀
    </p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px; text-align: center;">
      Best regards,<br>
      CMIS Events Team
    </p>
  </div>
</body>
</html>
  `.trim();
}

