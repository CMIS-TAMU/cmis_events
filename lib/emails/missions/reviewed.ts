/**
 * Email template for when a submission is reviewed
 */

interface SubmissionReviewedEmailProps {
  studentName: string;
  mission: {
    id: string;
    title: string;
  };
  score: number;
  pointsAwarded: number;
  totalPoints: number;
  rank: number | null;
  feedback?: string;
  appUrl?: string;
}

export function submissionReviewedEmail({
  studentName,
  mission,
  score,
  pointsAwarded,
  totalPoints,
  rank,
  feedback,
  appUrl = 'http://localhost:3000',
}: SubmissionReviewedEmailProps): string {
  const scoreColor = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
  const isPerfect = score === 100;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Submission Reviewed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">CMIS Technical Challenges</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    ${isPerfect ? `
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
      <h2 style="color: white; margin: 0;">🎉 Perfect Score!</h2>
      <p style="color: white; margin: 10px 0 0 0;">You achieved a perfect score on this challenge!</p>
    </div>
    ` : ''}
    
    <h2 style="color: #333; margin-top: 0;">Your Submission Has Been Reviewed</h2>
    
    <p>Hello ${studentName},</p>
    
    <p>Your submission for <strong>"${mission.title}"</strong> has been reviewed!</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${scoreColor}; margin: 20px 0;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 48px; font-weight: bold; color: ${scoreColor}; margin: 10px 0;">
          ${score}/100
        </div>
        <p style="margin: 5px 0; color: #6b7280;">Score</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
        <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #667eea;">+${pointsAwarded}</div>
          <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Points Awarded</p>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center;">
          <div style="font-size: 24px; font-weight: bold; color: #667eea;">${totalPoints}</div>
          <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Total Points</p>
        </div>
      </div>
      
      ${rank ? `
      <div style="background: #fef3c7; padding: 15px; border-radius: 6px; text-align: center; margin-top: 15px;">
        <div style="font-size: 20px; font-weight: bold; color: #92400e;">Rank #${rank}</div>
        <p style="margin: 5px 0; color: #92400e; font-size: 14px;">Leaderboard Position</p>
      </div>
      ` : ''}
      
      ${feedback ? `
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <h4 style="margin: 0 0 10px 0; color: #333;">Feedback:</h4>
        <p style="margin: 0; color: #6b7280; white-space: pre-wrap;">${feedback}</p>
      </div>
      ` : ''}
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/profile/missions" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        View Submission
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Keep up the great work! 🚀
    </p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
      Best regards,<br>
      CMIS Events Team
    </p>
  </div>
</body>
</html>
  `.trim();
}

