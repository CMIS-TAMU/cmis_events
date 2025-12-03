/**
 * Email template for when a sponsor receives a new submission
 */

interface SubmissionReceivedEmailProps {
  sponsorName: string;
  mission: {
    id: string;
    title: string;
  };
  student: {
    name: string;
    email: string;
  };
  submissionId: string;
  appUrl?: string;
}

export function submissionReceivedEmail({
  sponsorName,
  mission,
  student,
  submissionId,
  appUrl = 'http://localhost:3000',
}: SubmissionReceivedEmailProps): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Submission Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">CMIS Technical Challenges</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #333; margin-top: 0;">New Submission Received</h2>
    
    <p>Hello ${sponsorName},</p>
    
    <p>You have received a new submission for your technical challenge!</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #333;">${mission.title}</h3>
      
      <div style="margin: 15px 0;">
        <p style="margin: 5px 0;"><strong>Student:</strong> ${student.name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${student.email}</p>
        <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/sponsor/missions/${mission.id}/submissions/${submissionId}" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        Review Submission
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Best regards,<br>
      CMIS Events Team
    </p>
  </div>
</body>
</html>
  `.trim();
}

