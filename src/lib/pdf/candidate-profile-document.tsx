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
  photoDataUrl?: string | null;
  pageNumber?: number;
}

const normalizeToArray = (value?: string | string[]): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(/, |; | and /).map((s) => s.trim());
  return [];
};

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
        photoDataUrl,
      } = props;
    
      const skillsList = normalizeToArray(hardSkills);
      const academicList = normalizeToArray(academicBackground);
      const languagesList = normalizeToArray(languages);
      const projectsList = normalizeToArray(mainProjects);
    
      const formattedCompensation = (compensation || '').toLowerCase().includes('monthly')
        ? compensation
        : `USD ${compensation} monthly`;
    
      const imageSrc = photoDataUrl;

  return (
    <Page size="A4" style={styles.page}>
        <View style={styles.container}>
            <View style={styles.header} fixed>
                <Text style={styles.headerText}>TalentFlow</Text>
            </View>

            <View style={styles.identityRow}>
            <View style={styles.photoBox}>
                {imageSrc && <Image src={imageSrc} style={styles.photo} />}
            </View>
            <View style={styles.nameAndTitle}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.title}>{role}</Text>
                <Link src={`mailto:${email}`} style={styles.link}>{email}</Link>
                {phone && <Text style={styles.contactInfo}>{phone}</Text>}
                {linkedin && <Link src={linkedin} style={styles.link}>{linkedin}</Link>}
            </View>
            </View>

            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Role</Text>
            <Text style={styles.text}>{projectRole}</Text>
            </View>

            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compensation</Text>
            <Text style={styles.text}>{formattedCompensation}</Text>
            </View>

            <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Background</Text>
            <Text style={styles.text}>{professionalBackground}</Text>
            </View>

            {academicList.length > 0 && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Academic Background</Text>
                {academicList.map((item, index) => (
                <Text key={index} style={styles.listItem}>- {item}</Text>
                ))}
            </View>
            )}

            {projectsList.length > 0 && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Main Projects</Text>
                {projectsList.map((item, index) => (
                <Text key={index} style={styles.listItem}>- {item}</Text>
                ))}
            </View>
            )}

            {skillsList.length > 0 && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hard Skills</Text>
                <View style={styles.skillsContainer}>
                {skillsList.map((skill, index) => (
                    <Text key={index} style={styles.skillBadge}>{skill}</Text>
                ))}
                </View>
            </View>
            )}

            {languagesList.length > 0 && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Languages</Text>
                <View style={styles.skillsContainer}>
                {languagesList.map((lang, index) => (
                    <Text key={index} style={styles.skillBadge}>{lang}</Text>
                ))}
                </View>
            </View>
            )}
        </View>
        <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
            fixed
        />
    </Page>
  );
};


const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: 'Helvetica',
      fontSize: 11,
      lineHeight: 1.5,
    },
    container: {
      padding: 10,
    },
    header: {
        marginBottom: 20,
        textAlign: 'right'
    },
    headerText: {
        fontSize: 12,
        color: 'grey',
    },
    identityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    photoBox: {
        width: 100,
        height: 100,
        marginRight: 20,
        border: '1px solid #E5E7EB',
        borderRadius: 4,
        padding: 5,
    },
    photo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    nameAndTitle: {
      flex: 1,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    title: {
      fontSize: 16,
      color: 'grey',
    },
    contactInfo: {
        fontSize: 11,
    },
    link: {
      fontSize: 11,
      color: 'blue',
      textDecoration: 'underline',
    },
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 5,
      borderBottom: '1px solid #E5E7EB',
      paddingBottom: 2,
    },
    text: {
      fontSize: 11,
      textAlign: 'justify'
    },
    listItem: {
      fontSize: 11,
      marginBottom: 3,
    },
    skillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    skillBadge: {
      backgroundColor: '#E5E7EB',
      color: '#374151',
      padding: '3px 8px',
      borderRadius: 4,
      marginRight: 5,
      marginBottom: 5,
      fontSize: 10,
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 10,
        bottom: 10,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'grey',
      },
  });
