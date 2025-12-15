import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

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
  

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#F5F7FB',
    padding: 45.35, // 16mm
    fontFamily: 'Helvetica',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E6E8EF',
    borderRadius: 20,
    padding: 28,
    marginBottom: 34,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 18,
    borderBottom: '1px solid #EEF2F7',
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    marginRight: 12,
  },
  brandText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#0F172A',
  },
  projectRole: {
    textAlign: 'right',
  },
  projectLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: '#94A3B8',
  },
  projectValue: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#16A34A',
  },
  identityRow: {
    flexDirection: 'row',
    marginTop: 22,
    marginBottom: 18,
  },
  photoBox: {
    width: 110,
    height: 110,
    borderRadius: 16,
    border: '1px solid #E6E8EF',
    backgroundColor: '#F1F5F9',
    marginRight: 22,
  },
  nameAndTitle: {
    flex: 1,
  },
  name: {
    fontSize: 52,
    lineHeight: 1,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  roleTitle: {
    marginTop: 8,
    fontSize: 22,
    lineHeight: 1.2,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#16A34A',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 18,
    borderTop: '1px solid #EEF2F7',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    fontSize: 14,
    color: '#475569',
  },
  contactSeparator: {
    width: 1,
    height: 14,
    backgroundColor: '#EEF2F7',
    marginHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
    paddingTop: 22,
    borderTop: '1px solid #EEF2F7',
  },
  infoColumn: {
    width: '30%',
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    color: '#94A3B8',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: '#94A3B8',
  },
  infoValue: {
    fontSize: 18,
    lineHeight: 1.2,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 10,
  },
  bodyGrid: {
    flexDirection: 'row',
  },
  leftColumn: {
    width: '66%',
    paddingRight: 22,
  },
  rightColumn: {
    width: '34%',
    paddingLeft: 22,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.18em',
    color: '#94A3B8',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginTop: 12,
    marginBottom: 18,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 1.875,
    fontWeight: 'normal',
    color: '#475569',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Removed gap property
  },
  chip: {
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 12,
    marginBottom: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#475569',
  },
  projectsList: {
    marginTop: 34,
  },
  projectItem: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 14,
    marginTop: 6,
  },
  projectText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 1.6,
    fontWeight: 'normal',
    color: '#475569',
  },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 45.35,
    right: 45.35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.22em',
    color: '#CBD5E1',
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

        <View style={styles.identityRow}>
          <View style={styles.photoBox}>
            {photoUrl ? <Image src={photoUrl} /> : null}
          </View>
          <View style={styles.nameAndTitle}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.roleTitle}>{role}</Text>
          </View>
        </View>

        <View style={styles.contactRow}>
          <View style={styles.contactItem}><Text>{email || ''}</Text></View>
          {phone && <><View style={styles.contactSeparator} /><View style={styles.contactItem}><Text>{phone}</Text></View></>}
          {linkedin && <><View style={styles.contactSeparator} /><View style={styles.contactItem}><Text>{linkedin}</Text></View></>}
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <View style={styles.infoLabelRow}>
                <Text style={styles.infoLabel}>COMPENSATION</Text>
            </View>
            <Text style={styles.infoValue}>{formattedCompensation || ''}</Text>
          </View>
          <View style={styles.infoColumn}>
            <View style={styles.infoLabelRow}>
                <Text style={styles.infoLabel}>LANGUAGES</Text>
            </View>
            <Text style={styles.infoValue}>{(Array.isArray(languages) ? languages.join(', ') : languages) || ''}</Text>
          </View>
          <View style={styles.infoColumn}>
            <View style={styles.infoLabelRow}>
                <Text style={styles.infoLabel}>EDUCATION</Text>
            </View>
            <Text style={styles.infoValue}>{(Array.isArray(academicBackground) ? academicBackground.join(', ') : academicBackground) || ''}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bodyGrid}>
        <View style={styles.leftColumn}>
          <Text style={styles.sectionHeading}>PROFESSIONAL BACKGROUND</Text>
          <View style={styles.sectionDivider} />
          <Text style={styles.paragraph}>{professionalBackground || ''}</Text>

          <View style={styles.projectsList}>
            <Text style={[styles.sectionHeading, { color: '#0F172A', fontWeight: 'bold' }]}>MAIN PROJECTS</Text>
            <View style={styles.sectionDivider} />
            {projectsList.map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <View style={styles.bullet} />
                <Text style={styles.projectText}>{project}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.rightColumn}>
          <Text style={styles.sectionHeading}>HARD SKILLS</Text>
          <View style={styles.sectionDivider} />
          <View style={styles.skillsContainer}>
            {skillsList.map((skill, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer} fixed>
        <Text>KAPTAS GLOBAL</Text>
        <Text>CONFIDENTIAL</Text>
      </View>
    </Page>
  </Document>
)};
