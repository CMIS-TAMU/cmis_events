/**
 * Common technical skills keywords to extract from resumes
 */
const TECHNICAL_SKILLS_KEYWORDS = [
  // Programming Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Rust', 'Swift', 'Kotlin',
  'PHP', 'Ruby', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash', 'PowerShell',
  
  // Web Technologies
  'HTML', 'CSS', 'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask',
  'Spring', 'ASP.NET', 'Laravel', 'Rails', 'jQuery', 'Bootstrap', 'Tailwind', 'SASS', 'SCSS',
  
  // Databases
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite', 'Cassandra', 'DynamoDB',
  'Elasticsearch', 'Neo4j', 'Firebase', 'Supabase',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab',
  'Terraform', 'Ansible', 'Chef', 'Puppet', 'Linux', 'Unix', 'Nginx', 'Apache',
  
  // Data Science & ML
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn',
  'Pandas', 'NumPy', 'Data Analysis', 'Data Visualization', 'Tableau', 'Power BI',
  
  // Mobile
  'React Native', 'Flutter', 'iOS', 'Android', 'Xcode', 'Android Studio',
  
  // Tools & Others
  'Git', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Agile', 'Scrum', 'REST API', 'GraphQL',
  'Microservices', 'API Development', 'Web Services', 'SOAP', 'JSON', 'XML',
  
  // Software Engineering
  'Object-Oriented Programming', 'OOP', 'Design Patterns', 'Test-Driven Development', 'TDD',
  'Unit Testing', 'Integration Testing', 'Software Architecture', 'System Design',
  
  // Other Technical Skills
  'Blockchain', 'Smart Contracts', 'Solidity', 'Web3', 'Cryptocurrency',
  'Cybersecurity', 'Network Security', 'Penetration Testing',
  'Computer Vision', 'NLP', 'Natural Language Processing',
];


/**
 * Extract skills from resume text
 */
export function extractSkillsFromText(text: string): string[] {
  if (!text || text.trim().length === 0) {
    console.log('[extractSkillsFromText] Empty text provided');
    return [];
  }
  
  console.log('[extractSkillsFromText] Processing text, length:', text.length);
  const normalizedText = text.toUpperCase();
  const foundSkills: Set<string> = new Set();
  
  // Check for each keyword (case-insensitive)
  console.log('[extractSkillsFromText] Checking against', TECHNICAL_SKILLS_KEYWORDS.length, 'keywords');
  for (const skill of TECHNICAL_SKILLS_KEYWORDS) {
    const skillUpper = skill.toUpperCase();
    // Match whole words or phrases - escape special regex characters
    const escapedSkill = skillUpper.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    if (regex.test(normalizedText)) {
      foundSkills.add(skill);
      console.log('[extractSkillsFromText] Found skill:', skill);
    }
  }
  
  // Also look for common skill patterns
  // Look for "Skills:" or "Technical Skills:" sections
  const skillsSectionRegex = /(?:SKILLS|TECHNICAL\s+SKILLS|PROGRAMMING\s+LANGUAGES|TECHNOLOGIES|COMPETENCIES|EXPERTISE)[:\s]*([^•\n]+(?:\n[^•\n]+)*)/i;
  const skillsMatch = text.match(skillsSectionRegex);
  
  if (skillsMatch) {
    console.log('[extractSkillsFromText] Found skills section in resume');
    const skillsText = skillsMatch[1];
    // Extract comma, semicolon, pipe, or newline-separated skills
    const extracted = skillsText
      .split(/[,|;•\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 2 && s.length < 50) // Reasonable skill name length
      .filter(s => !/^(and|or|the|a|an|with|using|experience|proficient|familiar)$/i.test(s)); // Filter out common words
    
    extracted.forEach(skill => {
      // Only add if it looks like a skill (contains letters, not just numbers)
      if (/[a-zA-Z]/.test(skill)) {
        foundSkills.add(skill);
        console.log('[extractSkillsFromText] Found skill from section:', skill);
      }
    });
  } else {
    console.log('[extractSkillsFromText] No skills section found in resume');
  }
  
  const result = Array.from(foundSkills).slice(0, 30); // Limit to 30 skills max
  console.log('[extractSkillsFromText] Total skills extracted:', result.length);
  return result;
}


