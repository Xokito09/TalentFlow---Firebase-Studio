import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font, Link } from '@react-pdf/renderer';

Font.registerHyphenationCallback((word) => [word]);

interface CandidateProfileDocumentProps {
  name: string;
  role: string;
  email: string;
  phone?: string;
  linkedin?: string;
  projectRole: string;
  compensation?: string;
  academicBackground?: string | string[];
  languages?: string[] | string;
  professionalBackground?: string;
  mainProjects?: string[] | string;
  hardSkills?: string[] | string;
  photoUrl?: string;
  photoThumbUrl?: string; // Added for fallback
}

const normalizeToArray = (value?: string | string[]): string[] => {
    if (!value) return [];
    const items = Array.isArray(value) ? value : [value];
    return items
      .flatMap(item => String(item).split('\n'))
      .map(part => part.trim().replace(/^[•\-●]\s*/, '').trim())
      .filter(part => part.length > 0);
  };

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  content: {
    margin: 36,
  },
  headerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  brandText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#0F172A',
  },
  projectRole: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  projectLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.0,
    color: '#94A3B8',
    marginRight: 6,
  },
  projectValue: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#16A34A',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  photoBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    marginRight: 20,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  nameAndTitle: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    lineHeight: 1.2,
    fontWeight: 'bold',
    color: '#0F172A',
    textTransform: 'capitalize',
    letterSpacing: -0.5,
  },
  roleTitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16A34A',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    flexWrap: 'wrap',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 9,
    color: '#64748B',
    marginRight: 12,
    textDecoration: 'none',
  },
  infoRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 20,
    paddingTop: 16,
  },
  infoColumn: {
    flexGrow: 1,
    flexBasis: 0,
    paddingRight: 12, 
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  bodyGrid: {
    flexDirection: 'row',
  },
  leftColumn: {
    width: '68%',
    paddingRight: 24,
  },
  rightColumn: {
    width: '32%',
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#334155',
    marginBottom: 16,
    textAlign: 'justify',
  },
  projectsList: {
    marginTop: 4,
  },
  projectItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#16A34A',
    marginTop: 5,
    marginRight: 8,
  },
  projectText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
    color: '#334155',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#475569',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

const PdfLogo = () => (
    <View style={styles.logoBox}>
         <Text style={styles.logoLetter}>K</Text>
    </View>
);

export const CandidateProfilePage: React.FC<CandidateProfileDocumentProps> = (props) => {
    const {
        name,
        role,
        email,
        phone,
        linkedin,
        projectRole,
        compensation,
        academicBackground,
        languages,
        professionalBackground,
        mainProjects,
        hardSkills,
        photoUrl,
        photoThumbUrl,
      } = props;
    
      const skillsList = normalizeToArray(hardSkills);
      const projectsList = normalizeToArray(mainProjects);
    
      const formattedCompensation = (compensation || '').toLowerCase().includes('monthly')
        ? compensation
        : `USD ${compensation} monthly`;
    
      const imageSrc = photoUrl || photoThumbUrl;

  return (
    <Page size="A4" style={styles.page}>
     <View style={styles.content}>
        <View style={styles.headerCard} wrap={false}>
            <View style={styles.brandRow}>
            <View style={styles.brandLeft}>
                <PdfLogo />
                <Text style={styles.brandText}>KAPTAS GLOBAL</Text>
            </View>
            <View style={styles.projectRole}>
                <Text style={styles.projectLabel}>PROJECT ROLE:</Text>
                <Text style={styles.projectValue}>{projectRole}</Text>
            </View>
            </View>

            <View style={styles.identityRow}>
            <View style={styles.photoBox}>
                {imageSrc && <Image src={imageSrc} style={styles.photo} />}
            </View>
            <View style={styles.nameAndTitle}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.roleTitle}>{role}</Text>
                
                <View style={styles.contactRow}>
                    {linkedin && (
                        <Link src={linkedin} style={[styles.contactItem, {color: '#2563EB'}]}>
                        {linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                        </Link>
                    )}
                    {linkedin && (email || phone) && <Text style={styles.contactItem}> | </Text>}
                    <Text style={styles.contactItem}>{email}</Text>
                    {phone && <Text style={styles.contactItem}> | {phone}</Text>}
                </View>
            </View>
            </View>

            <View style={styles.infoRow}>
            <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>COMPENSATION</Text>
                <Text style={styles.infoValue}>{formattedCompensation || '-'}</Text>
            </View>
            <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>LANGUAGES</Text>
                <Text style={styles.infoValue}>{(Array.isArray(languages) ? languages.join(', ') : languages) || '-'}</Text>
            </View>
            <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>EDUCATION</Text>
                <Text style={styles.infoValue}>{(Array.isArray(academicBackground) ? academicBackground.join(', ') : academicBackground) || '-'}</Text>
            </View>
            </View>
        </View>

        <View style={styles.bodyGrid}>
            <View style={styles.leftColumn}>
            <Text style={styles.sectionHeading}>PROFESSIONAL BACKGROUND</Text>
            <Text style={styles.paragraph}>{professionalBackground || ''}</Text>

            <Text style={styles.sectionHeading}>MAIN PROJECTS</Text>
            <View style={styles.projectsList}>
                {projectsList.map((project, index) => (
                <View key={index} style={styles.projectItem} wrap={false}>
                    <View style={styles.bullet} />
                    <Text style={styles.projectText}>{project}</Text>
                </View>
                ))}
            </View>
            </View>

            <View style={styles.rightColumn}>
            <Text style={styles.sectionHeading}>HARD SKILLS</Text>
            <View style={styles.skillsContainer}>
                {skillsList.map((skill, index) => (
                <View key={index} style={styles.chip} wrap={false}>
                    <Text style={styles.chipText}>{skill}</Text>
                </View>
                ))}
            </View>
            </View>
        </View>
     </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>KAPTAS GLOBAL</Text>
        <Text style={styles.footerText}>CONFIDENTIAL</Text>
      </View>
    </Page>
  );
};

export const CandidateProfileDocument: React.FC<CandidateProfileDocumentProps> = (props) => {
  return(
  <Document>
    <CandidateProfilePage {...props} />
  </Document>
)};
