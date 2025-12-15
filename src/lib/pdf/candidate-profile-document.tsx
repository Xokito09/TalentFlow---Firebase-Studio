import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font, Link } from '@react-pdf/renderer';

// 1) Disable global hyphenation
Font.registerHyphenationCallback((word) => [word]);

// Define Props interface based on CandidateReportPageProps
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
}

const normalizeToArray = (value?: string | string[]): string[] => {
    if (!value) return [];
    const items = Array.isArray(value) ? value : [value];
    return items
      .flatMap(item => String(item).split('\n'))
      .map(part => part.trim().replace(/^[•\-●]\s*/, '').trim())
      .filter(part => part.length > 0);
  };
  
// Helpers for unit conversion
const PT_PER_MM = 72 / 25.4;
const mm = (v: number) => v * PT_PER_MM;

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F5F7FB',
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 36,
    paddingRight: 36,
    fontFamily: 'Helvetica',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E6E8EF',
    borderStyle: 'solid',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEF2F7',
    borderBottomStyle: 'solid',
    paddingBottom: 14,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    marginRight: 10,
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
    marginBottom: 20,
  },
  photoBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E8EF',
    borderStyle: 'solid',
    backgroundColor: '#F1F5F9',
    marginRight: 20,
    overflow: 'hidden',
  },
  nameAndTitle: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 28,
    lineHeight: 1.2,
    fontWeight: 'bold',
    color: '#0F172A',
    textTransform: 'uppercase',
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
    marginTop: 10,
    flexWrap: 'wrap',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 9,
    color: '#64748B',
    marginRight: 12,
  },
  contactIcon: {
    width: 10,
    height: 10,
    marginRight: 4,
  },
  infoRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#EEF2F7',
    borderTopStyle: 'solid',
    paddingTop: 16,
  },
  infoColumn: {
    flexGrow: 1,
    flexBasis: 0,
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  bodyGrid: {
    flexDirection: 'row',
    marginTop: 8,
  },
  leftColumn: {
    width: '72%',
    paddingRight: 24,
  },
  rightColumn: {
    width: '28%',
  },
  sectionHeading: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#334155',
    marginBottom: 16,
    textAlign: 'justify',
  },
  projectsList: {
    marginTop: 8,
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
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#E2E8F0',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export const CandidateProfileDocument: React.FC<CandidateProfileDocumentProps> = (props) => {
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
      } = props;
    
      const skillsList = normalizeToArray(hardSkills);
      const projectsList = normalizeToArray(mainProjects);
    
      const formattedCompensation = (compensation || '').toLowerCase().includes('monthly')
        ? compensation
        : `USD ${compensation} monthly`;
    

  return(
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.headerCard} wrap={false}>
        {/* Brand Row */}
        <View style={styles.brandRow}>
          <View style={styles.brandLeft}>
            <View style={styles.logoBox} />
            <Text style={styles.brandText}>KAPTAS GLOBAL</Text>
          </View>
          <View style={styles.projectRole}>
            <Text style={styles.projectLabel}>PROJECT ROLE:</Text>
            <Text style={styles.projectValue}>{projectRole}</Text>
          </View>
        </View>

        {/* Identity Row */}
        <View style={styles.identityRow}>
          <View style={styles.photoBox}>
            {photoUrl ? <Image src={photoUrl} style={{width: 80, height: 80}} /> : null}
          </View>
          <View style={styles.nameAndTitle}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.roleTitle}>{role}</Text>
            
            <View style={styles.contactRow}>
              {linkedin && (
                <Link src={linkedin} style={[styles.contactItem, {color: '#2563EB', textDecoration: 'none'}]}>
                  {linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                </Link>
              )}
              {linkedin && (email || phone) && <Text style={styles.contactItem}>   |   </Text>}
              
              <Text style={styles.contactItem}>{email}</Text>
              
              {phone && <Text style={styles.contactItem}>   |   {phone}</Text>}
            </View>
          </View>
        </View>

        {/* Info Row */}
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
        {/* Left Column: Background & Projects */}
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

        {/* Right Column: Skills */}
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

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>KAPTAS GLOBAL</Text>
        <Text style={styles.footerText}>CONFIDENTIAL</Text>
      </View>
    </Page>
  </Document>
)};
