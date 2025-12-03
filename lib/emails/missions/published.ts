/**
 * Email template for when a mission is published
 */

interface MissionPublishedEmailProps {
  studentName: string;
  mission: {
    id: string;
    title: string;
    difficulty: string;
    category?: string;
    max_points: number;
  };
  appUrl?: string;
}

export function missionPublishedEmail({
  studentName,
  mission,
  appUrl = 'http://localhost:3000',
}: MissionPublishedEmailProps): string {
  const difficultyColors: Record<string, string> = {
    beginner: '#10b981',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
    expert: '#8b5cf6',
  };

  const difficultyColor = difficultyColors[mission.difficulty] || '#6b7280';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Technical Challenge</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">CMIS Technical Challenges</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
    <h2 style="color: #333; margin-top: 0;">New Technical Challenge Available!</h2>
    
    <p>Hello ${studentName},</p>
    
    <p>A new technical challenge has been published that might interest you!</p>
    
    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${difficultyColor}; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #333;">${mission.title}</h3>
      
      <div style="display: flex; gap: 15px; margin: 15px 0; flex-wrap: wrap;">
        <span style="background: ${difficultyColor}; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; text-transform: capitalize;">
          ${mission.difficulty}
        </span>
        ${mission.category ? `
        <span style="background: #e5e7eb; color: #374151; padding: 5px 12px; border-radius: 20px; font-size: 12px;">
          ${mission.category}
        </span>
        ` : ''}
        <span style="background: #fef3c7; color: #92400e; padding: 5px 12px; border-radius: 20px; font-size: 12px;">
          ⭐ Up to ${mission.max_points} points
        </span>
      </div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${appUrl}/missions/${mission.id}" 
         style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
        View Challenge
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Good luck! 🚀
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

